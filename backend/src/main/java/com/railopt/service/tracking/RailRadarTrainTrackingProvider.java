package com.railopt.service.tracking;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.railopt.entity.TrainTelemetry;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.http.*;
import org.springframework.stereotype.Component;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.HttpServerErrorException;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestTemplate;

import java.time.Duration;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.concurrent.CompletableFuture;

/**
 * Live train tracking provider integrating with the official RailRadar API.
 * Endpoint: https://api.railradar.in/v1/trains/{number}/live
 * Authentication: Header "x-api-key"
 */
@Component("railRadarTrainTrackingProvider")
@Slf4j
public class RailRadarTrainTrackingProvider implements TrainTrackingProvider {

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;
    private final String apiKey;
    private final String baseUrl;
    private volatile long rateLimitCooldownUntil = 0L;

    public RailRadarTrainTrackingProvider(
            RestTemplateBuilder restTemplateBuilder,
            ObjectMapper objectMapper,
            @Value("${railopt.tracking.railradar.api-key:${RAILRADAR_API_KEY:}}") String apiKey,
            @Value("${railopt.tracking.railradar.base-url:https://api.railradar.in/v1}") String baseUrl) {

        this.restTemplate = restTemplateBuilder
                .setConnectTimeout(Duration.ofSeconds(4))
                .setReadTimeout(Duration.ofSeconds(6))
                .build();
        this.objectMapper = objectMapper;
        this.apiKey = apiKey != null ? apiKey.trim() : "";
        this.baseUrl = baseUrl.endsWith("/") ? baseUrl.substring(0, baseUrl.length() - 1) : baseUrl;
    }

    @Override
    public String getProviderName() {
        return "RAILRADAR";
    }

    @Override
    public boolean isAvailable() {
        return apiKey != null && !apiKey.isEmpty() && !apiKey.equalsIgnoreCase("none");
    }

    @Override
    public Optional<TrainTelemetry> getLiveTrain(String trainNumber) {
        if (!isAvailable()) {
            log.debug("[RailRadar] API key not configured; skipping live fetch for train {}", trainNumber);
            return Optional.empty();
        }

        // RailRadar API only accepts 5-digit Indian Railways passenger train numbers
        if (trainNumber == null || !trainNumber.matches("\\d{5}")) {
            log.debug("[RailRadar] Train {} is not a 5-digit passenger train; skipping RailRadar live query", trainNumber);
            return Optional.empty();
        }

        if (System.currentTimeMillis() < rateLimitCooldownUntil) {
            log.debug("[RailRadar] In rate-limit cool down; skipping external call for train {}", trainNumber);
            return Optional.empty();
        }

        String url = String.format("%s/trains/%s/live", baseUrl, trainNumber);
        HttpHeaders headers = new HttpHeaders();
        headers.set("x-api-key", apiKey);
        headers.setAccept(List.of(MediaType.APPLICATION_JSON));
        HttpEntity<Void> entity = new HttpEntity<>(headers);

        try {
            log.info("[RailRadar] Requesting live tracking for train {}...", trainNumber);
            ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.GET, entity, String.class);

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                return parseRailRadarResponse(trainNumber, response.getBody());
            }

        } catch (HttpClientErrorException.Unauthorized e) {
            log.warn("[RailRadar] 401 Unauthorized: Invalid API Key provided for RailRadar API.");
        } catch (HttpClientErrorException.TooManyRequests e) {
            log.warn("[RailRadar] 429 Too Many Requests: Rate limit exceeded (10 req/min). Cooling down for 60s.");
            rateLimitCooldownUntil = System.currentTimeMillis() + 60_000L;
        } catch (HttpClientErrorException.NotFound e) {
            log.info("[RailRadar] 404: Train {} not found in RailRadar active tracking registry.", trainNumber);
        } catch (HttpClientErrorException e) {
            log.warn("[RailRadar] Client error for train {}: status={}, message={}", trainNumber, e.getStatusCode(), e.getMessage());
        } catch (HttpServerErrorException e) {
            log.error("[RailRadar] Server error from RailRadar: status={}", e.getStatusCode());
        } catch (ResourceAccessException e) {
            log.warn("[RailRadar] Connection timeout/unreachable: {}", e.getMessage());
        } catch (Exception e) {
            log.error("[RailRadar] Unexpected error fetching train {}: {}", trainNumber, e.getMessage(), e);
        }

        return Optional.empty();
    }

    @Override
    public List<TrainTelemetry> getLiveTrains(List<String> trainNumbers) {
        List<TrainTelemetry> result = new ArrayList<>();
        if (trainNumbers == null || trainNumbers.isEmpty() || !isAvailable()) {
            return result;
        }

        if (System.currentTimeMillis() < rateLimitCooldownUntil) {
            log.info("[RailRadar] In rate-limit cool down period. Skipping external batch fetch.");
            return result;
        }

        // Filter for valid 5-digit train numbers and query up to 8 trains per batch to respect 10 req/min limit
        List<String> validNumbers = trainNumbers.stream()
                .filter(tn -> tn != null && tn.matches("\\d{5}"))
                .limit(8)
                .toList();

        // Parallel fetch — simultaneously up to 8 trains
        List<CompletableFuture<Optional<TrainTelemetry>>> futures = validNumbers.stream()
                .map(trainNo -> CompletableFuture.supplyAsync(() -> getLiveTrain(trainNo)))
                .toList();

        for (CompletableFuture<Optional<TrainTelemetry>> future : futures) {
            try {
                future.join().ifPresent(result::add);
            } catch (Exception e) {
                log.warn("[RailRadar] Parallel fetch error: {}", e.getMessage());
            }
        }
        return result;
    }

    /**
     * Parse verified RailRadar JSON response into TrainTelemetry entity.
     */
    public Optional<TrainTelemetry> parseRailRadarResponse(String requestedTrainNo, String json) {
        try {
            JsonNode root = objectMapper.readTree(json);
            if (!root.path("success").asBoolean(false)) {
                String errorMsg = root.path("error").path("message").asText("Unknown error");
                log.warn("[RailRadar] API returned success=false for train {}: {}", requestedTrainNo, errorMsg);
                return Optional.empty();
            }

            JsonNode data = root.path("data");
            if (data.isMissingNode() || data.isNull()) {
                return Optional.empty();
            }

            String trainNo = data.path("trainNumber").asText(requestedTrainNo);
            String trainName = data.path("trainName").asText("Express");
            int delayMinutes = data.path("delayMinutes").asInt(0);
            String status = data.path("status").asText("running").toUpperCase();

            // Train metadata object
            JsonNode trainNode = data.path("train");
            String trainType = trainNode.path("category").asText(trainNode.path("type").asText("EXPRESS"));

            // Current Location object
            JsonNode currentLoc = data.path("currentLocation");
            String stationCode = currentLoc.path("stationCode").asText("");
            double speedKmh = currentLoc.path("speedKmh").asDouble(0.0);
            int bearing = currentLoc.path("bearingDegrees").asInt(0);
            String locStatus = currentLoc.path("status").asText(status).toUpperCase();

            // Next halt
            JsonNode nextHalt = data.path("nextHalt");
            String nextStationCode = nextHalt.path("stationCode").asText("");
            String nextStationName = nextHalt.path("stationName").asText("");

            // Previous halt
            JsonNode prevHalt = data.path("previousHalt");
            String prevStationCode = prevHalt.path("stationCode").asText("");
            String prevStationName = prevHalt.path("stationName").asText("");

            // Attempt to find actual lat/lng from current route station stops
            Double lat = null;
            Double lng = null;
            boolean isGpsAvailable = false;

            JsonNode routeArray = data.path("route");
            if (routeArray.isArray()) {
                for (JsonNode stop : routeArray) {
                    if (stationCode.equalsIgnoreCase(stop.path("stationCode").asText(""))) {
                        if (stop.hasNonNull("lat") && stop.hasNonNull("lng")) {
                            lat = stop.path("lat").asDouble();
                            lng = stop.path("lng").asDouble();
                            isGpsAvailable = true;
                            break;
                        }
                    }
                }
            }

            // Parse timestamp if present
            LocalDateTime providerTimestamp = LocalDateTime.now();
            if (data.hasNonNull("lastUpdatedAt")) {
                try {
                    providerTimestamp = LocalDateTime.parse(data.path("lastUpdatedAt").asText(), DateTimeFormatter.ISO_DATE_TIME);
                } catch (Exception ignored) {}
            }

            TrainTelemetry telemetry = TrainTelemetry.builder()
                    .id("TEL-" + trainNo)
                    .trainNumber(trainNo)
                    .trainName(trainName)
                    .trainType(trainType)
                    .latitude(lat)
                    .longitude(lng)
                    .speedKmh(speedKmh)
                    .bearingDegrees(bearing)
                    .direction(bearing > 180 ? "DN" : "UP")
                    .currentStation(stationCode)
                    .currentStationName(!stationCode.isEmpty() ? stationCode + " Station" : "")
                    .nextStation(nextStationCode)
                    .nextStationName(nextStationName)
                    .currentSection(!stationCode.isEmpty() && !nextStationCode.isEmpty()
                            ? stationCode + "-" + nextStationCode
                            : "ON_LINE")
                    .matchedSection(!stationCode.isEmpty() && !nextStationCode.isEmpty()
                            ? stationCode + "-" + nextStationCode
                            : null)
                    .delayMinutes(delayMinutes)
                    .status(locStatus)
                    .dataSource("RAILRADAR")
                    .freshness("LIVE")
                    .routeMatchStatus("MATCHED")
                    .isGpsAvailable(isGpsAvailable)
                    .providerTimestamp(providerTimestamp)
                    .lastUpdatedAt(providerTimestamp)
                    .fetchedAt(LocalDateTime.now())
                    .build();

            return Optional.of(telemetry);

        } catch (Exception e) {
            log.error("[RailRadar] Failed to parse response for train {}: {}", requestedTrainNo, e.getMessage());
            return Optional.empty();
        }
    }
}

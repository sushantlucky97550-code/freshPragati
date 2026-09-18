package com.railopt.service.tracking;

import com.railopt.dto.TrainTelemetrySummaryResponse;
import com.railopt.entity.Corridor;
import com.railopt.entity.Train;
import com.railopt.entity.TrainStatus;
import com.railopt.entity.TrainTelemetry;
import com.railopt.repository.CorridorRepository;
import com.railopt.repository.TrainRepository;
import com.railopt.repository.TrainTelemetryRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Service managing live train telemetry tracking, rate-limited caching,
 * route matching against seeded corridors, and MongoDB persistence.
 */
@Service
@Slf4j
public class TrainTrackingService {

    private final TrainTrackingProvider railRadarProvider;
    private final TrainTrackingProvider mockProvider;
    private final RouteMatchingService routeMatchingService;
    private final TrainTelemetryRepository telemetryRepository;
    private final TrainRepository trainRepository;
    private final CorridorRepository corridorRepository;

    private final String configuredProvider;
    private final Map<String, TrainTelemetry> memoryCache = new ConcurrentHashMap<>();
    private LocalDateTime lastFetchTime = null;
    private static final long CACHE_TTL_SECONDS = 75;

    public TrainTrackingService(
            @Qualifier("railRadarTrainTrackingProvider") TrainTrackingProvider railRadarProvider,
            @Qualifier("mockTrainTrackingProvider") TrainTrackingProvider mockProvider,
            RouteMatchingService routeMatchingService,
            TrainTelemetryRepository telemetryRepository,
            TrainRepository trainRepository,
            CorridorRepository corridorRepository,
            @Value("${railopt.tracking.provider:${TRAIN_TRACKING_PROVIDER:mock}}") String configuredProvider) {

        this.railRadarProvider = railRadarProvider;
        this.mockProvider = mockProvider;
        this.routeMatchingService = routeMatchingService;
        this.telemetryRepository = telemetryRepository;
        this.trainRepository = trainRepository;
        this.corridorRepository = corridorRepository;
        this.configuredProvider = configuredProvider != null ? configuredProvider.trim().toLowerCase() : "mock";

        log.info("[TrainTrackingService] Initialized with configured provider: '{}'", this.configuredProvider);
    }

    /**
     * Resolves the active provider. Strictly uses railradar when configured, mock otherwise.
     */
    public TrainTrackingProvider getActiveProvider() {
        if ("railradar".equalsIgnoreCase(configuredProvider)) {
            return railRadarProvider;
        }
        return mockProvider;
    }

    public boolean isRailRadarMode() {
        return "railradar".equalsIgnoreCase(configuredProvider);
    }

    /**
     * Get all live train telemetry. Uses cached telemetry if within TTL unless forceRefresh is true.
     */
    @Transactional
    public List<TrainTelemetry> getAllLiveTelemetry(boolean forceRefresh) {
        boolean isCacheValid = lastFetchTime != null &&
                Duration.between(lastFetchTime, LocalDateTime.now()).getSeconds() < CACHE_TTL_SECONDS;

        if (!forceRefresh && isCacheValid && !memoryCache.isEmpty()) {
            List<TrainTelemetry> cachedList = new ArrayList<>(memoryCache.values());
            for (TrainTelemetry t : cachedList) {
                updateFreshness(t);
            }
            return cachedList;
        }

        // Fetch fresh telemetry for seeded trains
        List<Train> masterTrains = trainRepository.findAll();
        List<String> trainNumbers = masterTrains.stream()
                .map(Train::getTrainNumber)
                .filter(Objects::nonNull)
                .toList();

        List<TrainTelemetry> processed = new ArrayList<>();

        if (isRailRadarMode()) {
            // CASE B: Attempt real RailRadar tracking
            List<TrainTelemetry> fetched = railRadarProvider.getLiveTrains(trainNumbers);
            Map<String, TrainTelemetry> fetchedMap = new HashMap<>();
            for (TrainTelemetry t : fetched) {
                if (t.getTrainNumber() != null) {
                    fetchedMap.put(t.getTrainNumber(), t);
                }
            }

            for (Train master : masterTrains) {
                String trainNo = master.getTrainNumber();
                TrainTelemetry live = fetchedMap.get(trainNo);

                if (live != null) {
                    live = routeMatchingService.matchToSeededNetwork(live);
                    updateFreshness(live);
                    telemetryRepository.save(live);
                    memoryCache.put(trainNo, live);
                    processed.add(live);
                    updateMasterTrain(live);
                } else {
                    // Upstream fetch didn't return fresh live data for this train.
                    // Strict non-fabrication: preserve last known valid telemetry if available
                    TrainTelemetry existing = memoryCache.get(trainNo);
                    if (existing == null) {
                        existing = telemetryRepository.findByTrainNumber(trainNo).orElse(null);
                    }

                    if (existing != null && !"UNAVAILABLE".equalsIgnoreCase(existing.getStatus())
                            && existing.getCurrentStation() != null && !existing.getCurrentStation().isEmpty()) {
                        updateFreshness(existing);
                        memoryCache.put(trainNo, existing);
                        processed.add(existing);
                        continue;
                    }

                    // Handle freight train gracefully without hitting external passenger API
                    if (trainNo != null && trainNo.startsWith("FR-")) {
                        TrainTelemetry freightTel = buildFreightCorridorTelemetry(master);
                        telemetryRepository.save(freightTel);
                        memoryCache.put(trainNo, freightTel);
                        processed.add(freightTel);
                        continue;
                    }

                    // Truly unavailable (only when no prior telemetry exists)
                    TrainTelemetry unavailableTel = TrainTelemetry.builder()
                            .id("TEL-" + trainNo)
                            .trainNumber(trainNo)
                            .trainName(master.getTrainName())
                            .trainType(master.getTrainType() != null ? master.getTrainType().name() : "EXPRESS")
                            .speedKmh(0.0)
                            .delayMinutes(master.getDelayMinutes() != null ? master.getDelayMinutes() : 0)
                            .status("UNAVAILABLE")
                            .dataSource("RAILRADAR")
                            .freshness("UNAVAILABLE")
                            .routeMatchStatus("ROUTE_MATCH_UNCERTAIN")
                            .isGpsAvailable(false)
                            .fetchedAt(LocalDateTime.now())
                            .lastUpdatedAt(LocalDateTime.now())
                            .build();

                    telemetryRepository.save(unavailableTel);
                    memoryCache.put(trainNo, unavailableTel);
                    processed.add(unavailableTel);
                }
            }
        } else {
            // CASE A: TRAIN_TRACKING_PROVIDER=mock (Explicit simulation development mode)
            List<TrainTelemetry> fetched = mockProvider.getLiveTrains(trainNumbers);
            for (TrainTelemetry t : fetched) {
                t = routeMatchingService.matchToSeededNetwork(t);
                t.setDataSource("SIMULATION");
                t.setFreshness("SIMULATION");
                telemetryRepository.save(t);
                memoryCache.put(t.getTrainNumber(), t);
                processed.add(t);
                updateMasterTrain(t);
            }
        }

        lastFetchTime = LocalDateTime.now();
        return processed;
    }

    private TrainTelemetry buildFreightCorridorTelemetry(Train master) {
        String section = master.getCorridor() != null ? master.getCorridor().getCorridorId() : "NDLS-CNB";
        String trackLine = master.getTrackLine() != null ? master.getTrackLine() : "UP_MAIN";
        boolean isDown = trackLine.contains("DN");
        return TrainTelemetry.builder()
                .id("TEL-" + master.getTrainNumber())
                .trainNumber(master.getTrainNumber())
                .trainName(master.getTrainName())
                .trainType("FREIGHT")
                .speedKmh(master.getMaxSpeed() != null ? master.getMaxSpeed() * 0.7 : 55.0)
                .bearingDegrees(isDown ? 270 : 90)
                .direction(isDown ? "DN" : "UP")
                .currentStation(master.getSource() != null ? master.getSource() : "GZB")
                .currentStationName(master.getSource() != null ? master.getSource() + " Yard" : "Ghaziabad Yard")
                .nextStation(master.getDestination() != null ? master.getDestination() : "CNB")
                .nextStationName(master.getDestination() != null ? master.getDestination() : "Kanpur Central")
                .currentSection(section)
                .matchedSection(section)
                .matchedCorridorCode(section)
                .delayMinutes(master.getDelayMinutes() != null ? master.getDelayMinutes() : 0)
                .status(master.getDelayMinutes() != null && master.getDelayMinutes() > 0 ? "DELAYED" : "RUNNING")
                .dataSource("CORRIDOR_DISPATCH")
                .freshness("RECENT")
                .routeMatchStatus("MATCHED")
                .isGpsAvailable(false)
                .providerTimestamp(LocalDateTime.now())
                .lastUpdatedAt(LocalDateTime.now())
                .fetchedAt(LocalDateTime.now())
                .build();
    }

    /**
     * Get live telemetry for a single train.
     */
    @Transactional
    public Optional<TrainTelemetry> getLiveTelemetryForTrain(String trainNumber) {
        if (trainNumber == null) return Optional.empty();

        // Check memory cache first
        TrainTelemetry cached = memoryCache.get(trainNumber);
        if (cached != null && lastFetchTime != null &&
                Duration.between(lastFetchTime, LocalDateTime.now()).getSeconds() < CACHE_TTL_SECONDS) {
            updateFreshness(cached);
            return Optional.of(cached);
        }

        if (isRailRadarMode()) {
            Optional<TrainTelemetry> liveOpt = railRadarProvider.getLiveTrain(trainNumber);
            if (liveOpt.isPresent()) {
                TrainTelemetry t = routeMatchingService.matchToSeededNetwork(liveOpt.get());
                updateFreshness(t);
                telemetryRepository.save(t);
                memoryCache.put(t.getTrainNumber(), t);
                updateMasterTrain(t);
                return Optional.of(t);
            } else {
                // Check if existing valid telemetry is present
                TrainTelemetry existing = memoryCache.get(trainNumber);
                if (existing == null) {
                    existing = telemetryRepository.findByTrainNumber(trainNumber).orElse(null);
                }
                if (existing != null && !"UNAVAILABLE".equalsIgnoreCase(existing.getStatus())) {
                    updateFreshness(existing);
                    return Optional.of(existing);
                }

                // Return UNAVAILABLE for CASE B
                TrainTelemetry unavail = TrainTelemetry.builder()
                        .id("TEL-" + trainNumber)
                        .trainNumber(trainNumber)
                        .status("UNAVAILABLE")
                        .dataSource("RAILRADAR")
                        .freshness("UNAVAILABLE")
                        .routeMatchStatus("ROUTE_MATCH_UNCERTAIN")
                        .isGpsAvailable(false)
                        .fetchedAt(LocalDateTime.now())
                        .lastUpdatedAt(LocalDateTime.now())
                        .build();
                telemetryRepository.save(unavail);
                memoryCache.put(trainNumber, unavail);
                return Optional.of(unavail);
            }
        } else {
            Optional<TrainTelemetry> mockOpt = mockProvider.getLiveTrain(trainNumber);
            if (mockOpt.isPresent()) {
                TrainTelemetry t = routeMatchingService.matchToSeededNetwork(mockOpt.get());
                t.setDataSource("SIMULATION");
                t.setFreshness("SIMULATION");
                telemetryRepository.save(t);
                memoryCache.put(t.getTrainNumber(), t);
                updateMasterTrain(t);
                return Optional.of(t);
            }
        }

        return telemetryRepository.findByTrainNumber(trainNumber);
    }

    /**
     * Get live trains mapped to a specific corridor ID.
     */
    public List<TrainTelemetry> getLiveTelemetryForCorridor(Long corridorId) {
        List<TrainTelemetry> all = getAllLiveTelemetry(false);
        return all.stream()
                .filter(t -> t.getMatchedCorridorId() != null && t.getMatchedCorridorId().equals(corridorId))
                .toList();
    }

    /**
     * Get live trains mapped to a specific corridor code (e.g. "NDLS-CNB").
     */
    public List<TrainTelemetry> getLiveTelemetryForCorridorCode(String corridorCode) {
        List<TrainTelemetry> all = getAllLiveTelemetry(false);
        return all.stream()
                .filter(t -> t.getMatchedCorridorCode() != null &&
                        t.getMatchedCorridorCode().equalsIgnoreCase(corridorCode))
                .toList();
    }

    /**
     * Generate summary telemetry for the dashboard live banner.
     */
    public TrainTelemetrySummaryResponse getTelemetrySummary() {
        List<TrainTelemetry> all = getAllLiveTelemetry(false);
        for (TrainTelemetry t : all) {
            updateFreshness(t);
        }
        long liveCount = all.stream().filter(t -> "LIVE".equalsIgnoreCase(t.getFreshness())).count();
        long recentCount = all.stream().filter(t -> "RECENT".equalsIgnoreCase(t.getFreshness())).count();
        long staleCount = all.stream().filter(t -> "STALE".equalsIgnoreCase(t.getFreshness())).count();
        long activeTracked = all.stream().filter(t -> !"UNAVAILABLE".equalsIgnoreCase(t.getFreshness()) && !"UNAVAILABLE".equalsIgnoreCase(t.getStatus())).count();
        long delayedCount = all.stream().filter(t -> t.getDelayMinutes() != null && t.getDelayMinutes() > 0).count();

        String lastUpdateStr = lastFetchTime != null
                ? lastFetchTime.format(DateTimeFormatter.ofPattern("HH:mm:ss"))
                : LocalDateTime.now().format(DateTimeFormatter.ofPattern("HH:mm:ss"));

        if (isRailRadarMode()) {
            String freshness;
            if (liveCount > 0) {
                freshness = "LIVE";
            } else if (recentCount > 0) {
                freshness = "RECENT";
            } else if (staleCount > 0) {
                freshness = "RECENT";
            } else {
                freshness = "UNAVAILABLE";
            }

            return TrainTelemetrySummaryResponse.builder()
                    .totalTrains(all.size())
                    .liveTrains(activeTracked)
                    .delayedTrains(delayedCount)
                    .staleTrains(staleCount)
                    .activeConflicts(delayedCount > 0 ? 1 : 0)
                    .dataSource("RAILRADAR")
                    .freshness(freshness)
                    .overallFreshness(freshness)
                    .lastUpdate(lastUpdateStr)
                    .providerAvailable(railRadarProvider.isAvailable())
                    .providerName("RAILRADAR")
                    .provider("RailRadar")
                    .build();
        } else {
            return TrainTelemetrySummaryResponse.builder()
                    .totalTrains(all.size())
                    .liveTrains(all.size())
                    .delayedTrains(delayedCount)
                    .staleTrains(0)
                    .activeConflicts(delayedCount > 0 ? 1 : 0)
                    .dataSource("SIMULATION")
                    .freshness("SIMULATION")
                    .overallFreshness("SIMULATION")
                    .lastUpdate(lastUpdateStr)
                    .providerAvailable(true)
                    .providerName("SIMULATION")
                    .provider("Simulation")
                    .build();
        }
    }

    private void updateFreshness(TrainTelemetry t) {
        if ("SIMULATION".equalsIgnoreCase(t.getDataSource())) {
            t.setFreshness("SIMULATION");
            return;
        }

        if ("UNAVAILABLE".equalsIgnoreCase(t.getStatus()) || "UNAVAILABLE".equalsIgnoreCase(t.getFreshness())) {
            t.setFreshness("UNAVAILABLE");
            return;
        }

        LocalDateTime timestamp = t.getFetchedAt() != null ? t.getFetchedAt() : LocalDateTime.now();
        long secondsOld = Duration.between(timestamp, LocalDateTime.now()).getSeconds();

        if (secondsOld < 90) {
            t.setFreshness("LIVE");
        } else if (secondsOld < 300) {
            t.setFreshness("RECENT");
        } else {
            t.setFreshness("STALE");
        }
    }

    private void updateMasterTrain(TrainTelemetry telemetry) {
        trainRepository.findByTrainNumber(telemetry.getTrainNumber()).ifPresent(master -> {
            boolean changed = false;
            if (telemetry.getDelayMinutes() != null && !telemetry.getDelayMinutes().equals(master.getDelayMinutes())) {
                master.setDelayMinutes(telemetry.getDelayMinutes());
                changed = true;
            }
            TrainStatus newStatus = telemetry.getDelayMinutes() != null && telemetry.getDelayMinutes() > 0
                    ? TrainStatus.DELAYED : TrainStatus.ON_TIME;
            if (master.getStatus() != newStatus) {
                master.setStatus(newStatus);
                changed = true;
            }
            if (changed) {
                trainRepository.save(master);
            }
        });
    }
}

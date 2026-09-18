package com.railopt.service.tracking;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.railopt.entity.TrainTelemetry;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.test.web.client.MockRestServiceServer;
import org.springframework.web.client.RestTemplate;

import java.lang.reflect.Field;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.*;
import static org.springframework.test.web.client.response.MockRestResponseCreators.*;

@DisplayName("RailRadar Tracking Provider Unit Tests")
class RailRadarTrainTrackingProviderTest {

    private RestTemplate restTemplate;
    private MockRestServiceServer mockServer;
    private ObjectMapper objectMapper;
    private RailRadarTrainTrackingProvider provider;

    private final String validResponseJson = """
        {
          "success": true,
          "data": {
            "trainNumber": "12301",
            "trainName": "Howrah Rajdhani Express",
            "startDate": "2026-09-13",
            "lastUpdatedAt": "2026-09-13T11:45:00",
            "status": "running",
            "delayMinutes": 14,
            "train": {
              "number": "12301",
              "name": "Howrah Rajdhani Express",
              "type": "Rajdhani",
              "category": "PREMIUM",
              "maxSpeed": 130
            },
            "currentLocation": {
              "stationCode": "ALJN",
              "sequence": 3,
              "status": "departed",
              "isHalt": true,
              "segmentProgress": 0.55,
              "speedKmh": 118.5,
              "bearingDegrees": 120
            },
            "previousHalt": {
              "stationCode": "GZB",
              "stationName": "Ghaziabad",
              "sequence": 2
            },
            "nextHalt": {
              "stationCode": "TDL",
              "stationName": "Tundla",
              "sequence": 4
            },
            "route": [
              {
                "sequence": 3,
                "stationCode": "ALJN",
                "stationName": "Aligarh",
                "lat": 27.8974,
                "lng": 78.0880
              }
            ]
          }
        }
        """;

    @BeforeEach
    void setUp() throws Exception {
        objectMapper = new ObjectMapper();
        RestTemplateBuilder builder = new RestTemplateBuilder();
        provider = new RailRadarTrainTrackingProvider(builder, objectMapper, "test-valid-api-key", "https://api.railradar.in/v1");

        // Extract RestTemplate from provider using reflection to bind MockRestServiceServer
        Field rtField = RailRadarTrainTrackingProvider.class.getDeclaredField("restTemplate");
        rtField.setAccessible(true);
        restTemplate = (RestTemplate) rtField.get(provider);
        mockServer = MockRestServiceServer.createServer(restTemplate);
    }

    @Test
    @DisplayName("Successfully parses RailRadar JSON response into TrainTelemetry")
    void testGetLiveTrain_Success() {
        mockServer.expect(requestTo("https://api.railradar.in/v1/trains/12301/live"))
                .andExpect(method(HttpMethod.GET))
                .andExpect(header("x-api-key", "test-valid-api-key"))
                .andRespond(withSuccess(validResponseJson, MediaType.APPLICATION_JSON));

        Optional<TrainTelemetry> resultOpt = provider.getLiveTrain("12301");

        mockServer.verify();
        assertThat(resultOpt).isPresent();
        TrainTelemetry tel = resultOpt.get();
        assertThat(tel.getTrainNumber()).isEqualTo("12301");
        assertThat(tel.getTrainName()).isEqualTo("Howrah Rajdhani Express");
        assertThat(tel.getSpeedKmh()).isEqualTo(118.5);
        assertThat(tel.getBearingDegrees()).isEqualTo(120);
        assertThat(tel.getCurrentStation()).isEqualTo("ALJN");
        assertThat(tel.getNextStation()).isEqualTo("TDL");
        assertThat(tel.getDelayMinutes()).isEqualTo(14);
        assertThat(tel.getDataSource()).isEqualTo("RAILRADAR");
        assertThat(tel.getFreshness()).isEqualTo("LIVE");
        assertThat(tel.getLatitude()).isEqualTo(27.8974);
        assertThat(tel.getLongitude()).isEqualTo(78.0880);
        assertThat(tel.getIsGpsAvailable()).isTrue();
    }

    @Test
    @DisplayName("Handles 401 Unauthorized gracefully without throwing exception")
    void testGetLiveTrain_Unauthorized() {
        mockServer.expect(requestTo("https://api.railradar.in/v1/trains/12301/live"))
                .andExpect(method(HttpMethod.GET))
                .andRespond(withStatus(HttpStatus.UNAUTHORIZED).body("{\"success\":false,\"error\":{\"code\":\"UNAUTHORIZED\",\"message\":\"Invalid API Key\"}}"));

        Optional<TrainTelemetry> resultOpt = provider.getLiveTrain("12301");

        mockServer.verify();
        assertThat(resultOpt).isEmpty();
    }

    @Test
    @DisplayName("Handles 404 Not Found gracefully")
    void testGetLiveTrain_NotFound() {
        mockServer.expect(requestTo("https://api.railradar.in/v1/trains/99999/live"))
                .andExpect(method(HttpMethod.GET))
                .andRespond(withStatus(HttpStatus.NOT_FOUND));

        Optional<TrainTelemetry> resultOpt = provider.getLiveTrain("99999");

        mockServer.verify();
        assertThat(resultOpt).isEmpty();
    }

    @Test
    @DisplayName("Handles server error (500) gracefully")
    void testGetLiveTrain_ServerError() {
        mockServer.expect(requestTo("https://api.railradar.in/v1/trains/12301/live"))
                .andExpect(method(HttpMethod.GET))
                .andRespond(withServerError());

        Optional<TrainTelemetry> resultOpt = provider.getLiveTrain("12301");

        mockServer.verify();
        assertThat(resultOpt).isEmpty();
    }

    @Test
    @DisplayName("Handles missing GPS coordinates safely")
    void testParseRailRadar_MissingGps() {
        String jsonWithoutRoute = """
            {
              "success": true,
              "data": {
                "trainNumber": "22436",
                "trainName": "Vande Bharat Express",
                "delayMinutes": 0,
                "currentLocation": {
                  "stationCode": "CNB",
                  "speedKmh": 0.0
                }
              }
            }
            """;

        Optional<TrainTelemetry> resultOpt = provider.parseRailRadarResponse("22436", jsonWithoutRoute);
        assertThat(resultOpt).isPresent();
        TrainTelemetry tel = resultOpt.get();
        assertThat(tel.getTrainNumber()).isEqualTo("22436");
        assertThat(tel.getCurrentStation()).isEqualTo("CNB");
        assertThat(tel.getLatitude()).isNull();
        assertThat(tel.getLongitude()).isNull();
        assertThat(tel.getIsGpsAvailable()).isFalse();
    }

    @Test
    @DisplayName("Handles missing speed safely without crashing")
    void testParseRailRadar_MissingSpeed() {
        String jsonWithoutSpeed = """
            {
              "success": true,
              "data": {
                "trainNumber": "12004",
                "trainName": "Lucknow Shatabdi",
                "delayMinutes": 5,
                "currentLocation": {
                  "stationCode": "GZB"
                }
              }
            }
            """;

        Optional<TrainTelemetry> resultOpt = provider.parseRailRadarResponse("12004", jsonWithoutSpeed);
        assertThat(resultOpt).isPresent();
        TrainTelemetry tel = resultOpt.get();
        assertThat(tel.getTrainNumber()).isEqualTo("12004");
        assertThat(tel.getCurrentStation()).isEqualTo("GZB");
        assertThat(tel.getSpeedKmh()).isEqualTo(0.0);
    }

    @Test
    @DisplayName("Handles missing station safely without crashing")
    void testParseRailRadar_MissingStation() {
        String jsonWithoutStation = """
            {
              "success": true,
              "data": {
                "trainNumber": "12417",
                "trainName": "Prayagraj Express",
                "delayMinutes": 0,
                "currentLocation": {
                  "speedKmh": 110.0
                }
              }
            }
            """;

        Optional<TrainTelemetry> resultOpt = provider.parseRailRadarResponse("12417", jsonWithoutStation);
        assertThat(resultOpt).isPresent();
        TrainTelemetry tel = resultOpt.get();
        assertThat(tel.getTrainNumber()).isEqualTo("12417");
        assertThat(tel.getCurrentStation()).isEmpty();
        assertThat(tel.getSpeedKmh()).isEqualTo(110.0);
    }

    @Test
    @DisplayName("Handles network timeout gracefully")
    void testGetLiveTrain_Timeout() {
        mockServer.expect(requestTo("https://api.railradar.in/v1/trains/12301/live"))
                .andExpect(method(HttpMethod.GET))
                .andRespond(withException(new java.net.SocketTimeoutException("Read timed out")));

        Optional<TrainTelemetry> resultOpt = provider.getLiveTrain("12301");

        mockServer.verify();
        assertThat(resultOpt).isEmpty();
    }
}

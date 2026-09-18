package com.railopt.service.tracking;

import com.railopt.entity.Corridor;
import com.railopt.entity.CorridorStation;
import com.railopt.entity.Train;
import com.railopt.entity.TrainTelemetry;
import com.railopt.repository.CorridorRepository;
import com.railopt.repository.TrainRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@DisplayName("Route Matching Service Unit Tests")
class RouteMatchingServiceTest {

    @Mock
    private CorridorRepository corridorRepository;

    @Mock
    private TrainRepository trainRepository;

    @InjectMocks
    private RouteMatchingService routeMatchingService;

    private Corridor ndlsCnb;

    @BeforeEach
    void setUp() {
        ndlsCnb = Corridor.builder()
                .id(1L)
                .corridorId("NDLS-CNB")
                .name("Delhi – Kanpur Main Line")
                .fromStation("NDLS")
                .toStation("CNB")
                .stations(List.of(
                        CorridorStation.builder().stationCode("NDLS").km(0).build(),
                        CorridorStation.builder().stationCode("GZB").km(26).build(),
                        CorridorStation.builder().stationCode("ALJN").km(126).build(),
                        CorridorStation.builder().stationCode("TDL").km(206).build(),
                        CorridorStation.builder().stationCode("CNB").km(440).build()
                ))
                .build();
    }

    @Test
    @DisplayName("Matches train with master assigned corridor")
    void testMatch_WithMasterTrainCorridor() {
        when(corridorRepository.findAll()).thenReturn(List.of(ndlsCnb));
        when(trainRepository.findByTrainNumber("12301")).thenReturn(Optional.of(
                Train.builder().trainNumber("12301").corridor(ndlsCnb).build()
        ));

        TrainTelemetry raw = TrainTelemetry.builder()
                .trainNumber("12301")
                .currentStation("ALJN")
                .nextStation("TDL")
                .build();

        TrainTelemetry matched = routeMatchingService.matchToSeededNetwork(raw);

        assertThat(matched.getRouteMatchStatus()).isEqualTo("MATCHED");
        assertThat(matched.getMatchedCorridorId()).isEqualTo(1L);
        assertThat(matched.getMatchedCorridorCode()).isEqualTo("NDLS-CNB");
        assertThat(matched.getCurrentSection()).isEqualTo("ALJN-TDL");
    }

    @Test
    @DisplayName("Matches uncataloged train to corridor by station codes")
    void testMatch_ByStationCodes() {
        when(corridorRepository.findAll()).thenReturn(List.of(ndlsCnb));
        when(trainRepository.findByTrainNumber("12999")).thenReturn(Optional.empty());

        TrainTelemetry raw = TrainTelemetry.builder()
                .trainNumber("12999")
                .currentStation("TDL")
                .nextStation("CNB")
                .build();

        TrainTelemetry matched = routeMatchingService.matchToSeededNetwork(raw);

        assertThat(matched.getRouteMatchStatus()).isEqualTo("MATCHED");
        assertThat(matched.getMatchedCorridorId()).isEqualTo(1L);
        assertThat(matched.getMatchedCorridorCode()).isEqualTo("NDLS-CNB");
        assertThat(matched.getCurrentSection()).isEqualTo("TDL-CNB");
    }

    @Test
    @DisplayName("Marks ROUTE_MATCH_UNCERTAIN when stations are outside seeded network without GPS")
    void testMatch_UncertainRoute() {
        when(corridorRepository.findAll()).thenReturn(List.of(ndlsCnb));
        when(trainRepository.findByTrainNumber("12999")).thenReturn(Optional.empty());

        TrainTelemetry raw = TrainTelemetry.builder()
                .trainNumber("12999")
                .currentStation("BCT")
                .nextStation("BRC")
                .build();

        TrainTelemetry matched = routeMatchingService.matchToSeededNetwork(raw);

        assertThat(matched.getRouteMatchStatus()).isEqualTo("ROUTE_MATCH_UNCERTAIN");
        assertThat(matched.getMatchedCorridorId()).isNull();
    }

    @Test
    @DisplayName("Matches train to corridor by GPS proximity coordinates")
    void testMatch_ByGpsProximity() {
        when(corridorRepository.findAll()).thenReturn(List.of(ndlsCnb));
        when(trainRepository.findByTrainNumber("12998")).thenReturn(Optional.empty());

        // Coordinates close to ALJN (27.8974, 78.0880)
        TrainTelemetry raw = TrainTelemetry.builder()
                .trainNumber("12998")
                .latitude(27.9100)
                .longitude(78.0900)
                .build();

        TrainTelemetry matched = routeMatchingService.matchToSeededNetwork(raw);

        assertThat(matched.getRouteMatchStatus()).isEqualTo("MATCHED");
        assertThat(matched.getMatchedCorridorId()).isEqualTo(1L);
        assertThat(matched.getMatchedCorridorCode()).isEqualTo("NDLS-CNB");
    }

    @Test
    @DisplayName("Marks OFF_NETWORK when GPS coordinates are far outside seeded corridors")
    void testMatch_OffNetworkGps() {
        when(corridorRepository.findAll()).thenReturn(List.of(ndlsCnb));
        when(trainRepository.findByTrainNumber("12997")).thenReturn(Optional.empty());

        // Coordinates in Mumbai (18.9696, 72.8193) > 1000 km away
        TrainTelemetry raw = TrainTelemetry.builder()
                .trainNumber("12997")
                .latitude(18.9696)
                .longitude(72.8193)
                .build();

        TrainTelemetry matched = routeMatchingService.matchToSeededNetwork(raw);

        assertThat(matched.getRouteMatchStatus()).isEqualTo("OFF_NETWORK");
        assertThat(matched.getMatchedCorridorId()).isNull();
    }
}

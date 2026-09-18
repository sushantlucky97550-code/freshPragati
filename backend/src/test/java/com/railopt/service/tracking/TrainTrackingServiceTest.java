package com.railopt.service.tracking;

import com.railopt.dto.TrainTelemetrySummaryResponse;
import com.railopt.entity.Corridor;
import com.railopt.entity.Train;
import com.railopt.entity.TrainTelemetry;
import com.railopt.repository.CorridorRepository;
import com.railopt.repository.TrainRepository;
import com.railopt.repository.TrainTelemetryRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("Train Tracking Service Unit Tests")
class TrainTrackingServiceTest {

    @Mock
    private TrainTrackingProvider railRadarProvider;

    @Mock
    private TrainTrackingProvider mockProvider;

    @Mock
    private RouteMatchingService routeMatchingService;

    @Mock
    private TrainTelemetryRepository telemetryRepository;

    @Mock
    private TrainRepository trainRepository;

    @Mock
    private CorridorRepository corridorRepository;

    private TrainTrackingService trackingService;

    @BeforeEach
    void setUp() {
        trackingService = new TrainTrackingService(
                railRadarProvider,
                mockProvider,
                routeMatchingService,
                telemetryRepository,
                trainRepository,
                corridorRepository,
                "mock" // Default to mock provider for test
        );
    }

    @Test
    @DisplayName("Falls back to Mock/Simulation provider when configured as mock")
    void testGetActiveProvider_Mock() {
        assertThat(trackingService.getActiveProvider()).isEqualTo(mockProvider);
    }

    @Test
    @DisplayName("Selects RailRadar provider when available and configured")
    void testGetActiveProvider_RailRadar() {
        TrainTrackingService liveService = new TrainTrackingService(
                railRadarProvider,
                mockProvider,
                routeMatchingService,
                telemetryRepository,
                trainRepository,
                corridorRepository,
                "railradar"
        );

        assertThat(liveService.getActiveProvider()).isEqualTo(railRadarProvider);
    }

    @Test
    @DisplayName("Caches fetched telemetry and avoids excessive provider calls within TTL")
    void testCachingAvoidsDuplicateCalls() {
        Train master = Train.builder().id(1L).trainNumber("12301").trainName("Rajdhani").build();
        when(trainRepository.findAll()).thenReturn(List.of(master));

        TrainTelemetry tel = TrainTelemetry.builder()
                .trainNumber("12301")
                .speedKmh(110.0)
                .delayMinutes(0)
                .dataSource("SIMULATION")
                .freshness("SIMULATION")
                .fetchedAt(LocalDateTime.now())
                .build();

        when(mockProvider.getLiveTrains(List.of("12301"))).thenReturn(List.of(tel));
        when(routeMatchingService.matchToSeededNetwork(any())).thenReturn(tel);

        // First call - triggers fetch
        List<TrainTelemetry> firstCall = trackingService.getAllLiveTelemetry(false);
        assertThat(firstCall).hasSize(1);

        // Second call within TTL - should use cache
        List<TrainTelemetry> secondCall = trackingService.getAllLiveTelemetry(false);
        assertThat(secondCall).hasSize(1);

        // Provider should only be called once
        verify(mockProvider, times(1)).getLiveTrains(any());
    }

    @Test
    @DisplayName("Generates correct telemetry summary response")
    void testGetTelemetrySummary() {
        Train master = Train.builder().id(1L).trainNumber("12301").build();
        when(trainRepository.findAll()).thenReturn(List.of(master));

        TrainTelemetry tel = TrainTelemetry.builder()
                .trainNumber("12301")
                .speedKmh(115.0)
                .delayMinutes(15)
                .dataSource("SIMULATION")
                .freshness("SIMULATION")
                .fetchedAt(LocalDateTime.now())
                .build();

        when(mockProvider.getLiveTrains(any())).thenReturn(List.of(tel));
        when(routeMatchingService.matchToSeededNetwork(any())).thenReturn(tel);

        TrainTelemetrySummaryResponse summary = trackingService.getTelemetrySummary();

        assertThat(summary).isNotNull();
        assertThat(summary.getTotalTrains()).isEqualTo(1);
        assertThat(summary.getDelayedTrains()).isEqualTo(1);
        assertThat(summary.getDataSource()).isEqualTo("SIMULATION");
        assertThat(summary.getFreshness()).isEqualTo("SIMULATION");
        assertThat(summary.isProviderAvailable()).isTrue();
    }

    @Test
    @DisplayName("In RailRadar mode, upstream failure sets UNAVAILABLE without faking simulation data")
    void testRailRadarMode_FailureProducesUnavailable() {
        Train master = Train.builder().id(1L).trainNumber("12301").trainName("Rajdhani").build();
        when(trainRepository.findAll()).thenReturn(List.of(master));

        // RailRadar returns empty (e.g. timeout, 401, or 404)
        when(railRadarProvider.getLiveTrains(any())).thenReturn(List.of());

        TrainTrackingService liveService = new TrainTrackingService(
                railRadarProvider,
                mockProvider,
                routeMatchingService,
                telemetryRepository,
                trainRepository,
                corridorRepository,
                "railradar"
        );

        List<TrainTelemetry> result = liveService.getAllLiveTelemetry(true);

        assertThat(result).hasSize(1);
        TrainTelemetry tel = result.get(0);
        assertThat(tel.getTrainNumber()).isEqualTo("12301");
        assertThat(tel.getDataSource()).isEqualTo("RAILRADAR");
        assertThat(tel.getFreshness()).isEqualTo("UNAVAILABLE");
        assertThat(tel.getStatus()).isEqualTo("UNAVAILABLE");
        verify(mockProvider, never()).getLiveTrains(any());
    }

    @Test
    @DisplayName("Syncs delayMinutes and status to Master Train entity in MongoDB")
    void testSyncsToMasterTrain() {
        Train master = Train.builder().id(1L).trainNumber("12301").delayMinutes(0).build();
        when(trainRepository.findAll()).thenReturn(List.of(master));
        when(trainRepository.findByTrainNumber("12301")).thenReturn(Optional.of(master));

        TrainTelemetry tel = TrainTelemetry.builder()
                .trainNumber("12301")
                .delayMinutes(25)
                .dataSource("SIMULATION")
                .freshness("SIMULATION")
                .fetchedAt(LocalDateTime.now())
                .build();

        when(mockProvider.getLiveTrains(any())).thenReturn(List.of(tel));
        when(routeMatchingService.matchToSeededNetwork(any())).thenReturn(tel);

        trackingService.getAllLiveTelemetry(true);

        assertThat(master.getDelayMinutes()).isEqualTo(25);
        verify(trainRepository, atLeastOnce()).save(master);
        verify(telemetryRepository, atLeastOnce()).save(any());
    }
}

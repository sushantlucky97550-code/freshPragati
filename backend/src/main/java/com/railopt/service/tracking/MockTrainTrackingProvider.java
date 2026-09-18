package com.railopt.service.tracking;

import com.railopt.entity.Corridor;
import com.railopt.entity.CorridorStation;
import com.railopt.entity.Train;
import com.railopt.entity.TrainTelemetry;
import com.railopt.repository.CorridorRepository;
import com.railopt.repository.TrainRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.*;

/**
 * Fallback & local development tracking provider.
 * Simulates real-time movements along the seeded corridors with realistic speeds and section locations.
 * All records produced by this provider are unambiguously marked as dataSource = "SIMULATION".
 */
@Component("mockTrainTrackingProvider")
@RequiredArgsConstructor
@Slf4j
public class MockTrainTrackingProvider implements TrainTrackingProvider {

    private final TrainRepository trainRepository;
    private final CorridorRepository corridorRepository;

    // Station centroid GPS coordinates for realistic mapping
    private static final Map<String, double[]> STATION_COORDS = Map.of(
            "NDLS", new double[]{28.6429, 77.2195},
            "GZB", new double[]{28.6678, 77.4339},
            "ALJN", new double[]{27.8974, 78.0880},
            "TDL", new double[]{27.2069, 78.2435},
            "CNB", new double[]{26.4547, 80.3507},
            "MTJ", new double[]{27.4924, 77.6737},
            "AGC", new double[]{27.1592, 78.0069},
            "FTP", new double[]{25.9284, 80.8128},
            "PRYG", new double[]{25.4484, 81.8340}
    );

    @Override
    public String getProviderName() {
        return "SIMULATION";
    }

    @Override
    public boolean isAvailable() {
        return true;
    }

    @Override
    public Optional<TrainTelemetry> getLiveTrain(String trainNumber) {
        Train master = trainRepository.findAll().stream()
                .filter(t -> t.getTrainNumber().equalsIgnoreCase(trainNumber))
                .findFirst()
                .orElse(null);

        if (master == null) {
            return Optional.empty();
        }

        return Optional.of(buildSimulatedTelemetry(master));
    }

    @Override
    public List<TrainTelemetry> getLiveTrains(List<String> trainNumbers) {
        List<TrainTelemetry> list = new ArrayList<>();
        if (trainNumbers == null || trainNumbers.isEmpty()) {
            trainRepository.findAll().forEach(t -> list.add(buildSimulatedTelemetry(t)));
        } else {
            for (String num : trainNumbers) {
                getLiveTrain(num).ifPresent(list::add);
            }
        }
        return list;
    }

    private TrainTelemetry buildSimulatedTelemetry(Train train) {
        Corridor corridor = train.getCorridor();
        List<CorridorStation> stations = corridor != null ? corridor.getStations() : List.of();

        String currentStation = "ALJN";
        String nextStation = "TDL";
        String currentSection = "ALJN-TDL";
        double[] coords = STATION_COORDS.getOrDefault("ALJN", new double[]{27.8974, 78.0880});

        if (stations.size() >= 2) {
            // Distribute trains realistically across corridor stations based on train hash
            int idx = Math.abs(train.getTrainNumber().hashCode()) % (stations.size() - 1);
            currentStation = stations.get(idx).getStationCode();
            nextStation = stations.get(idx + 1).getStationCode();
            currentSection = currentStation + "-" + nextStation;
            coords = STATION_COORDS.getOrDefault(currentStation, coords);
        }

        boolean isFreight = train.getTrainType() != null && train.getTrainType().name().contains("FREIGHT");
        double simulatedSpeed = isFreight ? 68.0 : 115.0;
        int delay = train.getDelayMinutes() != null ? train.getDelayMinutes() : 0;
        String status = delay > 0 ? "DELAYED" : "ON_TIME";

        return TrainTelemetry.builder()
                .id("TEL-" + train.getTrainNumber())
                .trainNumber(train.getTrainNumber())
                .trainName(train.getTrainName())
                .trainType(train.getTrainType() != null ? train.getTrainType().name() : "EXPRESS")
                .latitude(coords[0])
                .longitude(coords[1])
                .speedKmh(simulatedSpeed)
                .bearingDegrees(train.getTrackLine() != null && train.getTrackLine().contains("DN") ? 225 : 45)
                .direction(train.getTrackLine() != null && train.getTrackLine().contains("DN") ? "DN" : "UP")
                .currentStation(currentStation)
                .currentStationName(currentStation + " Junction")
                .nextStation(nextStation)
                .nextStationName(nextStation + " Junction")
                .currentSection(currentSection)
                .delayMinutes(delay)
                .status(status)
                .dataSource("SIMULATION")
                .freshness("SIMULATION")
                .routeMatchStatus("MATCHED")
                .matchedCorridorId(corridor != null ? corridor.getId() : null)
                .matchedCorridorCode(corridor != null ? corridor.getCorridorId() : null)
                .isGpsAvailable(true)
                .providerTimestamp(LocalDateTime.now())
                .fetchedAt(LocalDateTime.now())
                .build();
    }
}

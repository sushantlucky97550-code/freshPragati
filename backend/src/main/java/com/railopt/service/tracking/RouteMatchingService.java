package com.railopt.service.tracking;

import com.railopt.entity.Corridor;
import com.railopt.entity.CorridorStation;
import com.railopt.entity.Train;
import com.railopt.entity.TrainTelemetry;
import com.railopt.repository.CorridorRepository;
import com.railopt.repository.TrainRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

/**
 * Maps live telemetry from RailRadar to the operational network of seeded corridors and track sections.
 * Evaluates station codes, sequence, and GPS proximity.
 * If match confidence is low, marks 'ROUTE_MATCH_UNCERTAIN' without making false assumptions.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class RouteMatchingService {

    private final CorridorRepository corridorRepository;
    private final TrainRepository trainRepository;

    // Station coordinates mapping for distance validation (Lat, Lng)
    private static final double MAX_GPS_DISTANCE_KM = 35.0; // Distance threshold to consider train on-corridor

    public TrainTelemetry matchToSeededNetwork(TrainTelemetry telemetry) {
        if (telemetry == null) return null;

        List<Corridor> allCorridors = corridorRepository.findAll();

        // 1. Check if train is already mapped in Master Train database
        Optional<Train> masterTrain = trainRepository.findByTrainNumber(telemetry.getTrainNumber());
        if (masterTrain.isPresent() && masterTrain.get().getCorridor() != null) {
            Corridor assignedCorridor = masterTrain.get().getCorridor();
            telemetry.setMatchedCorridorId(assignedCorridor.getId());
            telemetry.setMatchedCorridorCode(assignedCorridor.getCorridorId());
            telemetry.setRouteMatchStatus("MATCHED");

            // Refine current section within assigned corridor
            refineSection(telemetry, assignedCorridor);
            return telemetry;
        }

        // 2. Station-Based Matching: Check if currentStation or nextStation matches any corridor station
        String curr = telemetry.getCurrentStation();
        String next = telemetry.getNextStation();

        Corridor matchedByStation = null;
        for (Corridor c : allCorridors) {
            boolean hasCurr = curr != null && !curr.isEmpty() && hasStation(c, curr);
            boolean hasNext = next != null && !next.isEmpty() && hasStation(c, next);

            if (hasCurr && hasNext) {
                matchedByStation = c;
                break; // Strongest match
            } else if (hasCurr || hasNext) {
                matchedByStation = c;
            }
        }

        if (matchedByStation != null) {
            telemetry.setMatchedCorridorId(matchedByStation.getId());
            telemetry.setMatchedCorridorCode(matchedByStation.getCorridorId());
            telemetry.setRouteMatchStatus("MATCHED");
            refineSection(telemetry, matchedByStation);
            return telemetry;
        }

        // 3. GPS-Based Proximity Matching if coordinates available
        if (telemetry.getLatitude() != null && telemetry.getLongitude() != null) {
            Corridor bestCorridor = null;
            double minDistance = Double.MAX_VALUE;

            for (Corridor c : allCorridors) {
                for (CorridorStation st : c.getStations()) {
                    double[] coords = getKnownStationCoords(st.getStationCode());
                    if (coords != null) {
                        double dist = haversineDistanceKm(
                                telemetry.getLatitude(), telemetry.getLongitude(),
                                coords[0], coords[1]
                        );
                        if (dist < minDistance) {
                            minDistance = dist;
                            bestCorridor = c;
                        }
                    }
                }
            }

            if (bestCorridor != null && minDistance <= MAX_GPS_DISTANCE_KM) {
                telemetry.setMatchedCorridorId(bestCorridor.getId());
                telemetry.setMatchedCorridorCode(bestCorridor.getCorridorId());
                telemetry.setRouteMatchStatus("MATCHED");
                refineSection(telemetry, bestCorridor);
                return telemetry;
            } else if (minDistance > 150.0) {
                telemetry.setRouteMatchStatus("OFF_NETWORK");
                telemetry.setMatchedCorridorId(null);
                telemetry.setMatchedCorridorCode(null);
                log.info("[RouteMatching] Train {} GPS is {} km away from seeded network. Marked OFF_NETWORK.",
                        telemetry.getTrainNumber(), Math.round(minDistance));
                return telemetry;
            }
        }

        // 4. If no reliable match found, check if it's off-network or uncertain
        telemetry.setRouteMatchStatus("ROUTE_MATCH_UNCERTAIN");
        telemetry.setMatchedCorridorId(null);
        telemetry.setMatchedCorridorCode(null);
        log.warn("[RouteMatching] Train {} could not be confidently mapped to seeded corridors. Marked ROUTE_MATCH_UNCERTAIN.",
                telemetry.getTrainNumber());

        return telemetry;
    }

    private boolean hasStation(Corridor corridor, String stationCode) {
        if (corridor.getStations() == null) return false;
        return corridor.getStations().stream()
                .anyMatch(s -> s.getStationCode().equalsIgnoreCase(stationCode));
    }

    private void refineSection(TrainTelemetry telemetry, Corridor corridor) {
        String curr = telemetry.getCurrentStation();
        String next = telemetry.getNextStation();
        String section;

        if (curr != null && !curr.isEmpty() && next != null && !next.isEmpty()) {
            section = curr + "-" + next;
        } else if (curr != null && !curr.isEmpty()) {
            section = curr + " Section";
        } else if (corridor != null) {
            section = corridor.getFromStation() + "-" + corridor.getToStation() + " Main";
        } else {
            section = "MAIN";
        }

        telemetry.setCurrentSection(section);
        telemetry.setMatchedSection(section);
    }

    private double[] getKnownStationCoords(String code) {
        return switch (code.toUpperCase()) {
            case "NDLS" -> new double[]{28.6429, 77.2195};
            case "GZB" -> new double[]{28.6678, 77.4339};
            case "ALJN" -> new double[]{27.8974, 78.0880};
            case "TDL" -> new double[]{27.2069, 78.2435};
            case "CNB" -> new double[]{26.4547, 80.3507};
            case "MTJ" -> new double[]{27.4924, 77.6737};
            case "AGC" -> new double[]{27.1592, 78.0069};
            case "FTP" -> new double[]{25.9284, 80.8128};
            case "PRYG" -> new double[]{25.4484, 81.8340};
            default -> null;
        };
    }

    /**
     * Haversine distance formula between two GPS coordinates in kilometres.
     */
    public static double haversineDistanceKm(double lat1, double lon1, double lat2, double lon2) {
        final int R = 6371; // Earth radius in km
        double latDistance = Math.toRadians(lat2 - lat1);
        double lonDistance = Math.toRadians(lon2 - lon1);
        double a = Math.sin(latDistance / 2) * Math.sin(latDistance / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                * Math.sin(lonDistance / 2) * Math.sin(lonDistance / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }
}

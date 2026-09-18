package com.railopt.dto;

import com.railopt.entity.Corridor;
import com.railopt.entity.CorridorStation;
import com.railopt.entity.CorridorTrack;
import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class CorridorResponse {

    private Long id;
    private String corridorId;
    private String name;
    private String fromStation;
    private String toStation;
    private Integer lengthKm;
    private Integer capacityUtilization;
    private Integer dailyTrains;
    private String zone;
    private String division;
    private String signaling;
    private String traction;
    private Integer speedLimit;
    private String status;
    private List<TrackDto> tracks;
    private List<StationDto> stations;

    @Data
    @Builder
    public static class TrackDto {
        private Long id;
        private String trackCode;
        private String trackName;
        private String direction;
        private String status;
    }

    @Data
    @Builder
    public static class StationDto {
        private String stationCode;
        private String stationName;
        private Integer km;
        private Boolean hasLoops;
        private Integer maxSpeed;
    }

    public static CorridorResponse from(Corridor c) {
        List<TrackDto> tracks = c.getTracks() == null ? List.of() :
                c.getTracks().stream().map(t -> TrackDto.builder()
                        .id(t.getId())
                        .trackCode(t.getTrackCode())
                        .trackName(t.getTrackName())
                        .direction(t.getDirection().name())
                        .status(t.getStatus().name())
                        .build()).toList();

        List<StationDto> stations = c.getStations() == null ? List.of() :
                c.getStations().stream().map(s -> StationDto.builder()
                        .stationCode(s.getStationCode())
                        .stationName(s.getStationName())
                        .km(s.getKm())
                        .hasLoops(s.getHasLoops())
                        .maxSpeed(s.getMaxSpeed())
                        .build()).toList();

        return CorridorResponse.builder()
                .id(c.getId())
                .corridorId(c.getCorridorId())
                .name(c.getName())
                .fromStation(c.getFromStation())
                .toStation(c.getToStation())
                .lengthKm(c.getLengthKm())
                .capacityUtilization(c.getCapacityUtilization())
                .dailyTrains(c.getDailyTrains())
                .zone(c.getZone())
                .division(c.getDivision())
                .signaling(c.getSignaling())
                .traction(c.getTraction())
                .speedLimit(c.getSpeedLimit())
                .status(c.getStatus().name())
                .tracks(tracks)
                .stations(stations)
                .build();
    }
}

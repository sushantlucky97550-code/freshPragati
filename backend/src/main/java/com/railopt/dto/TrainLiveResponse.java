package com.railopt.dto;

import com.railopt.entity.TrainTelemetry;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class TrainLiveResponse {

    private String trainNumber;
    private String trainName;
    private String trainType;
    private Double latitude;
    private Double longitude;
    private Double speedKmh;
    private Integer bearingDegrees;
    private String direction;
    private String currentStation;
    private String currentStationName;
    private String nextStation;
    private String nextStationName;
    private String currentSection;
    private String matchedSection;
    private Integer delayMinutes;
    private String status;
    private String operationalStatus;
    private String dataSource;
    private String freshness;
    private String routeMatchStatus;
    private Long matchedCorridorId;
    private String matchedCorridorCode;
    private Boolean isGpsAvailable;
    private LocalDateTime lastUpdatedAt;
    private LocalDateTime fetchedAt;

    public static TrainLiveResponse from(TrainTelemetry t) {
        if (t == null) return null;
        return TrainLiveResponse.builder()
                .trainNumber(t.getTrainNumber())
                .trainName(t.getTrainName())
                .trainType(t.getTrainType())
                .latitude(t.getLatitude())
                .longitude(t.getLongitude())
                .speedKmh(t.getSpeedKmh())
                .bearingDegrees(t.getBearingDegrees())
                .direction(t.getDirection())
                .currentStation(t.getCurrentStation())
                .currentStationName(t.getCurrentStationName())
                .nextStation(t.getNextStation())
                .nextStationName(t.getNextStationName())
                .currentSection(t.getCurrentSection())
                .matchedSection(t.getMatchedSection() != null ? t.getMatchedSection() : t.getCurrentSection())
                .delayMinutes(t.getDelayMinutes())
                .status(t.getStatus())
                .operationalStatus(t.getOperationalStatus() != null ? t.getOperationalStatus() : t.getStatus())
                .dataSource(t.getDataSource())
                .freshness(t.getFreshness())
                .routeMatchStatus(t.getRouteMatchStatus())
                .matchedCorridorId(t.getMatchedCorridorId())
                .matchedCorridorCode(t.getMatchedCorridorCode())
                .isGpsAvailable(t.getIsGpsAvailable())
                .lastUpdatedAt(t.getLastUpdatedAt() != null ? t.getLastUpdatedAt() : t.getProviderTimestamp())
                .fetchedAt(t.getFetchedAt())
                .build();
    }
}

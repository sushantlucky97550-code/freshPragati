package com.railopt.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * Corridor timeline data for the dashboard CorridorTimeline component.
 * Contains active trains (with live telemetry), maintenance blocks, and relevant maintenance requests.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CorridorTimelineResponse {

    private Long corridorId;
    private String corridorCode;
    private String corridorName;

    /** Train entries for timeline rendering */
    private List<TrainEntry> trains;

    /** Maintenance block windows */
    private List<BlockEntry> blocks;

    /** Relevant maintenance requests */
    private List<MaintenanceRequestEntry> maintenanceRequests;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TrainEntry {
        private String trainNumber;
        private String trainName;
        private String trainType;
        private String category;
        private String status;
        private Integer delayMinutes;
        private String trackLine;
        private Integer priority;
        private Boolean kavachFitted;
        private String departureTime;
        private String arrivalTime;
        private Double speedKmh;
        private String currentSection;
        private String currentStation;
        private String nextStation;
        private String dataSource;
        private String freshness;
        private Boolean isGpsAvailable;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class BlockEntry {
        private String planId;
        private String windowStart;
        private String windowEnd;
        private Double durationHours;
        private String trackLine;
        private String departments;
        private String status;
        private Double optimizationScore;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MaintenanceRequestEntry {
        private Long id;
        private String taskId;
        private String departmentCode;
        private String assetName;
        private String taskType;
        private String priority;
        private String severity;
        private String status;
        private Integer durationMinutes;
    }
}

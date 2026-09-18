package com.railopt.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

/**
 * Dashboard summary aggregated dynamically from MongoDB and the AI Priority Engine.
 * Powers the 5 KPI metric cards and AI telemetry on the main dashboard.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardSummaryResponse {

    // Asset health
    private Double assetAvailabilityPercent;
    private Long totalAssets;
    private Long criticalAssets;
    private Long totalTrackKmMonitored;

    // Task metrics
    private Long totalTasks;
    private Long criticalTasks;
    private Long urgentTasks;
    private Long pendingTasks;
    private Long inProgressTasks;

    // Block metrics
    private Long totalBlockPlans;
    private Long approvedBlockPlans;
    private Long proposedBlockPlans;

    // Train metrics
    private Long totalTrains;
    private Long delayedTrains;
    private Long unresolvedConflicts;
    private Long conflictsResolved;
    private Long unplannedDetentions;

    // Maintenance workload
    private Double totalWorkloadHoursPerWeek;
    private Map<String, Double> workloadByDepartment; // dept code -> hours/week %
    private Double machineUtilizationPercent;

    // AI Priority Engine Telemetry
    private Double aiPriorityScore;
    private String aiPriorityLevel;
    private String aiRecommendedAction;

    // System info
    private String generatedAt;
}

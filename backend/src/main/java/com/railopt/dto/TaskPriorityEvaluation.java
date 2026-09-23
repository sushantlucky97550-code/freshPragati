package com.railopt.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

/**
 * Result DTO of an AI Priority Engine evaluation on a maintenance task.
 * Enriched with spatial overlap, bundling analysis, and human-in-the-loop explainability.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TaskPriorityEvaluation {

    private Long taskIdPk;
    private String taskId;
    private String taskType;
    private String departmentCode;
    private String assetName;

    // Spatial & Sectional metadata (Requirement 12 & 13)
    private String zone;
    private String division;
    private String fromStation;
    private String toStation;
    private String section;
    private String corridor;

    // Criticality & Timings
    private String criticality;
    private String severity;
    private LocalDate deadline;
    private Integer estimatedDurationMinutes;

    private Double priorityScore;
    private String priorityLevel;
    private String recommendedAction;

    // Multi-department bundling intelligence
    private boolean bundleOpportunity;
    private String bundleTitle; // e.g. "P-WAY + S&T COMBINED WORK OPPORTUNITY"
    private String bundleReason; // "Grouped because P-Way track maintenance and S&T point machine renewal overlap..."
    private List<String> bundledDepartments;
    private List<String> potentialAffectedTrains;

    private Map<String, Object> factorBreakdown;
    private LocalDateTime evaluatedAt;
}

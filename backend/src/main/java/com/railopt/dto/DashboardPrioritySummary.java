package com.railopt.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * Summary telemetry produced by the AI Priority Engine for the main dashboard.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardPrioritySummary {

    private Double averagePriorityScore;
    private Double highestPriorityScore;
    private String topPriorityLevel;
    private String topRecommendedAction;
    private Long highUrgencyTasksCount;
    private List<TaskPriorityEvaluation> topPriorityTasks;
}

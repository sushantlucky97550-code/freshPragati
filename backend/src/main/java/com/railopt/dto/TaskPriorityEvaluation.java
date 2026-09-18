package com.railopt.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Map;

/**
 * Result DTO of an AI Priority Engine evaluation on a maintenance task.
 * Contains the deterministic 0-100 score, priority tier, recommended operational action,
 * and transparent 12-factor scoring breakdown.
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
    private Double priorityScore;
    private String priorityLevel;
    private String recommendedAction;
    private Map<String, Object> factorBreakdown;
    private LocalDateTime evaluatedAt;
}

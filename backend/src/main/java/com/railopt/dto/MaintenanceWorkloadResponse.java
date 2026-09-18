package com.railopt.dto;

import lombok.Builder;
import lombok.Data;

import java.util.List;

/**
 * Department workload breakdown for the WorkloadDistribution dashboard chart.
 */
@Data
@Builder
public class MaintenanceWorkloadResponse {

    private Long totalTasks;
    private Long totalPendingTasks;
    private Long totalInProgressTasks;
    private Double totalEstimatedHours;
    private List<DepartmentWorkload> departments;

    @Data
    @Builder
    public static class DepartmentWorkload {
        private String code;
        private String name;
        private String status;
        private Long taskCount;
        private Long pendingCount;
        private Long inProgressCount;
        private Long criticalCount;
        private Double estimatedHours;
        private Double workloadPercent;
    }
}

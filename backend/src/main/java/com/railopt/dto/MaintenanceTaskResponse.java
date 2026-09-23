package com.railopt.dto;

import com.railopt.entity.MaintenanceTask;
import com.railopt.entity.Priority;
import com.railopt.entity.Severity;
import com.railopt.entity.TaskStatus;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

/**
 * Response DTO for MaintenanceTask.
 */
@Data
@Builder
public class MaintenanceTaskResponse {

    private Long id;
    private String taskId;

    // Flattened department info
    private Long departmentId;
    private String departmentName;
    private String departmentCode;

    private String zone;
    private String division;
    private String fromStation;
    private String toStation;
    private String section;

    private String assetName;
    private String location;
    private String taskType;
    private String description;
    private Severity severity;
    private Priority priority;
    private String criticality;
    private Integer durationMinutes;
    private LocalDate dueDate;
    private Integer manpower;
    private String equipment;
    private String dependencies;
    private List<String> supportingDepartments;
    private TaskStatus status;
    private String lifecycleState;
    private String submittedBy;
    private String aiAnalysisJson;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static MaintenanceTaskResponse from(MaintenanceTask task) {
        if (task == null) return null;
        return MaintenanceTaskResponse.builder()
                .id(task.getId())
                .taskId(task.getTaskId())
                .departmentId(task.getDepartment() != null ? task.getDepartment().getId() : null)
                .departmentName(task.getDepartment() != null ? task.getDepartment().getName() : null)
                .departmentCode(task.getDepartment() != null ? task.getDepartment().getCode() : null)
                .zone(task.getZone())
                .division(task.getDivision())
                .fromStation(task.getFromStation())
                .toStation(task.getToStation())
                .section(task.getSection())
                .assetName(task.getAssetName())
                .location(task.getLocation())
                .taskType(task.getTaskType())
                .description(task.getDescription())
                .severity(task.getSeverity())
                .priority(task.getPriority())
                .criticality(task.getCriticality())
                .durationMinutes(task.getDurationMinutes())
                .dueDate(task.getDueDate())
                .manpower(task.getManpower())
                .equipment(task.getEquipment())
                .dependencies(task.getDependencies())
                .supportingDepartments(task.getSupportingDepartments())
                .status(task.getStatus())
                .lifecycleState(task.getLifecycleState())
                .submittedBy(task.getSubmittedBy())
                .aiAnalysisJson(task.getAiAnalysisJson())
                .createdAt(task.getCreatedAt())
                .updatedAt(task.getUpdatedAt())
                .build();
    }
}

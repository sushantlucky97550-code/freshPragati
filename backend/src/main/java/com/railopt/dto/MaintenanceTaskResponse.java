package com.railopt.dto;

import com.railopt.entity.MaintenanceTask;
import com.railopt.entity.Priority;
import com.railopt.entity.Severity;
import com.railopt.entity.TaskStatus;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Response DTO for MaintenanceTask — decoupled from the JPA entity.
 * Includes flattened department info for convenience.
 */
@Data
@Builder
public class MaintenanceTaskResponse {

    private Long id;
    private String taskId;

    // Flattened department info — avoids nested JSON complexity
    private Long departmentId;
    private String departmentName;
    private String departmentCode;

    private String assetName;
    private String location;
    private String taskType;
    private String description;
    private Severity severity;
    private Priority priority;
    private Integer durationMinutes;
    private LocalDate dueDate;
    private TaskStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    /**
     * Maps a MaintenanceTask entity to a MaintenanceTaskResponse.
     *
     * @param task the JPA entity (department must be initialised)
     * @return the response DTO
     */
    public static MaintenanceTaskResponse from(MaintenanceTask task) {
        return MaintenanceTaskResponse.builder()
                .id(task.getId())
                .taskId(task.getTaskId())
                .departmentId(task.getDepartment().getId())
                .departmentName(task.getDepartment().getName())
                .departmentCode(task.getDepartment().getCode())
                .assetName(task.getAssetName())
                .location(task.getLocation())
                .taskType(task.getTaskType())
                .description(task.getDescription())
                .severity(task.getSeverity())
                .priority(task.getPriority())
                .durationMinutes(task.getDurationMinutes())
                .dueDate(task.getDueDate())
                .status(task.getStatus())
                .createdAt(task.getCreatedAt())
                .updatedAt(task.getUpdatedAt())
                .build();
    }
}

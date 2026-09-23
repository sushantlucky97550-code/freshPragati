package com.railopt.dto;

import com.railopt.entity.Priority;
import com.railopt.entity.Severity;
import com.railopt.entity.TaskStatus;
import jakarta.validation.constraints.*;
import lombok.Data;

import java.time.LocalDate;
import java.util.List;

/**
 * Request DTO for creating or updating a MaintenanceTask.
 */
@Data
public class MaintenanceTaskRequest {

    @NotBlank(message = "Task ID is required")
    @Size(max = 50, message = "Task ID must not exceed 50 characters")
    private String taskId;

    @NotNull(message = "Department ID is required")
    @Positive(message = "Department ID must be a positive number")
    private Long departmentId;

    private String zone;

    private String division;

    private String fromStation;

    private String toStation;

    private String section;

    @NotBlank(message = "Asset name is required")
    @Size(max = 200, message = "Asset name must not exceed 200 characters")
    private String assetName;

    @NotBlank(message = "Location is required")
    @Size(max = 200, message = "Location must not exceed 200 characters")
    private String location;

    @NotBlank(message = "Task type is required")
    @Size(max = 100, message = "Task type must not exceed 100 characters")
    private String taskType;

    @Size(max = 1000, message = "Description must not exceed 1000 characters")
    private String description;

    @NotNull(message = "Severity is required")
    private Severity severity;

    @NotNull(message = "Priority is required")
    private Priority priority;

    private String criticality;

    @NotNull(message = "Duration in minutes is required")
    @Positive(message = "Duration must be a positive number of minutes")
    @Max(value = 1440, message = "Duration cannot exceed 1440 minutes (24 hours)")
    private Integer durationMinutes;

    private LocalDate dueDate;

    private Integer manpower;

    private String equipment;

    private String dependencies;

    private List<String> supportingDepartments;

    /** Defaults to PENDING if not provided */
    private TaskStatus status;

    private String lifecycleState;

    private String submittedBy;
}

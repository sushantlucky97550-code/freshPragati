package com.railopt.entity;

import jakarta.validation.constraints.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Represents a single maintenance task in the Indian Railway system.
 * Each task belongs to one Department via @DBRef.
 */
@Document(collection = "maintenance_tasks")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MaintenanceTask {

    @Id
    private Long id;

    /**
     * Human-readable unique task identifier, e.g. "TASK-PWAY-001".
     */
    @NotBlank
    @Size(max = 50)
    @Indexed(unique = true)
    private String taskId;

    /** Owning department (e.g. P-Way, TRD, S&T) */
    @DBRef
    private Department department;

    /** Asset under maintenance, e.g. "Track TDL-162", "Signal ALJN-44" */
    @NotBlank
    @Size(max = 200)
    private String assetName;

    /** Railway location / chainage, e.g. "ALJN Yard", "CNB-105 km" */
    @NotBlank
    @Size(max = 200)
    private String location;

    /** Category of work, e.g. "Inspection", "Replacement", "Calibration" */
    @NotBlank
    @Size(max = 100)
    private String taskType;

    @Size(max = 1000)
    private String description;

    @Builder.Default
    private Severity severity = Severity.MEDIUM;

    @Builder.Default
    private Priority priority = Priority.MEDIUM;

    /** Duration the track/asset needs to be blocked in minutes */
    @Positive
    private Integer durationMinutes;

    /** Target completion date */
    private LocalDate dueDate;

    @Builder.Default
    private TaskStatus status = TaskStatus.PENDING;

    @CreatedDate
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;
}

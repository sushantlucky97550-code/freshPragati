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
import java.util.ArrayList;
import java.util.List;

/**
 * Represents a single maintenance task in the Indian Railway system.
 * Scoped by Railway Zone, Division, and Department.
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
     * Human-readable unique task identifier, e.g. "TASK-PWAY-001" or "TSK-WCR-ENG-101".
     */
    @NotBlank
    @Size(max = 50)
    @Indexed(unique = true)
    private String taskId;

    /** Owning department (e.g. P-Way, TRD, S&T) */
    @DBRef
    private Department department;

    /** Railway Zone e.g. "WCR", "NR" */
    @Builder.Default
    private String zone = "WCR";

    /** Railway Division e.g. "Bhopal", "Jabalpur", "Delhi" */
    @Builder.Default
    private String division = "Bhopal";

    /** From Station Code e.g. "BPL", "NDLS" */
    private String fromStation;

    /** To Station Code e.g. "SEH", "CNB" */
    private String toStation;

    /** Railway Section / Corridor e.g. "Bhopal – Sehore Mainline" */
    private String section;

    /** Asset under maintenance, e.g. "Track BPL-102", "Point Machine SEH-4" */
    @NotBlank
    @Size(max = 200)
    private String assetName;

    /** Railway location / chainage, e.g. "BPL Yard Km 830/12" */
    @NotBlank
    @Size(max = 200)
    private String location;

    /** Category of work, e.g. "Track Tamping", "Point Overhaul", "OHE Catenary Wire" */
    @NotBlank
    @Size(max = 100)
    private String taskType;

    @Size(max = 1000)
    private String description;

    @Builder.Default
    private Severity severity = Severity.MEDIUM;

    @Builder.Default
    private Priority priority = Priority.MEDIUM;

    /** Criticality level: LOW, MEDIUM, HIGH, SAFETY_CRITICAL */
    @Builder.Default
    private String criticality = "HIGH";

    /** Duration the track/asset needs to be blocked in minutes */
    @Positive
    private Integer durationMinutes;

    /** Target completion date */
    private LocalDate dueDate;

    /** Required manpower count */
    private Integer manpower;

    /** Required heavy machinery or equipment, e.g. "CSM 09-32 Tamping Machine", "Tower Wagon" */
    private String equipment;

    /** Operational or safety dependencies */
    private String dependencies;

    /** Supporting departments for shadow/joint possession */
    @Builder.Default
    private List<String> supportingDepartments = new ArrayList<>();

    @Builder.Default
    private TaskStatus status = TaskStatus.PENDING;

    /**
     * Complete lifecycle state machine:
     * REQUESTED -> AI_ANALYZED -> PRIORITIZED -> SELECTED_FOR_TODAY -> DOM_AUTHORIZED ->
     * BLOCK_PLAN_GENERATED -> APPROVAL_IN_PROGRESS -> FULLY_APPROVED -> ACTIVE ->
     * WORK_IN_PROGRESS -> WORK_COMPLETED -> FINAL_REPORT_SUBMITTED -> HISTORICAL_LEARNING
     */
    @Builder.Default
    private String lifecycleState = "REQUESTED";

    /** Officer ID who submitted this request */
    private String submittedBy;

    /** AI Analysis details JSON (bundle opportunities, overlap reasoning) */
    private String aiAnalysisJson;

    @CreatedDate
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;
}

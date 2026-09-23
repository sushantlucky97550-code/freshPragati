package com.railopt.entity;

import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Stores the Final Maintenance Report submitted upon completion of work.
 * Feeds directly into the internal Machine Learning learning layer.
 */
@Document(collection = "maintenance_reports")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MaintenanceReport {

    @Id
    private Long id;

    private String reportId; // e.g. "REP-2026-0812"
    private String workId; // e.g. "TASK-PWAY-001" or Plan ID
    private String planId;
    private String zone;
    private String division;
    private String section;
    private String department;

    private boolean workCompleted;
    private String actualStartTime;
    private String actualEndTime;
    private Double actualDurationHours;
    private Double plannedDurationHours;
    private Double durationVariancePercent;

    private String workPerformed;
    private String assetsAffected;
    private String defectsFound;
    private String defectsResolved;
    private Integer manpowerUsed;
    private String equipmentUsed;
    private Integer delayMinutes;
    private String incidents;
    private String observations;
    private Double blockUtilizationPercent;
    private String recommendations;
    private String officerRemarks;
    private String completionStatus; // "VERIFIED_COMPLETED", "PARTIAL"

    private List<String> attachmentUrls;
    private String submittedBy;
    private String submittedByRole;

    @CreatedDate
    private LocalDateTime submittedAt;
}

package com.railopt.entity;

import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * An AI-generated maintenance block plan.
 * Stores optimization result, weather intelligence, version history, and sequential approval status.
 */
@Document(collection = "ai_block_plans")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AiBlockPlan {

    @Id
    private Long id;

    /** Unique plan ID e.g. "BLK-AI-2026-9041" */
    @Indexed(unique = true)
    private String planId;

    @DBRef
    private Corridor corridor;

    /** Railway Zone e.g. "WCR", "NR" */
    @Builder.Default
    private String zone = "WCR";

    /** Railway Division e.g. "Bhopal", "Jabalpur" */
    @Builder.Default
    private String division = "Bhopal";

    private String fromStation;
    private String toStation;

    /** Track line e.g. "UP_MAIN", "DN_MAIN" */
    private String trackLine;

    private LocalDate scheduledDate;

    /** Block window start HH:mm */
    private String windowStart;

    /** Block window end HH:mm */
    private String windowEnd;

    /** Duration in hours (decimal) */
    private Double durationHours;

    /** Optimization score 0-100 */
    private Double optimizationScore;

    @Builder.Default
    private BlockPlanStatus status = BlockPlanStatus.PROPOSED;

    /** Plan version (e.g. 1, 2, 3...) */
    @Builder.Default
    private Integer version = 1;

    /** JSON text: list of AI reasoning objects */
    private String reasoningJson;

    /** JSON text: list of affected train objects with delay info */
    private String affectedTrainsJson;

    /** JSON text: list of assigned tasks */
    private String assignedTasksJson;

    /** List of assigned maintenance task IDs (e.g. ["TSK-WCR-ENG-101", "TSK-WCR-SIG-201"]) */
    @Builder.Default
    private List<String> assignedTaskIds = new ArrayList<>();

    /** Departments involved e.g. "PWAY,TRD,ST" */
    private String departments;

    /**
     * Sequential Department Approval Chain JSON:
     * e.g. [
     *   {"dept": "PWAY", "name": "Engineering (P-Way)", "status": "APPROVED", "approvedBy": "Er. Vikram Singh", "approvedAt": "..."},
     *   {"dept": "ST", "name": "Signal & Telecom", "status": "PENDING", "approvedBy": null}
     * ]
     */
    private String approvalChainJson;

    /**
     * Weather Intelligence & Operational Alert JSON:
     * e.g. {"forecast": "Clear / 28°C", "riskLevel": "LOW", "affectedWork": "Track Tamping", "advisory": "Optimal window"}
     */
    private String weatherAlertJson;

    private String approvedBy;

    @CreatedDate
    private LocalDateTime generatedAt;
}

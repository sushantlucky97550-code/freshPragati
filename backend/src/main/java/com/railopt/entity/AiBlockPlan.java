package com.railopt.entity;

import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * An AI-generated maintenance block plan.
 * Stores the optimization result including affected trains,
 * reasoning, and approval details as JSON text.
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

    /** Track line e.g. "UP_MAIN" */
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

    /** JSON text: list of AI reasoning objects */
    private String reasoningJson;

    /** JSON text: list of affected train objects with delay info */
    private String affectedTrainsJson;

    /** JSON text: list of assigned tasks */
    private String assignedTasksJson;

    /** Departments involved e.g. "PWAY,TRD,ST" */
    private String departments;

    private String approvedBy;

    @CreatedDate
    private LocalDateTime generatedAt;
}

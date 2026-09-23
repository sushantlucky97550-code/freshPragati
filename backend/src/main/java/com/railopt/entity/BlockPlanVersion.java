package com.railopt.entity;

import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

/**
 * Tracks version history for block plans when timings or configurations are updated.
 */
@Document(collection = "block_plan_versions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BlockPlanVersion {

    @Id
    private Long id;

    private String planId; // e.g. "BLK-AI-2026-9041"
    private Integer version; // 1, 2, 3...
    private String previousWindow; // "11:00 - 12:00"
    private String newWindow; // "11:30 - 12:30"
    private String reason; // "Operational conflict / authorized update"
    private String authorizedBy; // "Sanjay Srivastava (DOM)"
    private String zone;
    private String division;

    @CreatedDate
    private LocalDateTime timestamp;
}

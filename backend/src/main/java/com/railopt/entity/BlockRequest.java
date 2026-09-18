package com.railopt.entity;

import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

/**
 * A departmental request to take a maintenance block on a corridor.
 * Submitted by SSE/JE before being processed and converted to an AI Block Plan.
 */
@Document(collection = "block_requests")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BlockRequest {

    @Id
    private Long id;

    /** Unique block request identifier e.g. "BLK-REQ-PWAY-001" */
    @Indexed(unique = true)
    private String blockId;

    @DBRef
    private Corridor corridor;

    @DBRef
    private Department department;

    /** Track line requested e.g. "UP_MAIN" */
    private String trackLine;

    /** Requested block start (HH:mm) */
    private String requestedStart;

    /** Requested block end (HH:mm) */
    private String requestedEnd;

    /** Requested duration in minutes */
    private Integer durationMinutes;

    @Builder.Default
    private Priority priority = Priority.MEDIUM;

    @Builder.Default
    private BlockRequestStatus status = BlockRequestStatus.PENDING;

    private String notes;

    /** Name/designation of the requesting officer */
    private String requestedBy;

    @CreatedDate
    private LocalDateTime createdAt;
}

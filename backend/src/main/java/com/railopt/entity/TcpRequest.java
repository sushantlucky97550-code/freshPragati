package com.railopt.entity;

import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

/**
 * Traction Power Request entity for TRD / OHE operations.
 * Lifecycle: REQUESTED -> RECEIVED -> ACKNOWLEDGED -> ACTIONED
 */
@Document(collection = "tcp_requests")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TcpRequest {

    @Id
    private Long id;

    private String requestId; // e.g. "TCP-REQ-2026-104"
    private String workId;
    private String zone;
    private String division;
    private String corridor;
    private String track;
    private String actionType; // "REQUEST_POWER_OFF", "REQUEST_POWER_ON"
    private String reason;
    private String location;
    private String requestedBy;
    private String requestedByRole;
    private String status; // "REQUESTED", "RECEIVED", "ACKNOWLEDGED", "ACTIONED"
    private String acknowledgedBy;
    private String remarks;

    @CreatedDate
    private LocalDateTime requestedAt;
    private LocalDateTime acknowledgedAt;
    private LocalDateTime actionedAt;
}

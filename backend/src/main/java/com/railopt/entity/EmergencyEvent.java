package com.railopt.entity;

import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

/**
 * Rapid Emergency Maintenance Event entity.
 */
@Document(collection = "emergency_events")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EmergencyEvent {

    @Id
    private Long id;

    private String eventId; // e.g. "EMG-2026-911"
    private String zone;
    private String division;
    private String emergencyType; // "TRACK_OBSTRUCTION", "OHE_BREAKDOWN", "SIGNAL_FAILURE", "RAIL_FRACTURE"
    private String location;
    private String affectedTrack; // "UP_MAIN", "DN_MAIN"
    private String affectedWorkId;
    private String severity; // "CRITICAL", "HIGH"
    private String description;
    private String status; // "ACTIVE", "RESPONDING", "RESOLVED"
    private String reportedBy;
    private String reportedByRole;
    private String attachmentUrl;

    @CreatedDate
    private LocalDateTime reportedAt;
    private LocalDateTime resolvedAt;
}

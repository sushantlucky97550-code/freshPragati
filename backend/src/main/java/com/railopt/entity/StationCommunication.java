package com.railopt.entity;

import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

/**
 * Controlled Station Master <-> Section Officer operational communication.
 */
@Document(collection = "station_communications")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StationCommunication {

    @Id
    private Long id;

    private String messageId; // e.g. "MSG-2026-102"
    private String workId;
    private String zone;
    private String division;
    private String senderName;
    private String senderRole; // "STATION_MASTER", "SECTION_OFFICER", "OPERATIONS_CONTROL"
    private String recipientRole;
    private String stationCode; // e.g. "BPL", "SEH"
    private String content;
    private boolean acknowledged;
    private String acknowledgedBy;

    @CreatedDate
    private LocalDateTime timestamp;
    private LocalDateTime acknowledgedAt;
}

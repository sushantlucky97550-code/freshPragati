package com.railopt.entity;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

/**
 * Authentication audit log to maintain an immutable security trail
 * of all officer authentication events.
 */
@Document(collection = "auth_audit_logs")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuthAuditLog {

    @Id
    private Long id;

    @Indexed
    private String officerId;

    private AuthEventType eventType;

    @Indexed
    private LocalDateTime timestamp;

    private String ipAddress;

    private String userAgent;

    private boolean success;

    private String details;
}

package com.railopt.dto;

import lombok.Builder;
import lombok.Data;

/**
 * Represents a detected conflict between a maintenance block and a train path.
 * Powers the ConflictAlerts dashboard component.
 */
@Data
@Builder
public class ConflictResponse {

    private String id;
    private String title;
    private String severity;
    private String location;
    private String timeWindow;
    private String conflictType;
    private String aiResolution;
    private String status;
    private String confidence;
    private String trainNumber;
    private String planId;
}

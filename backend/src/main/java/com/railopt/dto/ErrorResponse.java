package com.railopt.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.Map;

/**
 * Uniform error response returned by {@link com.railopt.exception.GlobalExceptionHandler}.
 *
 * Example JSON:
 * {
 *   "timestamp": "2024-09-10T12:34:56",
 *   "status": 404,
 *   "message": "Maintenance task not found with id: 10",
 *   "path": "/api/maintenance-tasks/10",
 *   "errors": { "taskId": "must not be blank" }   // only present for validation errors
 * }
 */
@Data
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ErrorResponse {

    private LocalDateTime timestamp;
    private int status;
    private String message;
    private String path;

    /** Field-level validation errors — present only for 400 responses */
    private Map<String, String> errors;
}

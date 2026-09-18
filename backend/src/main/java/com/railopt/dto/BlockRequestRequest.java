package com.railopt.dto;

import com.railopt.entity.Priority;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class BlockRequestRequest {

    @NotBlank
    private String corridorId;  // e.g. "COR-NDLS-CNB"

    @NotBlank
    private String departmentCode;  // e.g. "PWAY"

    @NotBlank
    private String trackLine;  // e.g. "UP_MAIN"

    @NotBlank
    private String requestedStart;  // HH:mm

    @NotBlank
    private String requestedEnd;    // HH:mm

    @NotNull
    private Integer durationMinutes;

    private Priority priority;

    private String notes;

    private String requestedBy;
}

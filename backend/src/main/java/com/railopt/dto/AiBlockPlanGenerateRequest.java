package com.railopt.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.List;

/**
 * Request DTO for AI block plan generation.
 * Sent from the React frontend when user clicks "Generate AI Block Plan".
 */
@Data
public class AiBlockPlanGenerateRequest {

    @NotBlank
    private String corridorId;   // e.g. "COR-NDLS-CNB"

    @NotBlank
    private String trackLine;    // e.g. "UP_MAIN"

    @NotBlank
    private String date;         // ISO date string "YYYY-MM-DD"

    @NotBlank
    private String targetShift;  // "NIGHT", "MORNING", "AFTERNOON"

    /** Department codes to include e.g. ["PWAY", "TRD", "ST"] */
    private List<String> departments;

    @NotNull
    private Double requiredWindowHours;

    @NotNull
    private Integer maxDelayToleranceMinutes;

    private Boolean allowShadowBlocks = true;

    private String selectedMachine;
}

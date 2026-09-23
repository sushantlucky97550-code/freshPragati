package com.railopt.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.util.List;

/**
 * Request DTO for AI block plan generation.
 * Can be targeted to specific selected tasks (Today's Maintenance Work).
 */
@Data
public class AiBlockPlanGenerateRequest {

    private String corridorId;   // e.g. "BPL-ITR" or "NDLS-CNB"

    private String trackLine;    // e.g. "UP_MAIN", "DN_MAIN"

    private String date;         // ISO date string "YYYY-MM-DD"

    private String targetShift;  // "NIGHT", "MORNING", "AFTERNOON"

    /** Specific task IDs to generate block plan for */
    private List<String> selectedTaskIds;

    private String zone;         // e.g. "WCR"

    private String division;     // e.g. "Bhopal"

    private String fromStation;  // e.g. "BPL"

    private String toStation;    // e.g. "SEH"

    /** Department codes to include e.g. ["PWAY", "TRD", "ST"] */
    private List<String> departments;

    private Double requiredWindowHours;

    private Integer maxDelayToleranceMinutes;

    private Boolean allowShadowBlocks = true;

    private String selectedMachine;
}

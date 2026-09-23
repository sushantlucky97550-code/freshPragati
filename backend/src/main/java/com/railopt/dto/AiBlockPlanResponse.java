package com.railopt.dto;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.railopt.entity.AiBlockPlan;
import lombok.Builder;
import lombok.Data;
import lombok.extern.slf4j.Slf4j;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Data
@Builder
@Slf4j
public class AiBlockPlanResponse {

    private Long id;
    private String planId;
    private Long corridorId;
    private String corridorName;
    private String corridorCode;
    private String zone;
    private String division;
    private String fromStation;
    private String toStation;
    private String trackLine;
    private LocalDate scheduledDate;
    private String windowStart;
    private String windowEnd;
    private Double durationHours;
    private Double optimizationScore;
    private String status;
    private Integer version;
    private String departments;
    private String approvedBy;
    private LocalDateTime generatedAt;

    /** Parsed reasoning list from JSON */
    private List<Map<String, Object>> aiReasons;

    /** Parsed affected trains from JSON */
    private List<Map<String, Object>> affectedTrains;

    /** Parsed assigned tasks from JSON */
    private List<Map<String, Object>> assignedTasks;

    /** Assigned Task IDs list */
    private List<String> assignedTaskIds;

    /** Parsed sequential approval chain */
    private List<Map<String, Object>> approvalChain;

    /** Parsed weather intelligence alert */
    private Map<String, Object> weatherAlert;

    /** Priority evaluation and recommended action */
    private String priority;
    private String recommendedAction;
    private List<ConflictResponse> conflicts;

    private static final ObjectMapper MAPPER = new ObjectMapper();

    public static AiBlockPlanResponse from(AiBlockPlan p) {
        List<Map<String, Object>> reasons = parseJsonList(p.getReasoningJson());
        List<Map<String, Object>> trains = parseJsonList(p.getAffectedTrainsJson());
        List<Map<String, Object>> tasks = parseJsonList(p.getAssignedTasksJson());
        List<Map<String, Object>> approvalChain = parseJsonList(p.getApprovalChainJson());
        Map<String, Object> weather = parseJsonMap(p.getWeatherAlertJson());

        return AiBlockPlanResponse.builder()
                .id(p.getId())
                .planId(p.getPlanId())
                .corridorId(p.getCorridor() != null ? p.getCorridor().getId() : null)
                .corridorName(p.getCorridor() != null ? p.getCorridor().getName() : null)
                .corridorCode(p.getCorridor() != null ? p.getCorridor().getCorridorId() : null)
                .zone(p.getZone())
                .division(p.getDivision())
                .fromStation(p.getFromStation())
                .toStation(p.getToStation())
                .trackLine(p.getTrackLine())
                .scheduledDate(p.getScheduledDate())
                .windowStart(p.getWindowStart())
                .windowEnd(p.getWindowEnd())
                .durationHours(p.getDurationHours())
                .optimizationScore(p.getOptimizationScore())
                .status(p.getStatus().name())
                .version(p.getVersion() != null ? p.getVersion() : 1)
                .departments(p.getDepartments())
                .approvedBy(p.getApprovedBy())
                .generatedAt(p.getGeneratedAt())
                .aiReasons(reasons)
                .affectedTrains(trains)
                .assignedTasks(tasks)
                .assignedTaskIds(p.getAssignedTaskIds())
                .approvalChain(approvalChain)
                .weatherAlert(weather)
                .priority(p.getOptimizationScore() != null && p.getOptimizationScore() >= 85.0 ? "CRITICAL" : "HIGH")
                .recommendedAction("Approve and transmit block requisition to Section Controller & COIS.")
                .build();
    }

    @SuppressWarnings("unchecked")
    private static List<Map<String, Object>> parseJsonList(String json) {
        if (json == null || json.isBlank()) return List.of();
        try {
            return MAPPER.readValue(json, new TypeReference<List<Map<String, Object>>>() {});
        } catch (Exception e) {
            log.warn("Failed to parse JSON list field: {}", e.getMessage());
            return List.of();
        }
    }

    @SuppressWarnings("unchecked")
    private static Map<String, Object> parseJsonMap(String json) {
        if (json == null || json.isBlank()) return Map.of();
        try {
            return MAPPER.readValue(json, new TypeReference<Map<String, Object>>() {});
        } catch (Exception e) {
            log.warn("Failed to parse JSON map field: {}", e.getMessage());
            return Map.of();
        }
    }
}

package com.railopt.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.railopt.dto.AiBlockPlanGenerateRequest;
import com.railopt.dto.AiBlockPlanResponse;
import com.railopt.entity.*;
import com.railopt.exception.ResourceNotFoundException;
import com.railopt.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.format.DateTimeParseException;
import java.util.*;

/**
 * Mock AI Block Optimization Service.
 *
 * Implements a heuristic scoring algorithm to select the optimal maintenance
 * block window for a given corridor, date, and set of departments.
 *
 * ARCHITECTURE NOTE:
 * This service is designed as a drop-in replaceable stub. When a real Python/MILP
 * solver is ready, simply replace the content of this service's generatePlan()
 * method with an HTTP call to the Python microservice:
 *
 *   POST http://python-solver:8000/solve
 *   Body: AiBlockPlanGenerateRequest (same schema)
 *   Returns: AiBlockPlanResponse (same schema)
 *
 * No other code needs to change.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class MockAiOptimizationService {

    private final CorridorRepository corridorRepository;
    private final MaintenanceTaskRepository taskRepository;
    private final TrainRepository trainRepository;
    private final AiBlockPlanRepository blockPlanRepository;
    private final ObjectMapper objectMapper;

    // Time windows: shift → {start, end} in HH:mm
    private static final Map<String, String[]> SHIFT_WINDOWS = Map.of(
            "NIGHT",     new String[]{"01:00", "05:00"},
            "MORNING",   new String[]{"06:00", "10:00"},
            "AFTERNOON", new String[]{"13:00", "16:30"}
    );

    /**
     * Main entry point. Generates an AI block plan for the given request.
     */
    public AiBlockPlanResponse generatePlan(AiBlockPlanGenerateRequest request) {
        log.info("[MockAI] Generating block plan for corridor={}, date={}, shift={}",
                request.getCorridorId(), request.getDate(), request.getTargetShift());

        // 1. Resolve corridor
        Corridor corridor = corridorRepository.findByCorridorId(request.getCorridorId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Corridor not found: " + request.getCorridorId()));

        // 2. Resolve window
        String shift = request.getTargetShift() != null ? request.getTargetShift().toUpperCase() : "NIGHT";
        String[] window = SHIFT_WINDOWS.getOrDefault(shift, SHIFT_WINDOWS.get("NIGHT"));
        String windowStart = window[0];
        String windowEnd = window[1];

        // 3. Find pending/critical tasks for the requested departments
        List<MaintenanceTask> relevantTasks = taskRepository.findAll().stream()
                .filter(t -> t.getStatus() == TaskStatus.PENDING || t.getStatus() == TaskStatus.SCHEDULED)
                .filter(t -> request.getDepartments() == null || request.getDepartments().isEmpty()
                        || request.getDepartments().contains(t.getDepartment().getCode()))
                .sorted(Comparator.comparing(t -> t.getPriority().ordinal()))
                .limit(5)
                .toList();

        // 4. Find trains on this corridor (potential conflicts)
        List<Train> trains = trainRepository.findByCorridor_Id(corridor.getId());

        // 5. Score the window
        double score = computeScore(relevantTasks, trains, shift, request.getMaxDelayToleranceMinutes());

        // 6. Build reasoning objects
        List<Map<String, Object>> reasons = buildReasons(relevantTasks, trains, shift,
                Boolean.TRUE.equals(request.getAllowShadowBlocks()));

        // 7. Build affected trains
        List<Map<String, Object>> affectedTrains = buildAffectedTrains(trains, windowStart,
                request.getMaxDelayToleranceMinutes());

        // 8. Build assigned tasks
        List<Map<String, Object>> assignedTasks = buildAssignedTasks(relevantTasks, windowStart,
                windowEnd, request.getSelectedMachine());

        // 9. Parse date
        LocalDate scheduledDate;
        try {
            scheduledDate = LocalDate.parse(request.getDate());
        } catch (DateTimeParseException e) {
            scheduledDate = LocalDate.now().plusDays(1);
        }

        // 10. Build and persist the plan
        String planId = "BLK-AI-" + scheduledDate.getYear() + "-"
                + String.format("%04d", (int)(Math.random() * 9999));

        String depts = request.getDepartments() != null ? String.join(",", request.getDepartments()) : "PWAY";

        AiBlockPlan plan = AiBlockPlan.builder()
                .planId(planId)
                .corridor(corridor)
                .trackLine(request.getTrackLine())
                .scheduledDate(scheduledDate)
                .windowStart(windowStart)
                .windowEnd(windowEnd)
                .durationHours(request.getRequiredWindowHours())
                .optimizationScore(Math.round(score * 10.0) / 10.0)
                .status(BlockPlanStatus.PROPOSED)
                .departments(depts)
                .reasoningJson(toJson(reasons))
                .affectedTrainsJson(toJson(affectedTrains))
                .assignedTasksJson(toJson(assignedTasks))
                .build();

        AiBlockPlan saved = blockPlanRepository.save(plan);
        log.info("[MockAI] Saved plan id={} score={}", saved.getPlanId(), saved.getOptimizationScore());

        return AiBlockPlanResponse.from(saved);
    }

    // ─── Private helpers ────────────────────────────────────────────────────

    private double computeScore(List<MaintenanceTask> tasks, List<Train> trains,
                                String shift, int maxDelay) {
        // Score based on:
        // - Night shift preferred (fewer premium trains in window)
        // - Critical tasks boost score
        // - Fewer trains in window = higher score
        double base = "NIGHT".equals(shift) ? 88.0 : "MORNING".equals(shift) ? 74.0 : 68.0;
        long criticalCount = tasks.stream().filter(t ->
                t.getPriority() == Priority.URGENT || t.getSeverity() == Severity.CRITICAL).count();
        double taskBoost = Math.min(criticalCount * 3.0, 10.0);
        double trainPenalty = Math.min(trains.size() * 0.5, 8.0);
        return Math.min(base + taskBoost - trainPenalty, 99.5);
    }

    private List<Map<String, Object>> buildReasons(List<MaintenanceTask> tasks, List<Train> trains,
                                                    String shift, boolean shadowBlocks) {
        List<Map<String, Object>> reasons = new ArrayList<>();

        reasons.add(Map.of(
                "title", "Optimal " + shift.charAt(0) + shift.substring(1).toLowerCase() + " Traffic Valley",
                "description", "Traffic density in this window is significantly lower than peak hours. "
                        + trains.stream().filter(t -> t.getTrainType() == TrainType.PREMIUM).count()
                        + " premium trains will require regulated paths.",
                "badge", "TIMETABLE_FIT",
                "confidence", shift.equals("NIGHT") ? 98 : 85
        ));

        if (shadowBlocks && tasks.size() > 1) {
            reasons.add(Map.of(
                    "title", "Shadow Block Consolidation",
                    "description", "Bundled " + tasks.size() + " departmental tasks into a single integrated block, "
                            + "avoiding " + (tasks.size() - 1) + " additional separate block hours.",
                    "badge", "MULTI_DEPT_BUNDLING",
                    "confidence", 96
            ));
        }

        long critCount = tasks.stream()
                .filter(t -> t.getSeverity() == Severity.CRITICAL || t.getPriority() == Priority.URGENT)
                .count();
        if (critCount > 0) {
            reasons.add(Map.of(
                    "title", "Safety-Critical Tasks Prioritized",
                    "description", critCount + " critical/urgent task(s) from the pending queue have been scheduled "
                            + "in this window to prevent safety-related track speed restrictions.",
                    "badge", "SAFETY_CRITICAL",
                    "confidence", 99
            ));
        }

        reasons.add(Map.of(
                "title", "Machine & Crew Logistics Optimized",
                "description", "Track machines and crew are pre-staged at nearest siding, "
                        + "minimizing transit time and maximizing productive window utilization.",
                "badge", "ASSET_OPTIMIZED",
                "confidence", 93
        ));

        return reasons;
    }

    private List<Map<String, Object>> buildAffectedTrains(List<Train> trains, String windowStart, int maxDelay) {
        List<Map<String, Object>> result = new ArrayList<>();
        int idx = 0;
        for (Train t : trains) {
            if (idx++ >= 3) break; // show top 3 affected
            boolean isFreight = t.getTrainType() == TrainType.FREIGHT;
            int delayMins = isFreight ? 35 + (int)(Math.random() * 20) : 12 + (int)(Math.random() * 10);
            String action = isFreight ? "DETENTION" : "REGULATE";
            if (delayMins <= 5) action = "CLEAR";
            int recoveryBuffer = isFreight ? 0 : 20 + (int)(Math.random() * 15);
            result.add(Map.of(
                    "trainNo", t.getTrainNumber(),
                    "name", t.getTrainName(),
                    "category", t.getCategory() != null ? t.getCategory() : t.getTrainType().name(),
                    "direction", t.getTrackLine() != null ? t.getTrackLine() : "UP_MAIN",
                    "scheduledPass", windowStart,
                    "actionRequired", action,
                    "delayMinutes", delayMins,
                    "recoveryBufferMins", recoveryBuffer,
                    "netArrivalDelayAtDelhi", Math.max(0, delayMins - recoveryBuffer),
                    "remarks", isFreight
                            ? "Non-critical freight; commodity stock at adequate reserve levels."
                            : "Delay recoverable in run-time slack buffer before terminal station."
            ));
        }
        return result;
    }

    private List<Map<String, Object>> buildAssignedTasks(List<MaintenanceTask> tasks,
                                                          String windowStart, String windowEnd,
                                                          String machine) {
        List<Map<String, Object>> result = new ArrayList<>();
        int startHour = Integer.parseInt(windowStart.split(":")[0]);
        int offset = 0;
        for (MaintenanceTask task : tasks) {
            int assignedStart = startHour + offset;
            int durationH = Math.max(1, (task.getDurationMinutes() != null ? task.getDurationMinutes() : 120) / 60);
            result.add(Map.of(
                    "taskId", task.getTaskId(),
                    "title", task.getTaskType() + " — " + task.getAssetName(),
                    "dept", task.getDepartment().getCode(),
                    "machine", machine != null ? machine : "Track Maintenance Team",
                    "crew", 6 + (int)(Math.random() * 8),
                    "allocatedWindow", String.format("%02d:00 - %02d:00 (%d hrs)",
                            assignedStart, assignedStart + durationH, durationH)
            ));
            offset += durationH;
        }
        return result;
    }

    private String toJson(Object obj) {
        try {
            return objectMapper.writeValueAsString(obj);
        } catch (JsonProcessingException e) {
            log.warn("JSON serialization failed: {}", e.getMessage());
            return "[]";
        }
    }
}

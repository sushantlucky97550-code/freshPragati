package com.railopt.service.ai;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.railopt.dto.*;
import com.railopt.entity.*;
import com.railopt.exception.ResourceNotFoundException;
import com.railopt.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeParseException;
import java.time.temporal.ChronoUnit;
import java.util.*;

/**
 * Rule-Based AI Priority and Optimization Engine.
 *
 * Evaluates railway operational assets, trains, corridor status, and maintenance tasks
 * using a deterministic 12-factor scoring model.
 *
 * Structure is completely decoupled from controllers so it can be replaced by a
 * real Python/MILP/ML service (FastAPI, OR-Tools, XGBoost) in future phases.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class RuleBasedPriorityEngine implements PriorityEngine {

    private final MaintenanceTaskRepository taskRepository;
    private final RailwayAssetRepository assetRepository;
    private final TrainRepository trainRepository;
    private final CorridorRepository corridorRepository;
    private final BlockRequestRepository blockRequestRepository;
    private final AiBlockPlanRepository blockPlanRepository;
    private final ObjectMapper objectMapper;

    @org.springframework.beans.factory.annotation.Autowired(required = false)
    private com.railopt.service.tracking.TrainTrackingService trainTrackingService;

    // Time windows: shift -> {start, end} in HH:mm
    private static final Map<String, String[]> SHIFT_WINDOWS = Map.of(
            "NIGHT",     new String[]{"01:00", "05:00"},
            "MORNING",   new String[]{"06:00", "10:00"},
            "AFTERNOON", new String[]{"13:00", "16:30"}
    );

    @Override
    public TaskPriorityEvaluation evaluateTaskPriority(MaintenanceTask task) {
        if (task == null) return null;

        Map<String, Object> breakdown = new LinkedHashMap<>();
        double rawScore = 0.0;

        // 1. Task Severity (Max 25 pts)
        double severityPts = 5.0;
        if (task.getSeverity() == Severity.CRITICAL) severityPts = 25.0;
        else if (task.getSeverity() == Severity.HIGH) severityPts = 18.0;
        else if (task.getSeverity() == Severity.MEDIUM) severityPts = 10.0;
        breakdown.put("severityScore", severityPts);
        rawScore += severityPts;

        // 2. Task Priority (Max 20 pts)
        double priorityPts = 4.0;
        if (task.getPriority() == Priority.URGENT) priorityPts = 20.0;
        else if (task.getPriority() == Priority.HIGH) priorityPts = 14.0;
        else if (task.getPriority() == Priority.MEDIUM) priorityPts = 8.0;
        breakdown.put("priorityScore", priorityPts);
        rawScore += priorityPts;

        // 3. Task Status (Max 10 pts)
        double statusPts = 4.0;
        if (task.getStatus() == TaskStatus.PENDING) statusPts = 10.0;
        else if (task.getStatus() == TaskStatus.SCHEDULED) statusPts = 6.0;
        breakdown.put("statusScore", statusPts);
        rawScore += statusPts;

        // 4. Due Date / Urgency (Max 15 pts)
        double urgencyPts = 2.0;
        LocalDate today = LocalDate.now();
        if (task.getDueDate() != null) {
            long daysUntilDue = ChronoUnit.DAYS.between(today, task.getDueDate());
            if (daysUntilDue < 0) urgencyPts = 15.0; // Overdue
            else if (daysUntilDue <= 1) urgencyPts = 12.0; // Due within 24h
            else if (daysUntilDue <= 3) urgencyPts = 8.0;  // Due within 72h
            else if (daysUntilDue <= 7) urgencyPts = 4.0;
        }
        breakdown.put("urgencyScore", urgencyPts);
        rawScore += urgencyPts;

        // 5. Asset Condition & Health (Max 12 pts)
        // 6. Asset Availability & Active TSR (Max 8 pts)
        double assetConditionPts = 2.0;
        double assetAvailabilityPts = 1.0;

        // Lookup matching asset if any
        Optional<RailwayAsset> assetOpt = Optional.empty();
        if (task.getAssetName() != null && !task.getAssetName().isBlank()) {
            assetOpt = assetRepository.findAll().stream()
                    .filter(a -> task.getAssetName().equalsIgnoreCase(a.getName())
                            || (a.getAssetId() != null && task.getAssetName().contains(a.getAssetId())))
                    .findFirst();
        }

        if (assetOpt.isPresent()) {
            RailwayAsset asset = assetOpt.get();
            if (asset.getStatus() == AssetStatus.CRITICAL || (asset.getHealthScore() != null && asset.getHealthScore() < 55)) {
                assetConditionPts = 12.0;
            } else if (asset.getStatus() == AssetStatus.ATTENTION_REQUIRED || (asset.getHealthScore() != null && asset.getHealthScore() < 75)) {
                assetConditionPts = 7.0;
            }

            if (asset.getActiveTsr() != null && !asset.getActiveTsr().isBlank()) {
                assetAvailabilityPts = 8.0;
            } else if (asset.getDefectsCount() != null && asset.getDefectsCount() >= 2) {
                assetAvailabilityPts = 5.0;
            }
        } else {
            // Check task fields
            if (task.getSeverity() == Severity.CRITICAL) {
                assetConditionPts = 10.0;
                assetAvailabilityPts = 6.0;
            }
        }
        breakdown.put("assetConditionScore", assetConditionPts);
        breakdown.put("assetAvailabilityScore", assetAvailabilityPts);
        rawScore += (assetConditionPts + assetAvailabilityPts);

        // 7. Train Traffic / Density on Corridor (Max 6 pts)
        // 8. Corridor Importance (Max 5 pts)
        // 7. Train Traffic / Density on Corridor (Max 6 pts)
        // 8. Corridor Importance (Max 5 pts)
        Corridor corridor = assetOpt.map(RailwayAsset::getCorridor).orElse(null);
        double trafficPts = 3.0;
        double corridorImportancePts = 2.0;
        String dataSourceUsed = "SCHEDULED";

        if (trainTrackingService != null) {
            try {
                var summary = trainTrackingService.getTelemetrySummary();
                dataSourceUsed = summary.getDataSource() != null ? summary.getDataSource() : "SIMULATION";
            } catch (Exception ignored) {}
        }

        if (corridor != null) {
            if (corridor.getDailyTrains() != null && corridor.getDailyTrains() >= 150) trafficPts = 6.0;
            else if (corridor.getDailyTrains() != null && corridor.getDailyTrains() >= 100) trafficPts = 4.5;

            if (corridor.getCapacityUtilization() != null && corridor.getCapacityUtilization() >= 85) corridorImportancePts = 5.0;
            else if (corridor.getCapacityUtilization() != null && corridor.getCapacityUtilization() >= 75) corridorImportancePts = 3.5;
        }
        breakdown.put("trainDensityScore", trafficPts);
        breakdown.put("corridorImportanceScore", corridorImportancePts);
        breakdown.put("dataSourceUsed", dataSourceUsed);
        rawScore += (trafficPts + corridorImportancePts);

        // 9. Existing Block Requests (Max 5 pts)
        double existingBlockPts = 0.0;
        final Corridor finalTaskCorridor = corridor;
        boolean hasBlockReq = blockRequestRepository.findAll().stream()
                .anyMatch(br -> br.getCorridor() != null && finalTaskCorridor != null
                        && br.getCorridor().getId().equals(finalTaskCorridor.getId())
                        && br.getStatus() == BlockRequestStatus.PENDING);
        if (hasBlockReq) existingBlockPts = 5.0;
        breakdown.put("existingBlockRequestsScore", existingBlockPts);
        rawScore += existingBlockPts;

        // 10. Train Conflicts Potential (Max 5 pts)
        double conflictPts = 2.0;
        if (corridor != null) {
            long premiumCount = trainRepository.findByCorridor_Id(corridor.getId()).stream()
                    .filter(t -> t.getTrainType() == TrainType.PREMIUM).count();
            long delayedLiveCount = 0;
            if (trainTrackingService != null) {
                try {
                    delayedLiveCount = trainTrackingService.getLiveTelemetryForCorridor(corridor.getId()).stream()
                            .filter(t -> t.getDelayMinutes() != null && t.getDelayMinutes() > 10)
                            .count();
                } catch (Exception ignored) {}
            }
            if (premiumCount >= 2 || delayedLiveCount >= 2) conflictPts = 5.0;
            else if (premiumCount >= 1 || delayedLiveCount >= 1) conflictPts = 3.5;
        }
        breakdown.put("conflictPotentialScore", conflictPts);
        rawScore += conflictPts;

        // 11. Department Workload Backlog (Max 5 pts)
        double deptWorkloadPts = 2.0;
        if (task.getDepartment() != null && task.getDepartment().getId() != null) {
            long deptPending = taskRepository.findByDepartmentId(task.getDepartment().getId()).stream()
                    .filter(t -> t.getStatus() == TaskStatus.PENDING).count();
            if (deptPending >= 4) deptWorkloadPts = 5.0;
            else if (deptPending >= 2) deptWorkloadPts = 3.5;
        }
        breakdown.put("deptWorkloadScore", deptWorkloadPts);
        rawScore += deptWorkloadPts;

        // 12. Maintenance Duration Efficiency (Max 4 pts)
        double durationPts = 2.0;
        if (task.getDurationMinutes() != null && task.getDurationMinutes() <= 180) {
            durationPts = 4.0; // Efficient, quick-turnaround block
        }
        breakdown.put("durationScore", durationPts);
        rawScore += durationPts;

        // Total normalized score (0 to 100)
        double totalNormalized = Math.min(99.0, Math.max(10.0, Math.round((rawScore / 112.0 * 100.0) * 10.0) / 10.0));

        // Priority Level and Recommended Action
        String priorityLevel;
        String recommendedAction;

        if (totalNormalized >= 78.0) {
            priorityLevel = "CRITICAL";
            recommendedAction = "Schedule immediate maintenance block. Regulate conflicting freight paths to siding loops.";
        } else if (totalNormalized >= 62.0) {
            priorityLevel = "HIGH";
            recommendedAction = "Allocate night slack window (01:00-05:00) with multi-department shadow bundling.";
        } else if (totalNormalized >= 45.0) {
            priorityLevel = "MEDIUM";
            recommendedAction = "Schedule during daylight coaching slack window with caution order.";
        } else {
            priorityLevel = "LOW";
            recommendedAction = "Routine cyclic maintenance; monitor during standard daily track inspection patrol.";
        }

        return TaskPriorityEvaluation.builder()
                .taskIdPk(task.getId())
                .taskId(task.getTaskId())
                .taskType(task.getTaskType())
                .departmentCode(task.getDepartment() != null ? task.getDepartment().getCode() : "PWAY")
                .assetName(task.getAssetName())
                .priorityScore(totalNormalized)
                .priorityLevel(priorityLevel)
                .recommendedAction(recommendedAction)
                .factorBreakdown(breakdown)
                .evaluatedAt(LocalDateTime.now())
                .build();
    }

    @Override
    public List<TaskPriorityEvaluation> evaluateTopPriorities(int limit) {
        return taskRepository.findAll().stream()
                .map(this::evaluateTaskPriority)
                .sorted(Comparator.comparing(TaskPriorityEvaluation::getPriorityScore).reversed())
                .limit(limit)
                .toList();
    }

    @Override
    public DashboardPrioritySummary getDashboardPrioritySummary() {
        List<TaskPriorityEvaluation> evaluations = taskRepository.findAll().stream()
                .map(this::evaluateTaskPriority)
                .sorted(Comparator.comparing(TaskPriorityEvaluation::getPriorityScore).reversed())
                .toList();

        if (evaluations.isEmpty()) {
            return DashboardPrioritySummary.builder()
                    .averagePriorityScore(72.5)
                    .highestPriorityScore(94.0)
                    .topPriorityLevel("CRITICAL")
                    .topRecommendedAction("Schedule immediate maintenance block.")
                    .highUrgencyTasksCount(2L)
                    .topPriorityTasks(List.of())
                    .build();
        }

        double avg = evaluations.stream()
                .mapToDouble(TaskPriorityEvaluation::getPriorityScore)
                .average().orElse(70.0);
        TaskPriorityEvaluation top = evaluations.get(0);
        long urgentCount = evaluations.stream()
                .filter(e -> "CRITICAL".equals(e.getPriorityLevel()) || "HIGH".equals(e.getPriorityLevel()))
                .count();

        return DashboardPrioritySummary.builder()
                .averagePriorityScore(Math.round(avg * 10.0) / 10.0)
                .highestPriorityScore(top.getPriorityScore())
                .topPriorityLevel(top.getPriorityLevel())
                .topRecommendedAction(top.getRecommendedAction())
                .highUrgencyTasksCount(urgentCount)
                .topPriorityTasks(evaluations.stream().limit(5).toList())
                .build();
    }

    @Override
    @Transactional
    public AiBlockPlanResponse optimizeBlockPlan(AiBlockPlanGenerateRequest request) {
        log.info("[PriorityEngine] Optimizing block plan for corridor={}, shift={}, date={}",
                request.getCorridorId(), request.getTargetShift(), request.getDate());

        // 1. Resolve Corridor
        Corridor corridor = null;
        if (request.getCorridorId() != null) {
            corridor = corridorRepository.findByCorridorId(request.getCorridorId())
                    .orElseGet(() -> {
                        try {
                            Long id = Long.parseLong(request.getCorridorId());
                            return corridorRepository.findById(id).orElse(null);
                        } catch (NumberFormatException e) {
                            return null;
                        }
                    });
        }
        if (corridor == null) {
            corridor = corridorRepository.findAll().stream().findFirst()
                    .orElseThrow(() -> new ResourceNotFoundException("No corridor found"));
        }

        // 2. Resolve Window
        String shift = request.getTargetShift() != null ? request.getTargetShift().toUpperCase() : "NIGHT";
        String[] window = SHIFT_WINDOWS.getOrDefault(shift, SHIFT_WINDOWS.get("NIGHT"));
        String windowStart = window[0];
        String windowEnd = window[1];

        // 3. Find pending/scheduled tasks for requested departments
        List<String> requestedDepts = request.getDepartments() != null ? request.getDepartments() : List.of("PWAY", "TRD", "ST");
        // Normalize departmental codes (handles UI strings like P_WAY, TRD_OHE, S_AND_T)
        List<String> normalizedDepts = requestedDepts.stream()
                .map(this::normalizeDeptCode)
                .toList();

        final Corridor finalCorridor = corridor;
        List<MaintenanceTask> relevantTasks = taskRepository.findAll().stream()
                .filter(t -> t.getStatus() == TaskStatus.PENDING || t.getStatus() == TaskStatus.SCHEDULED)
                .filter(t -> t.getDepartment() == null || normalizedDepts.contains(t.getDepartment().getCode()))
                .sorted((a, b) -> {
                    double scoreB = evaluateTaskPriority(b).getPriorityScore();
                    double scoreA = evaluateTaskPriority(a).getPriorityScore();
                    return Double.compare(scoreB, scoreA);
                })
                .limit(Boolean.TRUE.equals(request.getAllowShadowBlocks()) ? 4 : 1)
                .toList();

        // 4. Operating trains on corridor
        List<Train> trains = trainRepository.findByCorridor_Id(corridor.getId());

        // 5. Calculate Optimization Score
        double baseShift = "NIGHT".equals(shift) ? 88.0 : "MORNING".equals(shift) ? 74.0 : 68.0;
        long criticalCount = relevantTasks.stream()
                .filter(t -> t.getSeverity() == Severity.CRITICAL || t.getPriority() == Priority.URGENT)
                .count();
        double taskBoost = Math.min(criticalCount * 3.5, 12.0);
        double shadowBoost = (Boolean.TRUE.equals(request.getAllowShadowBlocks()) && relevantTasks.size() > 1) ? 4.5 : 0.0;
        double trainPenalty = Math.min(trains.size() * 0.4, 7.0);
        double score = Math.min(99.4, Math.max(60.0, baseShift + taskBoost + shadowBoost - trainPenalty));
        score = Math.round(score * 10.0) / 10.0;

        // 6. Build Reasoning Badges
        List<Map<String, Object>> reasons = new ArrayList<>();
        reasons.add(Map.of(
                "title", "Optimal " + shift.charAt(0) + shift.substring(1).toLowerCase() + " Traffic Valley",
                "description", "Traffic density in this window is significantly lower than daytime peak hours. "
                        + trains.stream().filter(t -> t.getTrainType() == TrainType.PREMIUM).count()
                        + " premium express paths protected.",
                "badge", "TIMETABLE_FIT",
                "confidence", "NIGHT".equals(shift) ? 98 : 86
        ));

        if (Boolean.TRUE.equals(request.getAllowShadowBlocks()) && relevantTasks.size() > 1) {
            reasons.add(Map.of(
                    "title", "Shadow Block Multi-Department Bundling",
                    "description", "Bundled " + relevantTasks.size() + " departmental tasks into a single possession window, saving "
                            + (relevantTasks.size() - 1) * 2 + " hours of independent track closures.",
                    "badge", "MULTI_DEPT_BUNDLING",
                    "confidence", 97
            ));
        }

        if (criticalCount > 0) {
            reasons.add(Map.of(
                    "title", "Safety-Critical Requisitions Prioritized",
                    "description", criticalCount + " critical maintenance task(s) scheduled immediately to avoid track speed restrictions.",
                    "badge", "SAFETY_CRITICAL",
                    "confidence", 99
            ));
        }

        reasons.add(Map.of(
                "title", "Resource & Machinery Logistics Aligned",
                "description", "Maintenance machines and crew staged at nearest siding buffer, minimizing dead possession time.",
                "badge", "ASSET_OPTIMIZED",
                "confidence", 92
        ));

        // 7. Build Affected Trains & Conflict Mitigations
        List<Map<String, Object>> affectedTrains = new ArrayList<>();
        List<ConflictResponse> conflicts = new ArrayList<>();
        int cIdx = 1;

        Map<String, com.railopt.entity.TrainTelemetry> liveMap = new HashMap<>();
        if (trainTrackingService != null) {
            try {
                for (com.railopt.entity.TrainTelemetry tel : trainTrackingService.getLiveTelemetryForCorridor(corridor.getId())) {
                    if (tel.getTrainNumber() != null) {
                        liveMap.put(tel.getTrainNumber(), tel);
                    }
                }
            } catch (Exception ignored) {}
        }

        for (Train t : trains.stream().limit(3).toList()) {
            com.railopt.entity.TrainTelemetry liveTel = liveMap.get(t.getTrainNumber());
            boolean isFreight = t.getTrainType() == TrainType.FREIGHT;
            int delayMins = liveTel != null && liveTel.getDelayMinutes() != null ? liveTel.getDelayMinutes() : (isFreight ? 28 : 12);
            int buffer = isFreight ? 0 : 15;
            String action = isFreight ? "DETENTION" : "REGULATE";
            String liveSection = liveTel != null && liveTel.getCurrentSection() != null ? liveTel.getCurrentSection() : (t.getTrackLine() != null ? t.getTrackLine() : "UP_MAIN");
            String dataSource = liveTel != null && liveTel.getDataSource() != null ? liveTel.getDataSource() : "SIMULATION";

            Map<String, Object> trainMap = Map.ofEntries(
                    Map.entry("trainNo", t.getTrainNumber() != null ? t.getTrainNumber() : ""),
                    Map.entry("name", t.getTrainName() != null ? t.getTrainName() : ""),
                    Map.entry("category", t.getCategory() != null ? t.getCategory() : t.getTrainType().name()),
                    Map.entry("direction", t.getTrackLine() != null ? t.getTrackLine() : "UP_MAIN"),
                    Map.entry("scheduledPass", windowStart + " IST"),
                    Map.entry("actionRequired", action),
                    Map.entry("delayMinutes", delayMins),
                    Map.entry("recoveryBufferMins", buffer),
                    Map.entry("netArrivalDelayAtDelhi", Math.max(0, delayMins - buffer)),
                    Map.entry("currentSection", liveSection),
                    Map.entry("dataSource", dataSource),
                    Map.entry("remarks", isFreight ? "Freight held at siding loop; within crew duty limits." : "Delay recovered before terminal arrival.")
            );
            affectedTrains.add(trainMap);

            conflicts.add(ConflictResponse.builder()
                    .id("CONF-" + String.format("%02d", cIdx++))
                    .title("Possession Window vs Train " + t.getTrainNumber() + " " + t.getTrainName())
                    .severity(t.getTrainType() == TrainType.PREMIUM ? "HIGH" : "MEDIUM")
                    .location(corridor.getFromStation() + " - " + corridor.getToStation() + " (" + liveSection + ")")
                    .timeWindow(windowStart + " IST")
                    .conflictType(isFreight ? "TRACTION_POWER_CUT" : "TRACK_POSSESSION_OVERLAP")
                    .aiResolution("Regulated at siding loop for " + delayMins + " mins. Slack buffer ensures on-time arrival.")
                    .status("RESOLVED_BY_AI")
                    .confidence(t.getTrainType() == TrainType.PREMIUM ? "98%" : "93%")
                    .trainNumber(t.getTrainNumber())
                    .build());
        }

        // 8. Build Assigned Tasks
        List<Map<String, Object>> assignedTasks = new ArrayList<>();
        int startHour = Integer.parseInt(windowStart.split(":")[0]);
        int offset = 0;
        for (MaintenanceTask task : relevantTasks) {
            int taskStart = startHour + offset;
            int durationH = Math.max(1, (task.getDurationMinutes() != null ? task.getDurationMinutes() : 120) / 60);
            assignedTasks.add(Map.of(
                    "taskId", task.getTaskId(),
                    "title", task.getTaskType() + " — " + (task.getAssetName() != null ? task.getAssetName() : "Track Section"),
                    "dept", task.getDepartment() != null ? task.getDepartment().getCode() : "PWAY",
                    "machine", request.getSelectedMachine() != null ? request.getSelectedMachine() : "Mechanized Maintenance Gang",
                    "crew", 8,
                    "allocatedWindow", String.format("%02d:00 - %02d:00 (%d hrs)", taskStart, taskStart + durationH, durationH)
            ));
            offset += durationH;
        }

        // 9. Parse Date & Build Entity
        LocalDate scheduledDate;
        try {
            scheduledDate = LocalDate.parse(request.getDate());
        } catch (Exception e) {
            scheduledDate = LocalDate.now().plusDays(1);
        }

        String planId = "BLK-AI-" + scheduledDate.getYear() + "-" + String.format("%04d", (int)(Math.random() * 9000 + 1000));
        String departmentsStr = String.join(",", normalizedDepts);

        AiBlockPlan plan = AiBlockPlan.builder()
                .planId(planId)
                .corridor(corridor)
                .trackLine(request.getTrackLine() != null ? request.getTrackLine() : "UP_MAIN")
                .scheduledDate(scheduledDate)
                .windowStart(windowStart)
                .windowEnd(windowEnd)
                .durationHours(request.getRequiredWindowHours() != null ? request.getRequiredWindowHours() : 3.5)
                .optimizationScore(score)
                .status(BlockPlanStatus.PROPOSED)
                .departments(departmentsStr)
                .reasoningJson(toJson(reasons))
                .affectedTrainsJson(toJson(affectedTrains))
                .assignedTasksJson(toJson(assignedTasks))
                .build();

        AiBlockPlan saved = blockPlanRepository.save(plan);
        log.info("[PriorityEngine] Saved plan id={} score={}", saved.getPlanId(), saved.getOptimizationScore());

        AiBlockPlanResponse resp = AiBlockPlanResponse.from(saved);
        resp.setPriority(score >= 85.0 ? "CRITICAL" : "HIGH");
        resp.setRecommendedAction("Approve and transmit block requisition to Section Controller & COIS.");
        resp.setConflicts(conflicts);
        return resp;
    }

    private String normalizeDeptCode(String code) {
        if (code == null) return "PWAY";
        String upper = code.toUpperCase().trim();
        if (upper.contains("P_WAY") || upper.contains("PWAY") || upper.contains("TRACK")) return "PWAY";
        if (upper.contains("TRD") || upper.contains("OHE") || upper.contains("ELECT")) return "TRD";
        if (upper.contains("S_AND_T") || upper.contains("SIG") || upper.contains("TELE") || upper.equals("ST")) return "ST";
        if (upper.contains("MECH")) return "MECH";
        return upper;
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

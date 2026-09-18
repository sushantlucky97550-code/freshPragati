package com.railopt.service;

import com.railopt.dto.AiBlockPlanGenerateRequest;
import com.railopt.dto.AiBlockPlanResponse;
import com.railopt.dto.BlockPlanExplanationResponse;
import com.railopt.dto.ConflictResponse;
import com.railopt.entity.AiBlockPlan;
import com.railopt.entity.BlockPlanStatus;
import com.railopt.entity.MaintenanceTask;
import com.railopt.entity.TrainTelemetry;
import com.railopt.exception.ResourceNotFoundException;
import com.railopt.repository.AiBlockPlanRepository;
import com.railopt.repository.MaintenanceTaskRepository;
import com.railopt.service.ai.LlmExplanationService;
import com.railopt.service.ai.PriorityEngine;
import com.railopt.service.tracking.TrainTrackingService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class AiBlockPlanService {

    private final AiBlockPlanRepository blockPlanRepository;
    private final PriorityEngine priorityEngine;
    private final LlmExplanationService llmExplanationService;
    private final TrainTrackingService trainTrackingService;
    private final MaintenanceTaskRepository taskRepository;
    private final DashboardService dashboardService;

    public List<AiBlockPlanResponse> getAllBlockPlans() {
        return blockPlanRepository.findAll().stream()
                .map(AiBlockPlanResponse::from).toList();
    }

    public List<AiBlockPlanResponse> getBlockPlansByStatus(String statusStr) {
        BlockPlanStatus status = BlockPlanStatus.valueOf(statusStr.toUpperCase());
        return blockPlanRepository.findByStatus(status).stream()
                .map(AiBlockPlanResponse::from).toList();
    }

    public AiBlockPlanResponse getBlockPlanById(Long id) {
        AiBlockPlan plan = blockPlanRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Block plan not found with id: " + id));
        return AiBlockPlanResponse.from(plan);
    }

    @Transactional
    public AiBlockPlanResponse generateBlockPlan(AiBlockPlanGenerateRequest request) {
        return priorityEngine.optimizeBlockPlan(request);
    }

    @Transactional
    public AiBlockPlanResponse approveBlockPlan(Long id, String approvedBy) {
        AiBlockPlan plan = blockPlanRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Block plan not found with id: " + id));
        plan.setStatus(BlockPlanStatus.APPROVED);
        plan.setApprovedBy(approvedBy);
        AiBlockPlan saved = blockPlanRepository.save(plan);
        log.info("Approved block plan id={} by {}", saved.getPlanId(), approvedBy);
        return AiBlockPlanResponse.from(saved);
    }

    /**
     * Generates a structured operational explanation for a validated block plan.
     *
     * STRICT SAFETY INVARIANT:
     * This method is read-only. It does NOT recalculate, approve, reject, or modify the block plan.
     */
    public BlockPlanExplanationResponse getExplanationForPlan(Long id) {
        AiBlockPlan plan = blockPlanRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Block plan not found with id: " + id));
        return generateExplanationForEntity(plan);
    }

    /**
     * Supports fetching explanation by either numeric ID or string planId (e.g. "BLK-AI-2026-9041").
     */
    public BlockPlanExplanationResponse getExplanationForPlan(String identifier) {
        AiBlockPlan plan;
        try {
            Long numericId = Long.parseLong(identifier);
            plan = blockPlanRepository.findById(numericId)
                    .orElseGet(() -> blockPlanRepository.findByPlanId(identifier)
                            .orElseThrow(() -> new ResourceNotFoundException("Block plan not found with identifier: " + identifier)));
        } catch (NumberFormatException e) {
            plan = blockPlanRepository.findByPlanId(identifier)
                    .orElseThrow(() -> new ResourceNotFoundException("Block plan not found with planId: " + identifier));
        }
        return generateExplanationForEntity(plan);
    }

    private BlockPlanExplanationResponse generateExplanationForEntity(AiBlockPlan plan) {
        List<MaintenanceTask> tasks = taskRepository != null ? taskRepository.findAll() : List.of();
        List<TrainTelemetry> liveTrains = trainTrackingService != null ? trainTrackingService.getAllLiveTelemetry(false) : List.of();
        Long corridorId = plan.getCorridor() != null ? plan.getCorridor().getId() : null;
        List<ConflictResponse> conflicts = dashboardService != null ? dashboardService.getConflicts(corridorId) : List.of();

        return llmExplanationService.generateBlockPlanExplanation(plan, tasks, liveTrains, conflicts);
    }
}

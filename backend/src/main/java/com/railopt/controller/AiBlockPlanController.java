package com.railopt.controller;

import com.railopt.dto.AiBlockPlanGenerateRequest;
import com.railopt.dto.AiBlockPlanResponse;
import com.railopt.dto.BlockPlanExplanationResponse;
import com.railopt.entity.BlockPlanVersion;
import com.railopt.service.AiBlockPlanService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
public class AiBlockPlanController {

    private final AiBlockPlanService aiBlockPlanService;

    /**
     * GET /api/ai/block-plans
     * GET /api/ai/block-plans?zone=WCR
     * GET /api/ai/block-plans?status=PROPOSED
     */
    @GetMapping("/block-plans")
    public ResponseEntity<List<AiBlockPlanResponse>> getBlockPlans(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String zone) {
        if (zone != null && !zone.isBlank()) {
            return ResponseEntity.ok(aiBlockPlanService.getBlockPlansByZone(zone));
        }
        if (status != null) {
            return ResponseEntity.ok(aiBlockPlanService.getBlockPlansByStatus(status));
        }
        return ResponseEntity.ok(aiBlockPlanService.getAllBlockPlans());
    }

    @GetMapping("/block-plans/{id}")
    public ResponseEntity<AiBlockPlanResponse> getBlockPlanById(@PathVariable Long id) {
        return ResponseEntity.ok(aiBlockPlanService.getBlockPlanById(id));
    }

    /**
     * GET /api/ai/block-plans/{id}/explanation
     */
    @GetMapping("/block-plans/{id}/explanation")
    public ResponseEntity<BlockPlanExplanationResponse> getBlockPlanExplanation(@PathVariable String id) {
        return ResponseEntity.ok(aiBlockPlanService.getExplanationForPlan(id));
    }

    /**
     * POST /api/ai/block-plans/generate
     * Triggers AI Block Optimizer strictly for selected tasks.
     */
    @PostMapping("/block-plans/generate")
    public ResponseEntity<AiBlockPlanResponse> generateBlockPlan(
            @Valid @RequestBody AiBlockPlanGenerateRequest request) {
        AiBlockPlanResponse response = aiBlockPlanService.generateBlockPlan(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * POST /api/ai/block-plans/{id}/approve
     */
    @PostMapping("/block-plans/{id}/approve")
    public ResponseEntity<AiBlockPlanResponse> approveBlockPlan(
            @PathVariable Long id,
            @RequestBody(required = false) Map<String, String> body) {
        String approvedBy = body != null ? body.getOrDefault("approvedBy", "Section Controller") : "Section Controller";
        return ResponseEntity.ok(aiBlockPlanService.approveBlockPlan(id, approvedBy));
    }

    /**
     * POST /api/ai/block-plans/{id}/approve-step
     * Sequential Department Approval step execution.
     * When all steps complete -> automatically transitions to ACTIVE!
     */
    @PostMapping("/block-plans/{id}/approve-step")
    public ResponseEntity<AiBlockPlanResponse> approveDepartmentStep(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        String deptCode = body.getOrDefault("departmentCode", "PWAY");
        String officerName = body.getOrDefault("officerName", "Senior Section Engineer");
        String remarks = body.getOrDefault("remarks", "Clearance approved.");
        return ResponseEntity.ok(aiBlockPlanService.approveDepartmentStep(id, deptCode, officerName, remarks));
    }

    /**
     * POST /api/ai/block-plans/{id}/update-timing
     * Modifies block window with version increment and audit history.
     */
    @PostMapping("/block-plans/{id}/update-timing")
    public ResponseEntity<AiBlockPlanResponse> updateTiming(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        String newStart = body.getOrDefault("windowStart", "02:00");
        String newEnd = body.getOrDefault("windowEnd", "05:30");
        String reason = body.getOrDefault("reason", "Operational conflict / authorized update");
        String authorizedBy = body.getOrDefault("authorizedBy", "Section Controller");
        return ResponseEntity.ok(aiBlockPlanService.updateBlockTiming(id, newStart, newEnd, reason, authorizedBy));
    }

    /**
     * GET /api/ai/block-plans/{planId}/versions
     */
    @GetMapping("/block-plans/{planId}/versions")
    public ResponseEntity<List<BlockPlanVersion>> getPlanVersions(@PathVariable String planId) {
        return ResponseEntity.ok(aiBlockPlanService.getPlanVersions(planId));
    }
}

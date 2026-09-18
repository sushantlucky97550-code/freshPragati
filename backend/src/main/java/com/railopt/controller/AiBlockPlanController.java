package com.railopt.controller;

import com.railopt.dto.AiBlockPlanGenerateRequest;
import com.railopt.dto.AiBlockPlanResponse;
import com.railopt.dto.BlockPlanExplanationResponse;
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
     * GET /api/ai/block-plans?status=PROPOSED
     */
    @GetMapping("/block-plans")
    public ResponseEntity<List<AiBlockPlanResponse>> getBlockPlans(
            @RequestParam(required = false) String status) {
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
     * Returns structured operational explanation from Gemini AI (or deterministic fallback).
     *
     * STRICT SAFETY INVARIANT:
     * This endpoint is strictly read-only. It does NOT recalculate, approve, or modify the block plan.
     */
    @GetMapping("/block-plans/{id}/explanation")
    public ResponseEntity<BlockPlanExplanationResponse> getBlockPlanExplanation(@PathVariable String id) {
        return ResponseEntity.ok(aiBlockPlanService.getExplanationForPlan(id));
    }

    /**
     * POST /api/ai/block-plans/generate
     * Triggers the AI Priority Engine to generate an optimal block plan.
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
}

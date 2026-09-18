package com.railopt.controller;

import com.railopt.dto.*;
import com.railopt.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;

    /**
     * GET /api/dashboard/summary
     * Aggregated KPI metrics for the 5 dashboard metric cards.
     */
    @GetMapping("/summary")
    public ResponseEntity<DashboardSummaryResponse> getDashboardSummary() {
        return ResponseEntity.ok(dashboardService.getSummary());
    }

    /**
     * GET /api/dashboard/corridor-timeline
     * GET /api/dashboard/corridor-timeline?corridorId=1
     * Train paths, block windows, and relevant maintenance requests for the CorridorTimeline component.
     */
    @GetMapping("/corridor-timeline")
    public ResponseEntity<CorridorTimelineResponse> getCorridorTimeline(
            @RequestParam(required = false) Long corridorId) {
        return ResponseEntity.ok(dashboardService.getCorridorTimeline(corridorId));
    }

    /**
     * GET /api/dashboard/conflicts
     * GET /api/dashboard/conflicts?corridorId=1
     * Live conflict telemetry for the ConflictAlerts component.
     */
    @GetMapping("/conflicts")
    public ResponseEntity<List<ConflictResponse>> getConflicts(
            @RequestParam(required = false) Long corridorId) {
        return ResponseEntity.ok(dashboardService.getConflicts(corridorId));
    }

    /**
     * GET /api/dashboard/maintenance-workload
     * Departmental workload breakdown for the WorkloadDistribution component.
     */
    @GetMapping("/maintenance-workload")
    public ResponseEntity<MaintenanceWorkloadResponse> getMaintenanceWorkload() {
        return ResponseEntity.ok(dashboardService.getMaintenanceWorkload());
    }
}

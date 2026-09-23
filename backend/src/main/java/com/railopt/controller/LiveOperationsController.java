package com.railopt.controller;

import com.railopt.entity.*;
import com.railopt.service.LiveOperationsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/live")
@RequiredArgsConstructor
public class LiveOperationsController {

    private final LiveOperationsService liveService;

    // ─── Station Master <-> Section Officer Communication ───────────────────
    @GetMapping("/communication")
    public ResponseEntity<List<StationCommunication>> getCommunications(
            @RequestParam(required = false) String workId,
            @RequestParam(required = false) String zone) {
        return ResponseEntity.ok(liveService.getCommunications(workId, zone));
    }

    @PostMapping("/communication")
    public ResponseEntity<StationCommunication> sendMessage(@RequestBody StationCommunication msg) {
        return ResponseEntity.status(HttpStatus.CREATED).body(liveService.sendMessage(msg));
    }

    @PostMapping("/communication/{id}/acknowledge")
    public ResponseEntity<StationCommunication> acknowledgeMessage(
            @PathVariable Long id,
            @RequestBody(required = false) Map<String, String> body) {
        String officer = body != null ? body.getOrDefault("officerName", "Section Controller") : "Section Controller";
        return ResponseEntity.ok(liveService.acknowledgeMessage(id, officer));
    }

    // ─── Track Connection / Disconnection ──────────────────────────────────
    @PostMapping("/track-possession")
    public ResponseEntity<Map<String, Object>> toggleTrackPossession(@RequestBody Map<String, String> body) {
        String action = body.getOrDefault("action", "DISCONNECT");
        String workId = body.getOrDefault("workId", "WORK-001");
        String location = body.getOrDefault("location", "Bhopal Section");
        String officerName = body.getOrDefault("officerName", "Section Officer");
        String zone = body.getOrDefault("zone", "WCR");
        return ResponseEntity.ok(liveService.toggleTrackPossession(action, workId, location, officerName, zone));
    }

    // ─── TRD Traction Power (TCP) Requests ──────────────────────────────────
    @GetMapping("/tcp-requests")
    public ResponseEntity<List<TcpRequest>> getTcpRequests(@RequestParam(required = false) String zone) {
        return ResponseEntity.ok(liveService.getTcpRequests(zone));
    }

    @PostMapping("/tcp-requests")
    public ResponseEntity<TcpRequest> createTcpRequest(@RequestBody TcpRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(liveService.createTcpRequest(req));
    }

    @PostMapping("/tcp-requests/{id}/status")
    public ResponseEntity<TcpRequest> updateTcpStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        String status = body.getOrDefault("status", "ACKNOWLEDGED");
        String officer = body.getOrDefault("officerName", "Power Controller (TPC)");
        String remarks = body.getOrDefault("remarks", "Clearance granted.");
        return ResponseEntity.ok(liveService.updateTcpStatus(id, status, officer, remarks));
    }

    // ─── Emergency Reporting ───────────────────────────────────────────────
    @GetMapping("/emergencies")
    public ResponseEntity<List<EmergencyEvent>> getEmergencies(@RequestParam(required = false) String zone) {
        return ResponseEntity.ok(liveService.getEmergencies(zone));
    }

    @PostMapping("/emergencies")
    public ResponseEntity<EmergencyEvent> reportEmergency(@RequestBody EmergencyEvent event) {
        return ResponseEntity.status(HttpStatus.CREATED).body(liveService.reportEmergency(event));
    }

    @PostMapping("/emergencies/{id}/resolve")
    public ResponseEntity<EmergencyEvent> resolveEmergency(
            @PathVariable Long id,
            @RequestBody(required = false) Map<String, String> body) {
        String resolvedBy = body != null ? body.getOrDefault("resolvedBy", "Section Controller") : "Section Controller";
        return ResponseEntity.ok(liveService.resolveEmergency(id, resolvedBy));
    }

    // ─── Final Maintenance Report & ML Pipeline ─────────────────────────────
    @GetMapping("/maintenance-reports")
    public ResponseEntity<List<MaintenanceReport>> getReports(@RequestParam(required = false) String zone) {
        return ResponseEntity.ok(liveService.getReports(zone));
    }

    @PostMapping("/maintenance-reports")
    public ResponseEntity<MaintenanceReport> submitFinalReport(@RequestBody MaintenanceReport report) {
        return ResponseEntity.status(HttpStatus.CREATED).body(liveService.submitFinalReport(report));
    }

    @GetMapping("/ml-insights")
    public ResponseEntity<List<MlTrainingRecord>> getMlInsights(@RequestParam(required = false) String zone) {
        return ResponseEntity.ok(liveService.getMlInsights(zone));
    }
}

package com.railopt.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

/**
 * Root controller providing a friendly overview of API endpoints when visiting http://localhost:8080/
 */
@RestController
public class RootController {

    @GetMapping({"/", "/api"})
    public ResponseEntity<Map<String, Object>> root() {
        return ResponseEntity.ok(Map.of(
                "application", "RailOpt AI Backend",
                "status", "UP",
                "message", "Welcome to RailOpt AI API. Use the endpoints below to interact with the service.",
                "endpoints", Map.of(
                        "health", "/api/health",
                        "departments", "/api/departments",
                        "maintenanceTasks", "/api/maintenance-tasks",
                        "assets", "/api/assets",
                        "trains", "/api/trains",
                        "corridors", "/api/corridors",
                        "blockRequests", "/api/block-requests",
                        "dashboard", "/api/dashboard/summary",
                        "aiBlockPlans", "/api/ai/block-plans"
                )
        ));
    }
}

package com.railopt.controller;

import com.railopt.dto.AuthorizeTodayRequest;
import com.railopt.dto.MaintenanceTaskRequest;
import com.railopt.dto.MaintenanceTaskResponse;
import com.railopt.entity.Priority;
import com.railopt.entity.TaskStatus;
import com.railopt.service.MaintenanceTaskService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST controller for MaintenanceTask CRUD and filter operations.
 * Base path: /api/maintenance-tasks
 */
@RestController
@RequestMapping("/api/maintenance-tasks")
@RequiredArgsConstructor
public class MaintenanceTaskController {

    private final MaintenanceTaskService taskService;

    /**
     * GET /api/maintenance-tasks
     * Returns all maintenance tasks, optionally filtered by zone.
     */
    @GetMapping
    public ResponseEntity<List<MaintenanceTaskResponse>> getAllTasks(
            @RequestParam(required = false) String zone) {
        if (zone != null && !zone.isBlank()) {
            return ResponseEntity.ok(taskService.getTasksByZone(zone));
        }
        return ResponseEntity.ok(taskService.getAllTasks());
    }

    /**
     * GET /api/maintenance-tasks/zone/{zone}
     * Returns tasks strictly scoped to a Railway Zone.
     */
    @GetMapping("/zone/{zone}")
    public ResponseEntity<List<MaintenanceTaskResponse>> getTasksByZone(@PathVariable String zone) {
        return ResponseEntity.ok(taskService.getTasksByZone(zone));
    }

    /**
     * GET /api/maintenance-tasks/today
     * Returns tasks selected & authorized by DOM for Today's Maintenance Work.
     */
    @GetMapping("/today")
    public ResponseEntity<List<MaintenanceTaskResponse>> getTodayTasks(
            @RequestParam(required = false) String zone) {
        return ResponseEntity.ok(taskService.getTodayTasks(zone));
    }

    /**
     * GET /api/maintenance-tasks/active
     * Returns currently active maintenance works.
     */
    @GetMapping("/active")
    public ResponseEntity<List<MaintenanceTaskResponse>> getActiveTasks(
            @RequestParam(required = false) String zone) {
        return ResponseEntity.ok(taskService.getActiveTasks(zone));
    }

    /**
     * POST /api/maintenance-tasks/authorize-today
     * DOM / Sr. DOM Authorization to add selected tasks to Today's Maintenance Work.
     */
    @PostMapping("/authorize-today")
    public ResponseEntity<?> authorizeTodayTasks(@Valid @RequestBody AuthorizeTodayRequest request) {
        try {
            List<MaintenanceTaskResponse> authorized = taskService.authorizeTodayTasks(request);
            return ResponseEntity.ok(authorized);
        } catch (org.springframework.security.authentication.BadCredentialsException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(java.util.Map.of(
                    "success", false,
                    "error", "AUTHORIZATION_FAILED",
                    "message", e.getMessage()
            ));
        }
    }

    /**
     * GET /api/maintenance-tasks/{id}
     * Returns a single task by database ID.
     */
    @GetMapping("/{id}")
    public ResponseEntity<MaintenanceTaskResponse> getTaskById(@PathVariable Long id) {
        return ResponseEntity.ok(taskService.getTaskById(id));
    }

    /**
     * GET /api/maintenance-tasks/status/{status}
     */
    @GetMapping("/status/{status}")
    public ResponseEntity<List<MaintenanceTaskResponse>> getTasksByStatus(
            @PathVariable TaskStatus status) {
        return ResponseEntity.ok(taskService.getTasksByStatus(status));
    }

    /**
     * GET /api/maintenance-tasks/priority/{priority}
     */
    @GetMapping("/priority/{priority}")
    public ResponseEntity<List<MaintenanceTaskResponse>> getTasksByPriority(
            @PathVariable Priority priority) {
        return ResponseEntity.ok(taskService.getTasksByPriority(priority));
    }

    /**
     * GET /api/maintenance-tasks/department/{departmentId}
     */
    @GetMapping("/department/{departmentId}")
    public ResponseEntity<List<MaintenanceTaskResponse>> getTasksByDepartment(
            @PathVariable Long departmentId) {
        return ResponseEntity.ok(taskService.getTasksByDepartment(departmentId));
    }

    /**
     * POST /api/maintenance-tasks
     * Creates a new maintenance task. Returns 201 Created.
     */
    @PostMapping
    public ResponseEntity<MaintenanceTaskResponse> createTask(
            @Valid @RequestBody MaintenanceTaskRequest request) {
        MaintenanceTaskResponse response = taskService.createTask(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * PUT /api/maintenance-tasks/{id}
     */
    @PutMapping("/{id}")
    public ResponseEntity<MaintenanceTaskResponse> updateTask(
            @PathVariable Long id,
            @Valid @RequestBody MaintenanceTaskRequest request) {
        return ResponseEntity.ok(taskService.updateTask(id, request));
    }

    /**
     * DELETE /api/maintenance-tasks/{id}
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTask(@PathVariable Long id) {
        taskService.deleteTask(id);
        return ResponseEntity.noContent().build();
    }
}

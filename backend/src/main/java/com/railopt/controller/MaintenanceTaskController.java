package com.railopt.controller;

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
 *
 * Base path: /api/maintenance-tasks
 */
@RestController
@RequestMapping("/api/maintenance-tasks")
@RequiredArgsConstructor
public class MaintenanceTaskController {

    private final MaintenanceTaskService taskService;

    /**
     * GET /api/maintenance-tasks
     * Returns all maintenance tasks.
     */
    @GetMapping
    public ResponseEntity<List<MaintenanceTaskResponse>> getAllTasks() {
        return ResponseEntity.ok(taskService.getAllTasks());
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
     * Returns all tasks matching the given status.
     * Valid values: PENDING, SCHEDULED, IN_PROGRESS, COMPLETED, DEFERRED, CANCELLED
     */
    @GetMapping("/status/{status}")
    public ResponseEntity<List<MaintenanceTaskResponse>> getTasksByStatus(
            @PathVariable TaskStatus status) {
        return ResponseEntity.ok(taskService.getTasksByStatus(status));
    }

    /**
     * GET /api/maintenance-tasks/priority/{priority}
     * Returns all tasks matching the given priority.
     * Valid values: LOW, MEDIUM, HIGH, URGENT
     */
    @GetMapping("/priority/{priority}")
    public ResponseEntity<List<MaintenanceTaskResponse>> getTasksByPriority(
            @PathVariable Priority priority) {
        return ResponseEntity.ok(taskService.getTasksByPriority(priority));
    }

    /**
     * GET /api/maintenance-tasks/department/{departmentId}
     * Returns all tasks belonging to a specific department.
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
     * Updates an existing maintenance task.
     */
    @PutMapping("/{id}")
    public ResponseEntity<MaintenanceTaskResponse> updateTask(
            @PathVariable Long id,
            @Valid @RequestBody MaintenanceTaskRequest request) {
        return ResponseEntity.ok(taskService.updateTask(id, request));
    }

    /**
     * DELETE /api/maintenance-tasks/{id}
     * Deletes a maintenance task. Returns 204 No Content.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTask(@PathVariable Long id) {
        taskService.deleteTask(id);
        return ResponseEntity.noContent().build();
    }
}

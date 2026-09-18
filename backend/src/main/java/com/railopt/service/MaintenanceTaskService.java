package com.railopt.service;

import com.railopt.dto.MaintenanceTaskRequest;
import com.railopt.dto.MaintenanceTaskResponse;
import com.railopt.entity.Department;
import com.railopt.entity.MaintenanceTask;
import com.railopt.entity.Priority;
import com.railopt.entity.TaskStatus;
import com.railopt.exception.DuplicateResourceException;
import com.railopt.exception.ResourceNotFoundException;
import com.railopt.repository.DepartmentRepository;
import com.railopt.repository.MaintenanceTaskRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class MaintenanceTaskService {

    private final MaintenanceTaskRepository taskRepository;
    private final DepartmentRepository departmentRepository;

    /**
     * Returns all maintenance tasks with their department info eagerly loaded.
     */
    public List<MaintenanceTaskResponse> getAllTasks() {
        log.debug("Fetching all maintenance tasks");
        return taskRepository.findAllWithDepartment()
                .stream()
                .map(MaintenanceTaskResponse::from)
                .toList();
    }

    /**
     * Returns a single maintenance task by its database ID.
     *
     * @throws ResourceNotFoundException if not found
     */
    public MaintenanceTaskResponse getTaskById(Long id) {
        log.debug("Fetching maintenance task id: {}", id);
        MaintenanceTask task = findTaskOrThrow(id);
        return MaintenanceTaskResponse.from(task);
    }

    /**
     * Returns all tasks matching a given lifecycle status.
     */
    public List<MaintenanceTaskResponse> getTasksByStatus(TaskStatus status) {
        log.debug("Fetching tasks with status: {}", status);
        return taskRepository.findByStatusWithDepartment(status)
                .stream()
                .map(MaintenanceTaskResponse::from)
                .toList();
    }

    /**
     * Returns all tasks matching a given scheduling priority.
     */
    public List<MaintenanceTaskResponse> getTasksByPriority(Priority priority) {
        log.debug("Fetching tasks with priority: {}", priority);
        return taskRepository.findByPriorityWithDepartment(priority)
                .stream()
                .map(MaintenanceTaskResponse::from)
                .toList();
    }

    /**
     * Returns all tasks belonging to a specific department.
     *
     * @throws ResourceNotFoundException if the department does not exist
     */
    public List<MaintenanceTaskResponse> getTasksByDepartment(Long departmentId) {
        log.debug("Fetching tasks for department id: {}", departmentId);
        if (!departmentRepository.existsById(departmentId)) {
            throw new ResourceNotFoundException("Department not found with id: " + departmentId);
        }
        return taskRepository.findByDepartmentIdWithDepartment(departmentId)
                .stream()
                .map(MaintenanceTaskResponse::from)
                .toList();
    }

    /**
     * Creates a new maintenance task.
     *
     * @throws ResourceNotFoundException  if the referenced department does not exist
     * @throws DuplicateResourceException if a task with the same taskId already exists
     */
    @Transactional
    public MaintenanceTaskResponse createTask(MaintenanceTaskRequest request) {
        log.info("Creating maintenance task: {}", request.getTaskId());

        if (taskRepository.existsByTaskId(request.getTaskId())) {
            throw new DuplicateResourceException(
                    "Maintenance task with taskId '" + request.getTaskId() + "' already exists");
        }

        Department department = findDepartmentOrThrow(request.getDepartmentId());

        MaintenanceTask task = MaintenanceTask.builder()
                .taskId(request.getTaskId())
                .department(department)
                .assetName(request.getAssetName())
                .location(request.getLocation())
                .taskType(request.getTaskType())
                .description(request.getDescription())
                .severity(request.getSeverity())
                .priority(request.getPriority())
                .durationMinutes(request.getDurationMinutes())
                .dueDate(request.getDueDate())
                .status(request.getStatus() != null ? request.getStatus() : TaskStatus.PENDING)
                .build();

        MaintenanceTask saved = taskRepository.save(task);
        log.info("Created maintenance task id={}, taskId={}", saved.getId(), saved.getTaskId());
        return MaintenanceTaskResponse.from(saved);
    }

    /**
     * Updates an existing maintenance task.
     *
     * @throws ResourceNotFoundException  if the task or referenced department does not exist
     * @throws DuplicateResourceException if the new taskId conflicts with another task
     */
    @Transactional
    public MaintenanceTaskResponse updateTask(Long id, MaintenanceTaskRequest request) {
        log.info("Updating maintenance task id: {}", id);
        MaintenanceTask task = findTaskOrThrow(id);

        if (taskRepository.existsByTaskIdAndIdNot(request.getTaskId(), id)) {
            throw new DuplicateResourceException(
                    "Maintenance task with taskId '" + request.getTaskId() + "' already exists");
        }

        Department department = findDepartmentOrThrow(request.getDepartmentId());

        task.setTaskId(request.getTaskId());
        task.setDepartment(department);
        task.setAssetName(request.getAssetName());
        task.setLocation(request.getLocation());
        task.setTaskType(request.getTaskType());
        task.setDescription(request.getDescription());
        task.setSeverity(request.getSeverity());
        task.setPriority(request.getPriority());
        task.setDurationMinutes(request.getDurationMinutes());
        task.setDueDate(request.getDueDate());
        if (request.getStatus() != null) {
            task.setStatus(request.getStatus());
        }

        MaintenanceTask saved = taskRepository.save(task);
        log.info("Updated maintenance task id={}", saved.getId());
        return MaintenanceTaskResponse.from(saved);
    }

    /**
     * Deletes a maintenance task by ID.
     *
     * @throws ResourceNotFoundException if not found
     */
    @Transactional
    public void deleteTask(Long id) {
        log.info("Deleting maintenance task id: {}", id);
        MaintenanceTask task = findTaskOrThrow(id);
        taskRepository.delete(task);
        log.info("Deleted maintenance task id={}", id);
    }

    // ─── Internal helpers ────────────────────────────────────────────────────

    private MaintenanceTask findTaskOrThrow(Long id) {
        return taskRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Maintenance task not found with id: " + id));
    }

    private Department findDepartmentOrThrow(Long id) {
        return departmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Department not found with id: " + id));
    }
}

package com.railopt.service;

import com.railopt.dto.AuthorizeTodayRequest;
import com.railopt.dto.MaintenanceTaskRequest;
import com.railopt.dto.MaintenanceTaskResponse;
import com.railopt.entity.*;
import com.railopt.exception.DuplicateResourceException;
import com.railopt.exception.ResourceNotFoundException;
import com.railopt.repository.AuthAuditLogRepository;
import com.railopt.repository.DepartmentRepository;
import com.railopt.repository.MaintenanceTaskRepository;
import com.railopt.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class MaintenanceTaskService {

    private final MaintenanceTaskRepository taskRepository;
    private final DepartmentRepository departmentRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthAuditLogRepository auditLogRepository;

    /**
     * Returns all maintenance tasks with their department info eagerly loaded.
     */
    public List<MaintenanceTaskResponse> getAllTasks() {
        return taskRepository.findAll()
                .stream()
                .map(MaintenanceTaskResponse::from)
                .toList();
    }

    /**
     * Returns tasks scoped by Railway Zone (Requirement 6 & 41).
     */
    public List<MaintenanceTaskResponse> getTasksByZone(String zone) {
        if (zone == null || zone.isBlank()) return getAllTasks();
        return taskRepository.findByZone(zone.toUpperCase())
                .stream()
                .map(MaintenanceTaskResponse::from)
                .toList();
    }

    /**
     * Returns Today's Maintenance Work — tasks selected and authorized by DOM/Sr. DOM.
     * (Requirement 18)
     */
    public List<MaintenanceTaskResponse> getTodayTasks(String zone) {
        List<MaintenanceTask> tasks = (zone != null && !zone.isBlank())
                ? taskRepository.findByZone(zone.toUpperCase())
                : taskRepository.findAll();

        return tasks.stream()
                .filter(t -> "DOM_AUTHORIZED".equalsIgnoreCase(t.getLifecycleState())
                        || "SELECTED_FOR_TODAY".equalsIgnoreCase(t.getLifecycleState())
                        || "BLOCK_PLAN_GENERATED".equalsIgnoreCase(t.getLifecycleState())
                        || "APPROVAL_IN_PROGRESS".equalsIgnoreCase(t.getLifecycleState())
                        || "FULLY_APPROVED".equalsIgnoreCase(t.getLifecycleState()))
                .map(MaintenanceTaskResponse::from)
                .toList();
    }

    /**
     * Returns Currently Active Maintenance Work.
     * (Requirement 25 & 26)
     */
    public List<MaintenanceTaskResponse> getActiveTasks(String zone) {
        List<MaintenanceTask> tasks = (zone != null && !zone.isBlank())
                ? taskRepository.findByZone(zone.toUpperCase())
                : taskRepository.findAll();

        return tasks.stream()
                .filter(t -> "ACTIVE".equalsIgnoreCase(t.getLifecycleState())
                        || "WORK_IN_PROGRESS".equalsIgnoreCase(t.getLifecycleState())
                        || t.getStatus() == TaskStatus.IN_PROGRESS)
                .map(MaintenanceTaskResponse::from)
                .toList();
    }

    /**
     * Returns a single maintenance task by its database ID.
     */
    public MaintenanceTaskResponse getTaskById(Long id) {
        MaintenanceTask task = findTaskOrThrow(id);
        return MaintenanceTaskResponse.from(task);
    }

    /**
     * Returns all tasks matching a given lifecycle status.
     */
    public List<MaintenanceTaskResponse> getTasksByStatus(TaskStatus status) {
        return taskRepository.findByStatus(status)
                .stream()
                .map(MaintenanceTaskResponse::from)
                .toList();
    }

    /**
     * Returns all tasks matching a given scheduling priority.
     */
    public List<MaintenanceTaskResponse> getTasksByPriority(Priority priority) {
        return taskRepository.findByPriority(priority)
                .stream()
                .map(MaintenanceTaskResponse::from)
                .toList();
    }

    /**
     * Returns all tasks belonging to a specific department.
     */
    public List<MaintenanceTaskResponse> getTasksByDepartment(Long departmentId) {
        if (!departmentRepository.existsById(departmentId)) {
            throw new ResourceNotFoundException("Department not found with id: " + departmentId);
        }
        return taskRepository.findByDepartmentId(departmentId)
                .stream()
                .map(MaintenanceTaskResponse::from)
                .toList();
    }

    /**
     * Creates a new maintenance task.
     * Persists in MongoDB with complete metadata (Requirement 10).
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
                .zone(request.getZone() != null ? request.getZone().toUpperCase() : "WCR")
                .division(request.getDivision() != null ? request.getDivision() : "Bhopal")
                .fromStation(request.getFromStation() != null ? request.getFromStation() : "BPL")
                .toStation(request.getToStation() != null ? request.getToStation() : "SEH")
                .section(request.getSection() != null ? request.getSection() : "Bhopal – Sehore")
                .assetName(request.getAssetName())
                .location(request.getLocation())
                .taskType(request.getTaskType())
                .description(request.getDescription())
                .severity(request.getSeverity() != null ? request.getSeverity() : Severity.MEDIUM)
                .priority(request.getPriority() != null ? request.getPriority() : Priority.MEDIUM)
                .criticality(request.getCriticality() != null ? request.getCriticality() : "HIGH")
                .durationMinutes(request.getDurationMinutes())
                .dueDate(request.getDueDate())
                .manpower(request.getManpower() != null ? request.getManpower() : 12)
                .equipment(request.getEquipment())
                .dependencies(request.getDependencies())
                .supportingDepartments(request.getSupportingDepartments() != null ? request.getSupportingDepartments() : new ArrayList<>())
                .status(request.getStatus() != null ? request.getStatus() : TaskStatus.PENDING)
                .lifecycleState(request.getLifecycleState() != null ? request.getLifecycleState() : "REQUESTED")
                .submittedBy(request.getSubmittedBy() != null ? request.getSubmittedBy() : "OFFICER")
                .build();

        MaintenanceTask saved = taskRepository.save(task);
        log.info("Created maintenance task id={}, taskId={}", saved.getId(), saved.getTaskId());
        return MaintenanceTaskResponse.from(saved);
    }

    /**
     * DOM / Sr. DOM Authorization to add selected tasks to Today's Maintenance Work.
     * (Requirement 14 & 15)
     */
    @Transactional
    public List<MaintenanceTaskResponse> authorizeTodayTasks(AuthorizeTodayRequest request) {
        String officerId = request.getOfficerId().trim();
        log.info("[DOM Auth] Verifying DOM authorization for officer: {}", officerId);

        User officer = userRepository.findByOfficerId(officerId)
                .orElseThrow(() -> new BadCredentialsException("Invalid DOM Officer ID or unauthorized credentials."));

        if (!passwordEncoder.matches(request.getPassword(), officer.getPasswordHash())) {
            throw new BadCredentialsException("Invalid DOM Officer password.");
        }

        // Verify role is authorized (DOM, Sr. DOM, DRM, ADMIN, OPERATIONS_CONTROL)
        String role = officer.getRole();
        boolean isAuthorizedRole = "DOM".equalsIgnoreCase(role)
                || "SR_DOM".equalsIgnoreCase(role)
                || "DRM".equalsIgnoreCase(role)
                || "ADMIN".equalsIgnoreCase(role)
                || "OPERATIONS_CONTROL".equalsIgnoreCase(role);

        if (!isAuthorizedRole) {
            throw new BadCredentialsException("Officer " + officerId + " does not hold DOM / Sr. DOM operating authorization.");
        }

        List<MaintenanceTaskResponse> authorizedList = new ArrayList<>();

        for (String tid : request.getTaskIds()) {
            MaintenanceTask task = null;
            try {
                Long numId = Long.parseLong(tid);
                task = taskRepository.findById(numId).orElse(null);
            } catch (NumberFormatException ignored) {}

            if (task == null) {
                task = taskRepository.findByTaskId(tid).orElse(null);
            }

            if (task != null) {
                task.setLifecycleState("DOM_AUTHORIZED");
                task.setStatus(TaskStatus.SCHEDULED);
                taskRepository.save(task);
                authorizedList.add(MaintenanceTaskResponse.from(task));
            }
        }

        // Record audit trail
        try {
            AuthAuditLog audit = AuthAuditLog.builder()
                    .officerId(officerId)
                    .eventType(AuthEventType.LOGIN_SUCCESS)
                    .timestamp(LocalDateTime.now())
                    .ipAddress("127.0.0.1")
                    .userAgent("RailOpt Control Console")
                    .success(true)
                    .details("DOM Authorization: Added " + authorizedList.size() + " tasks to Today's Maintenance Work. Remarks: " + request.getRemarks())
                    .build();
            auditLogRepository.save(audit);
        } catch (Exception ignored) {}

        log.info("[DOM Auth] Successfully authorized {} tasks for Today's Work by officer {}", authorizedList.size(), officerId);
        return authorizedList;
    }

    /**
     * Updates an existing maintenance task.
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
        if (request.getZone() != null) task.setZone(request.getZone());
        if (request.getDivision() != null) task.setDivision(request.getDivision());
        if (request.getFromStation() != null) task.setFromStation(request.getFromStation());
        if (request.getToStation() != null) task.setToStation(request.getToStation());
        if (request.getSection() != null) task.setSection(request.getSection());
        task.setAssetName(request.getAssetName());
        task.setLocation(request.getLocation());
        task.setTaskType(request.getTaskType());
        task.setDescription(request.getDescription());
        task.setSeverity(request.getSeverity());
        task.setPriority(request.getPriority());
        if (request.getCriticality() != null) task.setCriticality(request.getCriticality());
        task.setDurationMinutes(request.getDurationMinutes());
        task.setDueDate(request.getDueDate());
        if (request.getManpower() != null) task.setManpower(request.getManpower());
        if (request.getEquipment() != null) task.setEquipment(request.getEquipment());
        if (request.getStatus() != null) task.setStatus(request.getStatus());
        if (request.getLifecycleState() != null) task.setLifecycleState(request.getLifecycleState());

        MaintenanceTask saved = taskRepository.save(task);
        log.info("Updated maintenance task id={}", saved.getId());
        return MaintenanceTaskResponse.from(saved);
    }

    /**
     * Deletes a maintenance task by ID.
     */
    @Transactional
    public void deleteTask(Long id) {
        log.info("Deleting maintenance task id: {}", id);
        MaintenanceTask task = findTaskOrThrow(id);
        taskRepository.delete(task);
        log.info("Deleted maintenance task id={}", id);
    }

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

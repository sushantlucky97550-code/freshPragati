package com.railopt.service;

import com.railopt.dto.MaintenanceTaskRequest;
import com.railopt.dto.MaintenanceTaskResponse;
import com.railopt.entity.*;
import com.railopt.exception.DuplicateResourceException;
import com.railopt.exception.ResourceNotFoundException;
import com.railopt.repository.DepartmentRepository;
import com.railopt.repository.MaintenanceTaskRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("MaintenanceTaskService Unit Tests")
class MaintenanceTaskServiceTest {

    @Mock
    private MaintenanceTaskRepository taskRepository;

    @Mock
    private DepartmentRepository departmentRepository;

    @InjectMocks
    private MaintenanceTaskService taskService;

    private Department sampleDepartment;
    private MaintenanceTask sampleTask;

    @BeforeEach
    void setUp() {
        sampleDepartment = Department.builder()
                .id(1L).name("Permanent Way").code("PWAY")
                .status(DepartmentStatus.ACTIVE).build();

        sampleTask = MaintenanceTask.builder()
                .id(1L)
                .taskId("TASK-PWAY-001")
                .department(sampleDepartment)
                .assetName("Track TDL-162")
                .location("Tundla, km 162")
                .taskType("Track Geometry Correction")
                .severity(Severity.HIGH)
                .priority(Priority.HIGH)
                .durationMinutes(240)
                .dueDate(LocalDate.now().plusDays(5))
                .status(TaskStatus.PENDING)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();
    }

    // ─── getAllTasks ──────────────────────────────────────────────────────────

    @Test
    @DisplayName("getAllTasks: returns mapped response list")
    void getAllTasks_returnsList() {
        when(taskRepository.findAllWithDepartment()).thenReturn(List.of(sampleTask));

        List<MaintenanceTaskResponse> result = taskService.getAllTasks();

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getTaskId()).isEqualTo("TASK-PWAY-001");
        assertThat(result.get(0).getDepartmentCode()).isEqualTo("PWAY");
    }

    // ─── getTaskById ──────────────────────────────────────────────────────────

    @Test
    @DisplayName("getTaskById: returns task when found")
    void getTaskById_found() {
        when(taskRepository.findById(1L)).thenReturn(Optional.of(sampleTask));

        MaintenanceTaskResponse result = taskService.getTaskById(1L);

        assertThat(result.getId()).isEqualTo(1L);
        assertThat(result.getSeverity()).isEqualTo(Severity.HIGH);
    }

    @Test
    @DisplayName("getTaskById: throws ResourceNotFoundException when not found")
    void getTaskById_notFound() {
        when(taskRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> taskService.getTaskById(99L))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("99");
    }

    // ─── createTask ───────────────────────────────────────────────────────────

    @Test
    @DisplayName("createTask: saves and returns response when taskId is unique")
    void createTask_success() {
        MaintenanceTaskRequest request = buildValidRequest();

        when(taskRepository.existsByTaskId("TASK-ST-001")).thenReturn(false);
        when(departmentRepository.findById(1L)).thenReturn(Optional.of(sampleDepartment));
        when(taskRepository.save(any(MaintenanceTask.class))).thenAnswer(inv -> {
            MaintenanceTask t = inv.getArgument(0);
            t.setId(5L);
            t.setCreatedAt(LocalDateTime.now());
            t.setUpdatedAt(LocalDateTime.now());
            return t;
        });

        MaintenanceTaskResponse result = taskService.createTask(request);

        assertThat(result.getTaskId()).isEqualTo("TASK-ST-001");
        assertThat(result.getStatus()).isEqualTo(TaskStatus.PENDING);
    }

    @Test
    @DisplayName("createTask: throws DuplicateResourceException when taskId exists")
    void createTask_duplicateTaskId() {
        MaintenanceTaskRequest request = buildValidRequest();
        when(taskRepository.existsByTaskId("TASK-ST-001")).thenReturn(true);

        assertThatThrownBy(() -> taskService.createTask(request))
                .isInstanceOf(DuplicateResourceException.class)
                .hasMessageContaining("TASK-ST-001");

        verify(taskRepository, never()).save(any());
    }

    @Test
    @DisplayName("createTask: throws ResourceNotFoundException when department not found")
    void createTask_departmentNotFound() {
        MaintenanceTaskRequest request = buildValidRequest();
        when(taskRepository.existsByTaskId("TASK-ST-001")).thenReturn(false);
        when(departmentRepository.findById(1L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> taskService.createTask(request))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("Department");
    }

    // ─── getTasksByStatus ─────────────────────────────────────────────────────

    @Test
    @DisplayName("getTasksByStatus: returns tasks filtered by status")
    void getTasksByStatus_returnsList() {
        when(taskRepository.findByStatusWithDepartment(TaskStatus.PENDING))
                .thenReturn(List.of(sampleTask));

        List<MaintenanceTaskResponse> result = taskService.getTasksByStatus(TaskStatus.PENDING);

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getStatus()).isEqualTo(TaskStatus.PENDING);
    }

    // ─── Helpers ─────────────────────────────────────────────────────────────

    private MaintenanceTaskRequest buildValidRequest() {
        MaintenanceTaskRequest req = new MaintenanceTaskRequest();
        req.setTaskId("TASK-ST-001");
        req.setDepartmentId(1L);
        req.setAssetName("Signal ALJN-44");
        req.setLocation("Aligarh Junction, Platform 4");
        req.setTaskType("Signal Lamp Replacement");
        req.setSeverity(Severity.HIGH);
        req.setPriority(Priority.HIGH);
        req.setDurationMinutes(120);
        req.setDueDate(LocalDate.now().plusDays(3));
        return req;
    }
}

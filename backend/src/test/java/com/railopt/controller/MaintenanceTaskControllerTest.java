package com.railopt.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.railopt.dto.MaintenanceTaskRequest;
import com.railopt.dto.MaintenanceTaskResponse;
import com.railopt.entity.Priority;
import com.railopt.entity.Severity;
import com.railopt.entity.TaskStatus;
import com.railopt.exception.GlobalExceptionHandler;
import com.railopt.exception.ResourceNotFoundException;
import com.railopt.service.MaintenanceTaskService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDate;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(MaintenanceTaskController.class)
@Import(GlobalExceptionHandler.class)
@DisplayName("MaintenanceTaskController Slice Tests")
class MaintenanceTaskControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private MaintenanceTaskService taskService;

    private MaintenanceTaskResponse createSampleResponse(Long id, String taskId, TaskStatus status, Priority priority) {
        return MaintenanceTaskResponse.builder()
                .id(id)
                .taskId(taskId)
                .departmentId(1L)
                .departmentName("Permanent Way")
                .departmentCode("PWAY")
                .assetName("Track TDL-162")
                .location("Tundla Yard")
                .taskType("Geometry Correction")
                .severity(Severity.HIGH)
                .priority(priority)
                .durationMinutes(240)
                .dueDate(LocalDate.now().plusDays(5))
                .status(status)
                .build();
    }

    private MaintenanceTaskRequest createSampleRequest(String taskId) {
        MaintenanceTaskRequest request = new MaintenanceTaskRequest();
        request.setTaskId(taskId);
        request.setDepartmentId(1L);
        request.setAssetName("Track TDL-162");
        request.setLocation("Tundla Yard");
        request.setTaskType("Geometry Correction");
        request.setSeverity(Severity.HIGH);
        request.setPriority(Priority.HIGH);
        request.setDurationMinutes(240);
        request.setDueDate(LocalDate.now().plusDays(5));
        request.setStatus(TaskStatus.PENDING);
        return request;
    }

    // ─── GET /api/maintenance-tasks ──────────────────────────────────────────

    @Test
    @DisplayName("GET /api/maintenance-tasks → 200 OK with task list")
    void getAllTasks_returns200() throws Exception {
        MaintenanceTaskResponse resp = createSampleResponse(1L, "TASK-PWAY-001", TaskStatus.PENDING, Priority.HIGH);
        when(taskService.getAllTasks()).thenReturn(List.of(resp));

        mockMvc.perform(get("/api/maintenance-tasks"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(1))
                .andExpect(jsonPath("$[0].taskId").value("TASK-PWAY-001"))
                .andExpect(jsonPath("$[0].departmentCode").value("PWAY"));
    }

    // ─── GET /api/maintenance-tasks/{id} ──────────────────────────────────────

    @Test
    @DisplayName("GET /api/maintenance-tasks/1 → 200 OK")
    void getTaskById_returns200() throws Exception {
        MaintenanceTaskResponse resp = createSampleResponse(1L, "TASK-PWAY-001", TaskStatus.PENDING, Priority.HIGH);
        when(taskService.getTaskById(1L)).thenReturn(resp);

        mockMvc.perform(get("/api/maintenance-tasks/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.taskId").value("TASK-PWAY-001"));
    }

    @Test
    @DisplayName("GET /api/maintenance-tasks/99 → 404 Not Found")
    void getTaskById_notFound() throws Exception {
        when(taskService.getTaskById(99L))
                .thenThrow(new ResourceNotFoundException("Maintenance task not found with id: 99"));

        mockMvc.perform(get("/api/maintenance-tasks/99"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status").value(404))
                .andExpect(jsonPath("$.message").value("Maintenance task not found with id: 99"));
    }

    // ─── GET /api/maintenance-tasks/status/{status} ───────────────────────────

    @Test
    @DisplayName("GET /api/maintenance-tasks/status/PENDING → 200 OK")
    void getTasksByStatus_returns200() throws Exception {
        MaintenanceTaskResponse resp = createSampleResponse(1L, "TASK-PWAY-001", TaskStatus.PENDING, Priority.HIGH);
        when(taskService.getTasksByStatus(TaskStatus.PENDING)).thenReturn(List.of(resp));

        mockMvc.perform(get("/api/maintenance-tasks/status/PENDING"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].status").value("PENDING"));
    }

    // ─── GET /api/maintenance-tasks/priority/{priority} ───────────────────────

    @Test
    @DisplayName("GET /api/maintenance-tasks/priority/HIGH → 200 OK")
    void getTasksByPriority_returns200() throws Exception {
        MaintenanceTaskResponse resp = createSampleResponse(1L, "TASK-PWAY-001", TaskStatus.PENDING, Priority.HIGH);
        when(taskService.getTasksByPriority(Priority.HIGH)).thenReturn(List.of(resp));

        mockMvc.perform(get("/api/maintenance-tasks/priority/HIGH"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].priority").value("HIGH"));
    }

    // ─── GET /api/maintenance-tasks/department/{departmentId} ─────────────────

    @Test
    @DisplayName("GET /api/maintenance-tasks/department/1 → 200 OK")
    void getTasksByDepartment_returns200() throws Exception {
        MaintenanceTaskResponse resp = createSampleResponse(1L, "TASK-PWAY-001", TaskStatus.PENDING, Priority.HIGH);
        when(taskService.getTasksByDepartment(1L)).thenReturn(List.of(resp));

        mockMvc.perform(get("/api/maintenance-tasks/department/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].departmentId").value(1));
    }

    // ─── POST /api/maintenance-tasks ──────────────────────────────────────────

    @Test
    @DisplayName("POST /api/maintenance-tasks → 201 Created")
    void createTask_returns201() throws Exception {
        MaintenanceTaskRequest request = createSampleRequest("TASK-PWAY-001");
        MaintenanceTaskResponse resp = createSampleResponse(1L, "TASK-PWAY-001", TaskStatus.PENDING, Priority.HIGH);

        when(taskService.createTask(any(MaintenanceTaskRequest.class))).thenReturn(resp);

        mockMvc.perform(post("/api/maintenance-tasks")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.taskId").value("TASK-PWAY-001"));
    }

    @Test
    @DisplayName("POST /api/maintenance-tasks with invalid body → 400 Bad Request")
    void createTask_invalid_returns400() throws Exception {
        MaintenanceTaskRequest request = new MaintenanceTaskRequest();
        // Missing all required fields

        mockMvc.perform(post("/api/maintenance-tasks")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.errors.taskId").exists())
                .andExpect(jsonPath("$.errors.departmentId").exists())
                .andExpect(jsonPath("$.errors.assetName").exists());
    }

    // ─── PUT /api/maintenance-tasks/{id} ──────────────────────────────────────

    @Test
    @DisplayName("PUT /api/maintenance-tasks/1 → 200 OK")
    void updateTask_returns200() throws Exception {
        MaintenanceTaskRequest request = createSampleRequest("TASK-PWAY-001");
        MaintenanceTaskResponse resp = createSampleResponse(1L, "TASK-PWAY-001", TaskStatus.SCHEDULED, Priority.URGENT);

        when(taskService.updateTask(eq(1L), any(MaintenanceTaskRequest.class))).thenReturn(resp);

        mockMvc.perform(put("/api/maintenance-tasks/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.status").value("SCHEDULED"));
    }

    // ─── DELETE /api/maintenance-tasks/{id} ───────────────────────────────────

    @Test
    @DisplayName("DELETE /api/maintenance-tasks/1 → 204 No Content")
    void deleteTask_returns204() throws Exception {
        doNothing().when(taskService).deleteTask(1L);

        mockMvc.perform(delete("/api/maintenance-tasks/1"))
                .andExpect(status().isNoContent());

        verify(taskService).deleteTask(1L);
    }
}

package com.railopt.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.railopt.dto.DepartmentRequest;
import com.railopt.dto.DepartmentResponse;
import com.railopt.entity.DepartmentStatus;
import com.railopt.exception.GlobalExceptionHandler;
import com.railopt.exception.ResourceNotFoundException;
import com.railopt.service.DepartmentService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(DepartmentController.class)
@Import(GlobalExceptionHandler.class)
@DisplayName("DepartmentController Slice Tests")
class DepartmentControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private DepartmentService departmentService;

    // ─── GET /api/departments ─────────────────────────────────────────────────

    @Test
    @DisplayName("GET /api/departments → 200 OK with list")
    void getAllDepartments_returns200() throws Exception {
        DepartmentResponse resp = DepartmentResponse.builder()
                .id(1L).name("Permanent Way").code("PWAY")
                .status(DepartmentStatus.ACTIVE).taskCount(3).build();

        when(departmentService.getAllDepartments()).thenReturn(List.of(resp));

        mockMvc.perform(get("/api/departments"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].code").value("PWAY"))
                .andExpect(jsonPath("$[0].taskCount").value(3));
    }

    // ─── GET /api/departments/{id} ────────────────────────────────────────────

    @Test
    @DisplayName("GET /api/departments/1 → 200 OK")
    void getDepartmentById_returns200() throws Exception {
        DepartmentResponse resp = DepartmentResponse.builder()
                .id(1L).name("Permanent Way").code("PWAY")
                .status(DepartmentStatus.ACTIVE).build();

        when(departmentService.getDepartmentById(1L)).thenReturn(resp);

        mockMvc.perform(get("/api/departments/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.name").value("Permanent Way"));
    }

    @Test
    @DisplayName("GET /api/departments/99 → 404 Not Found")
    void getDepartmentById_notFound() throws Exception {
        when(departmentService.getDepartmentById(99L))
                .thenThrow(new ResourceNotFoundException("Department not found with id: 99"));

        mockMvc.perform(get("/api/departments/99"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status").value(404))
                .andExpect(jsonPath("$.message").value("Department not found with id: 99"));
    }

    // ─── POST /api/departments ────────────────────────────────────────────────

    @Test
    @DisplayName("POST /api/departments → 201 Created")
    void createDepartment_returns201() throws Exception {
        DepartmentRequest request = new DepartmentRequest();
        request.setName("Signal & Telecommunication");
        request.setCode("ST");

        DepartmentResponse resp = DepartmentResponse.builder()
                .id(2L).name("Signal & Telecommunication").code("ST")
                .status(DepartmentStatus.ACTIVE).build();

        when(departmentService.createDepartment(any(DepartmentRequest.class))).thenReturn(resp);

        mockMvc.perform(post("/api/departments")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(2))
                .andExpect(jsonPath("$.code").value("ST"));
    }

    @Test
    @DisplayName("POST /api/departments with missing name → 400 Bad Request")
    void createDepartment_missingName_returns400() throws Exception {
        DepartmentRequest request = new DepartmentRequest();
        request.setCode("ST");
        // name is intentionally missing

        mockMvc.perform(post("/api/departments")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.errors.name").exists());
    }

    // ─── DELETE /api/departments/{id} ─────────────────────────────────────────

    @Test
    @DisplayName("DELETE /api/departments/1 → 204 No Content")
    void deleteDepartment_returns204() throws Exception {
        doNothing().when(departmentService).deleteDepartment(1L);

        mockMvc.perform(delete("/api/departments/1"))
                .andExpect(status().isNoContent());

        verify(departmentService).deleteDepartment(1L);
    }
}

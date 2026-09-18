package com.railopt.controller;

import com.railopt.dto.*;
import com.railopt.exception.GlobalExceptionHandler;
import com.railopt.service.DashboardService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;
import java.util.Map;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(DashboardController.class)
@Import(GlobalExceptionHandler.class)
@DisplayName("DashboardController Slice Tests")
class DashboardControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private DashboardService dashboardService;

    @Test
    @DisplayName("GET /api/dashboard/summary → 200 OK with KPIs")
    void getSummary_returns200() throws Exception {
        DashboardSummaryResponse resp = DashboardSummaryResponse.builder()
                .assetAvailabilityPercent(96.4)
                .totalAssets(18L)
                .criticalTasks(2L)
                .totalTasks(10L)
                .pendingTasks(5L)
                .unresolvedConflicts(0L)
                .conflictsResolved(2L)
                .totalWorkloadHoursPerWeek(78.2)
                .workloadByDepartment(Map.of("PWAY", 45.0, "TRD", 30.0))
                .aiPriorityScore(94.0)
                .aiPriorityLevel("CRITICAL")
                .aiRecommendedAction("Schedule immediate maintenance block.")
                .build();

        when(dashboardService.getSummary()).thenReturn(resp);

        mockMvc.perform(get("/api/dashboard/summary"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.assetAvailabilityPercent").value(96.4))
                .andExpect(jsonPath("$.aiPriorityScore").value(94.0))
                .andExpect(jsonPath("$.aiPriorityLevel").value("CRITICAL"));
    }

    @Test
    @DisplayName("GET /api/dashboard/corridor-timeline?corridorId=1 → 200 OK")
    void getCorridorTimeline_returns200() throws Exception {
        CorridorTimelineResponse resp = CorridorTimelineResponse.builder()
                .corridorId(1L)
                .corridorCode("NDLS-CNB")
                .corridorName("Delhi - Kanpur Mainline")
                .trains(List.of())
                .blocks(List.of())
                .build();

        when(dashboardService.getCorridorTimeline(1L)).thenReturn(resp);

        mockMvc.perform(get("/api/dashboard/corridor-timeline").param("corridorId", "1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.corridorCode").value("NDLS-CNB"));
    }

    @Test
    @DisplayName("GET /api/dashboard/conflicts?corridorId=1 → 200 OK")
    void getConflicts_returns200() throws Exception {
        ConflictResponse conflict = ConflictResponse.builder()
                .id("CONF-01")
                .title("Possession Window vs Train 12301")
                .severity("HIGH")
                .status("RESOLVED_BY_AI")
                .confidence("98%")
                .build();

        when(dashboardService.getConflicts(1L)).thenReturn(List.of(conflict));

        mockMvc.perform(get("/api/dashboard/conflicts").param("corridorId", "1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value("CONF-01"))
                .andExpect(jsonPath("$[0].severity").value("HIGH"));
    }

    @Test
    @DisplayName("GET /api/dashboard/maintenance-workload → 200 OK")
    void getMaintenanceWorkload_returns200() throws Exception {
        MaintenanceWorkloadResponse resp = MaintenanceWorkloadResponse.builder()
                .totalTasks(10L)
                .totalPendingTasks(5L)
                .totalEstimatedHours(78.2)
                .departments(List.of(
                        MaintenanceWorkloadResponse.DepartmentWorkload.builder()
                                .code("PWAY")
                                .name("Permanent Way")
                                .taskCount(4L)
                                .workloadPercent(45.0)
                                .build()
                ))
                .build();

        when(dashboardService.getMaintenanceWorkload()).thenReturn(resp);

        mockMvc.perform(get("/api/dashboard/maintenance-workload"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalTasks").value(10))
                .andExpect(jsonPath("$.departments[0].code").value("PWAY"));
    }
}

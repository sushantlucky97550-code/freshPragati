package com.railopt.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.railopt.dto.AssetResponse;
import com.railopt.entity.AssetStatus;
import com.railopt.entity.AssetType;
import com.railopt.exception.GlobalExceptionHandler;
import com.railopt.exception.ResourceNotFoundException;
import com.railopt.service.RailwayAssetService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDate;
import java.util.List;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(RailwayAssetController.class)
@Import(GlobalExceptionHandler.class)
@DisplayName("AssetController Slice Tests")
class AssetControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private RailwayAssetService assetService;

    private AssetResponse sampleAsset() {
        return AssetResponse.builder()
                .id(1L)
                .assetId("AST-TRK-01")
                .name("Track TDL-162 UP Main")
                .assetType("TRACK_KM")
                .departmentCode("PWAY")
                .departmentName("Permanent Way")
                .corridorCode("NDLS-CNB")
                .corridorName("Delhi - Kanpur Mainline")
                .section("Aligarh - Tundla")
                .location("Tundla Yard")
                .healthScore(74)
                .status("GOOD")
                .lastMaintenance(LocalDate.now().minusDays(30))
                .nextInspectionDue(LocalDate.now().plusDays(10))
                .defectsCount(1)
                .build();
    }

    @Test
    @DisplayName("GET /api/assets → 200 OK with list")
    void getAllAssets_returns200() throws Exception {
        when(assetService.getAllAssets()).thenReturn(List.of(sampleAsset()));

        mockMvc.perform(get("/api/assets"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].assetId").value("AST-TRK-01"))
                .andExpect(jsonPath("$[0].departmentCode").value("PWAY"));
    }

    @Test
    @DisplayName("GET /api/assets/{id} → 200 OK when found")
    void getAssetById_found() throws Exception {
        when(assetService.getAssetById(1L)).thenReturn(sampleAsset());

        mockMvc.perform(get("/api/assets/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.name").value("Track TDL-162 UP Main"));
    }

    @Test
    @DisplayName("GET /api/assets/99 → 404 Not Found")
    void getAssetById_notFound() throws Exception {
        when(assetService.getAssetById(99L))
                .thenThrow(new ResourceNotFoundException("Asset not found with id: 99"));

        mockMvc.perform(get("/api/assets/99"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status").value(404));
    }

    @Test
    @DisplayName("GET /api/assets?department=PWAY → 200 OK")
    void getAssetsByDepartment_returns200() throws Exception {
        when(assetService.getAssetsByDepartment("PWAY")).thenReturn(List.of(sampleAsset()));

        mockMvc.perform(get("/api/assets").param("department", "PWAY"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].departmentCode").value("PWAY"));
    }

    @Test
    @DisplayName("GET /api/assets?status=GOOD → 200 OK")
    void getAssetsByStatus_returns200() throws Exception {
        when(assetService.getAssetsByStatus("GOOD")).thenReturn(List.of(sampleAsset()));

        mockMvc.perform(get("/api/assets").param("status", "GOOD"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].status").value("GOOD"));
    }
}

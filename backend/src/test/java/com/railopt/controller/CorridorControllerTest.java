package com.railopt.controller;

import com.railopt.dto.CorridorResponse;
import com.railopt.exception.GlobalExceptionHandler;
import com.railopt.exception.ResourceNotFoundException;
import com.railopt.service.CorridorService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(CorridorController.class)
@Import(GlobalExceptionHandler.class)
@DisplayName("CorridorController Slice Tests")
class CorridorControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private CorridorService corridorService;

    @MockBean
    private com.railopt.service.tracking.TrainTrackingService trackingService;

    private CorridorResponse sampleCorridor() {
        return CorridorResponse.builder()
                .id(1L)
                .corridorId("NDLS-CNB")
                .name("Delhi – Kanpur Main Line")
                .fromStation("NDLS")
                .toStation("CNB")
                .lengthKm(440)
                .capacityUtilization(87)
                .dailyTrains(186)
                .zone("NCR")
                .division("Prayagraj")
                .status("OPERATIONAL")
                .build();
    }

    @Test
    @DisplayName("GET /api/corridors → 200 OK with list")
    void getAllCorridors_returns200() throws Exception {
        when(corridorService.getAllCorridors()).thenReturn(List.of(sampleCorridor()));

        mockMvc.perform(get("/api/corridors"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].corridorId").value("NDLS-CNB"))
                .andExpect(jsonPath("$[0].name").value("Delhi – Kanpur Main Line"));
    }

    @Test
    @DisplayName("GET /api/corridors/1 → 200 OK by numeric ID")
    void getCorridorById_returns200() throws Exception {
        when(corridorService.getCorridorById(1L)).thenReturn(sampleCorridor());

        mockMvc.perform(get("/api/corridors/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.corridorId").value("NDLS-CNB"));
    }

    @Test
    @DisplayName("GET /api/corridors/NDLS-CNB → 200 OK by code string")
    void getCorridorByCode_returns200() throws Exception {
        when(corridorService.getCorridorByCode("NDLS-CNB")).thenReturn(sampleCorridor());

        mockMvc.perform(get("/api/corridors/NDLS-CNB"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.corridorId").value("NDLS-CNB"));
    }

    @Test
    @DisplayName("GET /api/corridors/99 → 404 Not Found")
    void getCorridorById_notFound() throws Exception {
        when(corridorService.getCorridorById(99L))
                .thenThrow(new ResourceNotFoundException("Corridor not found with id: 99"));

        mockMvc.perform(get("/api/corridors/99"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status").value(404));
    }
}

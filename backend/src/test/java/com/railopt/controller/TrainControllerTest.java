package com.railopt.controller;

import com.railopt.dto.TrainResponse;
import com.railopt.entity.TrainStatus;
import com.railopt.entity.TrainType;
import com.railopt.exception.GlobalExceptionHandler;
import com.railopt.exception.ResourceNotFoundException;
import com.railopt.service.TrainService;
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

@WebMvcTest(TrainController.class)
@Import(GlobalExceptionHandler.class)
@DisplayName("TrainController Slice Tests")
class TrainControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private TrainService trainService;

    @MockBean
    private com.railopt.service.tracking.TrainTrackingService trackingService;

    private TrainResponse sampleTrain() {
        return TrainResponse.builder()
                .id(1L)
                .trainNumber("12301")
                .trainName("Howrah Rajdhani Express")
                .trainType("PREMIUM")
                .category("Rajdhani")
                .source("NDLS")
                .destination("HWH")
                .corridorCode("NDLS-CNB")
                .corridorName("Delhi - Kanpur Mainline")
                .trackLine("UP_MAIN")
                .priority(1)
                .maxSpeed(130)
                .departureTime("16:55")
                .arrivalTime("10:05")
                .status("ON_TIME")
                .delayMinutes(0)
                .kavachFitted(true)
                .build();
    }

    @Test
    @DisplayName("GET /api/trains → 200 OK with list")
    void getAllTrains_returns200() throws Exception {
        when(trainService.getAllTrains()).thenReturn(List.of(sampleTrain()));

        mockMvc.perform(get("/api/trains"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].trainNumber").value("12301"))
                .andExpect(jsonPath("$[0].trainName").value("Howrah Rajdhani Express"));
    }

    @Test
    @DisplayName("GET /api/trains/{id} → 200 OK when found")
    void getTrainById_found() throws Exception {
        when(trainService.getTrainById(1L)).thenReturn(sampleTrain());

        mockMvc.perform(get("/api/trains/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.trainNumber").value("12301"));
    }

    @Test
    @DisplayName("GET /api/trains/99 → 404 Not Found")
    void getTrainById_notFound() throws Exception {
        when(trainService.getTrainById(99L))
                .thenThrow(new ResourceNotFoundException("Train not found with id: 99"));

        mockMvc.perform(get("/api/trains/99"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status").value(404));
    }

    @Test
    @DisplayName("GET /api/trains?corridor=NDLS-CNB → 200 OK")
    void getTrainsByCorridor_returns200() throws Exception {
        when(trainService.getTrainsByCorridorCode("NDLS-CNB")).thenReturn(List.of(sampleTrain()));

        mockMvc.perform(get("/api/trains").param("corridor", "NDLS-CNB"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].corridorCode").value("NDLS-CNB"));
    }
}

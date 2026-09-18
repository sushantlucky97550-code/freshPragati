package com.railopt.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.railopt.dto.AiBlockPlanGenerateRequest;
import com.railopt.dto.AiBlockPlanResponse;
import com.railopt.exception.GlobalExceptionHandler;
import com.railopt.service.AiBlockPlanService;
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
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(AiBlockPlanController.class)
@Import(GlobalExceptionHandler.class)
@DisplayName("AiBlockPlanController Slice Tests")
class AiBlockPlanControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private AiBlockPlanService aiBlockPlanService;

    private AiBlockPlanResponse samplePlan() {
        return AiBlockPlanResponse.builder()
                .id(1L)
                .planId("BLK-AI-2026-9041")
                .corridorCode("NDLS-CNB")
                .corridorName("Delhi - Kanpur Mainline")
                .trackLine("UP_MAIN")
                .scheduledDate(LocalDate.now().plusDays(1))
                .windowStart("01:00")
                .windowEnd("05:00")
                .durationHours(4.0)
                .optimizationScore(96.4)
                .status("PROPOSED")
                .priority("CRITICAL")
                .recommendedAction("Schedule immediate maintenance block.")
                .build();
    }

    @Test
    @DisplayName("GET /api/ai/block-plans → 200 OK with list")
    void getBlockPlans_returns200() throws Exception {
        when(aiBlockPlanService.getAllBlockPlans()).thenReturn(List.of(samplePlan()));

        mockMvc.perform(get("/api/ai/block-plans"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].planId").value("BLK-AI-2026-9041"))
                .andExpect(jsonPath("$[0].optimizationScore").value(96.4));
    }

    @Test
    @DisplayName("GET /api/ai/block-plans/1 → 200 OK when found")
    void getBlockPlanById_returns200() throws Exception {
        when(aiBlockPlanService.getBlockPlanById(1L)).thenReturn(samplePlan());

        mockMvc.perform(get("/api/ai/block-plans/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.planId").value("BLK-AI-2026-9041"));
    }

    @Test
    @DisplayName("POST /api/ai/block-plans/generate → 201 Created")
    void generateBlockPlan_returns201() throws Exception {
        AiBlockPlanGenerateRequest req = new AiBlockPlanGenerateRequest();
        req.setCorridorId("NDLS-CNB");
        req.setTrackLine("UP_MAIN");
        req.setDate(LocalDate.now().plusDays(1).toString());
        req.setTargetShift("NIGHT");
        req.setDepartments(List.of("PWAY", "TRD"));
        req.setRequiredWindowHours(3.5);
        req.setMaxDelayToleranceMinutes(20);

        when(aiBlockPlanService.generateBlockPlan(any(AiBlockPlanGenerateRequest.class))).thenReturn(samplePlan());

        mockMvc.perform(post("/api/ai/block-plans/generate")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.planId").value("BLK-AI-2026-9041"))
                .andExpect(jsonPath("$.optimizationScore").value(96.4));
    }

    @Test
    @DisplayName("POST /api/ai/block-plans/1/approve → 200 OK")
    void approveBlockPlan_returns200() throws Exception {
        AiBlockPlanResponse approved = samplePlan();
        approved.setStatus("APPROVED");

        when(aiBlockPlanService.approveBlockPlan(eq(1L), any())).thenReturn(approved);

        mockMvc.perform(post("/api/ai/block-plans/1/approve")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"approvedBy\": \"Chief Controller\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("APPROVED"));
    }

    @Test
    @DisplayName("GET /api/ai/block-plans/1/explanation → 200 OK with structured explanation")
    void getBlockPlanExplanation_returns200() throws Exception {
        com.railopt.dto.BlockPlanExplanationResponse explanation = com.railopt.dto.BlockPlanExplanationResponse.builder()
                .planId("BLK-AI-2026-9041")
                .recommendedWindow("01:00 - 05:00")
                .summary("Optimal night window selected.")
                .explanationSource("GEMINI")
                .modelUsed("gemini-3.6-flash")
                .safetyNotice("RailOpt AI selected this block using deterministic optimization. Gemini generated the explanation.")
                .whySelected(List.of("Lowest traffic", "Shadow bundling"))
                .build();

        when(aiBlockPlanService.getExplanationForPlan("1")).thenReturn(explanation);

        mockMvc.perform(get("/api/ai/block-plans/1/explanation"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.planId").value("BLK-AI-2026-9041"))
                .andExpect(jsonPath("$.explanationSource").value("GEMINI"))
                .andExpect(jsonPath("$.modelUsed").value("gemini-3.6-flash"))
                .andExpect(jsonPath("$.safetyNotice").value("RailOpt AI selected this block using deterministic optimization. Gemini generated the explanation."))
                .andExpect(jsonPath("$.summary").value("Optimal night window selected."));
    }
}

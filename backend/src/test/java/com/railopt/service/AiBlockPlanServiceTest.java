package com.railopt.service;

import com.railopt.dto.AiBlockPlanGenerateRequest;
import com.railopt.dto.AiBlockPlanResponse;
import com.railopt.entity.AiBlockPlan;
import com.railopt.entity.BlockPlanStatus;
import com.railopt.entity.Corridor;
import com.railopt.exception.ResourceNotFoundException;
import com.railopt.repository.AiBlockPlanRepository;
import com.railopt.service.ai.PriorityEngine;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@DisplayName("AiBlockPlanService Unit Tests")
class AiBlockPlanServiceTest {

    @Mock
    private AiBlockPlanRepository blockPlanRepository;

    @Mock
    private PriorityEngine priorityEngine;

    @Mock
    private com.railopt.service.ai.LlmExplanationService llmExplanationService;

    @Mock
    private com.railopt.service.tracking.TrainTrackingService trainTrackingService;

    @Mock
    private com.railopt.repository.MaintenanceTaskRepository taskRepository;

    @Mock
    private DashboardService dashboardService;

    @InjectMocks
    private AiBlockPlanService aiBlockPlanService;

    private AiBlockPlan samplePlan;

    @BeforeEach
    void setUp() {
        Corridor corridor = Corridor.builder().id(1L).corridorId("NDLS-CNB").name("Delhi - Kanpur").build();
        samplePlan = AiBlockPlan.builder()
                .id(1L)
                .planId("BLK-AI-2026-9041")
                .corridor(corridor)
                .trackLine("UP_MAIN")
                .scheduledDate(LocalDate.now().plusDays(1))
                .windowStart("01:00")
                .windowEnd("05:00")
                .optimizationScore(95.0)
                .status(BlockPlanStatus.PROPOSED)
                .build();
    }

    @Test
    @DisplayName("getAllBlockPlans: returns list of mapped DTOs")
    void getAllBlockPlans_returnsList() {
        when(blockPlanRepository.findAll()).thenReturn(List.of(samplePlan));

        List<AiBlockPlanResponse> result = aiBlockPlanService.getAllBlockPlans();

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getPlanId()).isEqualTo("BLK-AI-2026-9041");
    }

    @Test
    @DisplayName("getBlockPlanById: returns plan when found")
    void getBlockPlanById_found() {
        when(blockPlanRepository.findById(1L)).thenReturn(Optional.of(samplePlan));

        AiBlockPlanResponse result = aiBlockPlanService.getBlockPlanById(1L);

        assertThat(result.getId()).isEqualTo(1L);
        assertThat(result.getPlanId()).isEqualTo("BLK-AI-2026-9041");
    }

    @Test
    @DisplayName("getBlockPlanById: throws ResourceNotFoundException when not found")
    void getBlockPlanById_notFound() {
        when(blockPlanRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> aiBlockPlanService.getBlockPlanById(99L))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    @DisplayName("generateBlockPlan: delegates to PriorityEngine")
    void generateBlockPlan_delegatesToPriorityEngine() {
        AiBlockPlanGenerateRequest req = new AiBlockPlanGenerateRequest();
        AiBlockPlanResponse resp = AiBlockPlanResponse.builder().planId("BLK-AI-2026-0001").build();

        when(priorityEngine.optimizeBlockPlan(req)).thenReturn(resp);

        AiBlockPlanResponse result = aiBlockPlanService.generateBlockPlan(req);

        assertThat(result.getPlanId()).isEqualTo("BLK-AI-2026-0001");
        verify(priorityEngine).optimizeBlockPlan(req);
    }

    @Test
    @DisplayName("approveBlockPlan: updates status to APPROVED and sets approvedBy")
    void approveBlockPlan_success() {
        when(blockPlanRepository.findById(1L)).thenReturn(Optional.of(samplePlan));
        when(blockPlanRepository.save(any(AiBlockPlan.class))).thenAnswer(inv -> inv.getArgument(0));

        AiBlockPlanResponse result = aiBlockPlanService.approveBlockPlan(1L, "Chief Controller");

        assertThat(result.getStatus()).isEqualTo("APPROVED");
        assertThat(result.getApprovedBy()).isEqualTo("Chief Controller");
    }

    @Test
    @DisplayName("getExplanationForPlan: retrieves plan and returns structured explanation")
    void getExplanationForPlan_success() {
        when(blockPlanRepository.findById(1L)).thenReturn(Optional.of(samplePlan));
        com.railopt.dto.BlockPlanExplanationResponse expected = com.railopt.dto.BlockPlanExplanationResponse.builder()
                .planId("BLK-AI-2026-9041")
                .explanationSource("DETERMINISTIC")
                .summary("Deterministic explanation summary")
                .build();
        when(llmExplanationService.generateBlockPlanExplanation(eq(samplePlan), any(), any(), any()))
                .thenReturn(expected);

        com.railopt.dto.BlockPlanExplanationResponse result = aiBlockPlanService.getExplanationForPlan(1L);

        assertThat(result).isNotNull();
        assertThat(result.getPlanId()).isEqualTo("BLK-AI-2026-9041");
        assertThat(result.getExplanationSource()).isEqualTo("DETERMINISTIC");
    }
}

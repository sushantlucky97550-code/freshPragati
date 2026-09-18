package com.railopt.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.railopt.dto.*;
import com.railopt.entity.*;
import com.railopt.repository.*;
import com.railopt.service.ai.RuleBasedPriorityEngine;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Spy;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@DisplayName("AI Priority Engine Unit Tests")
class PriorityEngineTest {

    @Mock
    private MaintenanceTaskRepository taskRepository;

    @Mock
    private RailwayAssetRepository assetRepository;

    @Mock
    private TrainRepository trainRepository;

    @Mock
    private CorridorRepository corridorRepository;

    @Mock
    private BlockRequestRepository blockRequestRepository;

    @Mock
    private AiBlockPlanRepository blockPlanRepository;

    @Spy
    private ObjectMapper objectMapper = new ObjectMapper();

    @InjectMocks
    private RuleBasedPriorityEngine priorityEngine;

    private Department pwayDept;
    private Corridor corridor;
    private MaintenanceTask sampleTask;

    @BeforeEach
    void setUp() {
        pwayDept = Department.builder().id(1L).code("PWAY").name("Permanent Way").build();
        corridor = Corridor.builder()
                .id(1L)
                .corridorId("NDLS-CNB")
                .name("Delhi - Kanpur")
                .fromStation("NDLS")
                .toStation("CNB")
                .lengthKm(440)
                .dailyTrains(180)
                .capacityUtilization(90)
                .build();

        sampleTask = MaintenanceTask.builder()
                .id(1L)
                .taskId("TASK-001")
                .taskType("Track Tamping")
                .department(pwayDept)
                .assetName("Track TDL-162")
                .severity(Severity.CRITICAL)
                .priority(Priority.URGENT)
                .status(TaskStatus.PENDING)
                .dueDate(LocalDate.now().plusDays(1))
                .durationMinutes(180)
                .build();
    }

    @Test
    @DisplayName("evaluateTaskPriority: critical task yields high score and recommendation")
    void evaluateTaskPriority_criticalTask() {
        TaskPriorityEvaluation eval = priorityEngine.evaluateTaskPriority(sampleTask);

        assertThat(eval).isNotNull();
        assertThat(eval.getPriorityScore()).isGreaterThanOrEqualTo(75.0);
        assertThat(eval.getPriorityLevel()).isIn("CRITICAL", "HIGH");
        assertThat(eval.getRecommendedAction()).isNotEmpty();
        assertThat(eval.getFactorBreakdown()).containsKey("severityScore");
        assertThat(eval.getFactorBreakdown()).containsKey("urgencyScore");
    }

    @Test
    @DisplayName("getDashboardPrioritySummary: aggregates top priority metrics")
    void getDashboardPrioritySummary_returnsTelemetry() {
        when(taskRepository.findAll()).thenReturn(List.of(sampleTask));

        DashboardPrioritySummary summary = priorityEngine.getDashboardPrioritySummary();

        assertThat(summary).isNotNull();
        assertThat(summary.getHighestPriorityScore()).isGreaterThan(70.0);
        assertThat(summary.getTopRecommendedAction()).isNotEmpty();
    }

    @Test
    @DisplayName("optimizeBlockPlan: generates optimal block plan with reasoning and conflicts")
    void optimizeBlockPlan_success() {
        AiBlockPlanGenerateRequest req = new AiBlockPlanGenerateRequest();
        req.setCorridorId("NDLS-CNB");
        req.setDate(LocalDate.now().plusDays(1).toString());
        req.setTargetShift("NIGHT");
        req.setDepartments(List.of("PWAY", "TRD"));
        req.setAllowShadowBlocks(true);
        req.setRequiredWindowHours(4.0);

        Train train = Train.builder()
                .id(1L)
                .trainNumber("12301")
                .trainName("Howrah Rajdhani")
                .trainType(TrainType.PREMIUM)
                .corridor(corridor)
                .trackLine("UP_MAIN")
                .build();

        when(corridorRepository.findByCorridorId("NDLS-CNB")).thenReturn(Optional.of(corridor));
        when(taskRepository.findAll()).thenReturn(List.of(sampleTask));
        when(trainRepository.findByCorridor_Id(1L)).thenReturn(List.of(train));
        when(blockPlanRepository.save(any(AiBlockPlan.class))).thenAnswer(inv -> {
            AiBlockPlan p = inv.getArgument(0);
            p.setId(10L);
            return p;
        });

        AiBlockPlanResponse plan = priorityEngine.optimizeBlockPlan(req);

        assertThat(plan).isNotNull();
        assertThat(plan.getOptimizationScore()).isGreaterThanOrEqualTo(80.0);
        assertThat(plan.getAiReasons()).isNotEmpty();
        assertThat(plan.getAffectedTrains()).isNotEmpty();
        assertThat(plan.getConflicts()).isNotEmpty();
    }
}

package com.railopt.service;

import com.railopt.dto.*;
import com.railopt.entity.*;
import com.railopt.repository.*;
import com.railopt.service.ai.PriorityEngine;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@DisplayName("DashboardService Unit Tests")
class DashboardServiceTest {

    @Mock
    private MaintenanceTaskRepository taskRepository;

    @Mock
    private RailwayAssetRepository assetRepository;

    @Mock
    private AiBlockPlanRepository blockPlanRepository;

    @Mock
    private TrainRepository trainRepository;

    @Mock
    private DepartmentRepository departmentRepository;

    @Mock
    private CorridorRepository corridorRepository;

    @Mock
    private BlockRequestRepository blockRequestRepository;

    @Mock
    private PriorityEngine priorityEngine;

    @Mock
    private com.railopt.service.tracking.TrainTrackingService trainTrackingService;

    @InjectMocks
    private DashboardService dashboardService;

    private Department pwayDept;
    private Corridor corridor;
    private MaintenanceTask task;

    @BeforeEach
    void setUp() {
        pwayDept = Department.builder().id(1L).code("PWAY").name("Permanent Way").status(DepartmentStatus.ACTIVE).build();
        corridor = Corridor.builder().id(1L).corridorId("NDLS-CNB").name("Delhi - Kanpur").lengthKm(440).build();
        task = MaintenanceTask.builder()
                .id(1L)
                .taskId("TASK-001")
                .taskType("Tamping")
                .department(pwayDept)
                .severity(Severity.CRITICAL)
                .priority(Priority.URGENT)
                .status(TaskStatus.PENDING)
                .durationMinutes(180)
                .build();
    }

    @Test
    @DisplayName("getSummary: computes all metrics from database and AI Priority Engine")
    void getSummary_computesRealMetrics() {
        when(taskRepository.findAll()).thenReturn(List.of(task));
        when(assetRepository.count()).thenReturn(20L);
        when(assetRepository.countByStatus(AssetStatus.OUT_OF_SERVICE)).thenReturn(1L);
        when(assetRepository.countByStatus(AssetStatus.CRITICAL)).thenReturn(1L);
        when(assetRepository.countByStatus(AssetStatus.ATTENTION_REQUIRED)).thenReturn(2L);
        when(corridorRepository.findAll()).thenReturn(List.of(corridor));
        when(blockPlanRepository.findAll()).thenReturn(List.of());
        when(trainRepository.findAll()).thenReturn(List.of());

        DashboardPrioritySummary prioSummary = DashboardPrioritySummary.builder()
                .highestPriorityScore(94.0)
                .topPriorityLevel("CRITICAL")
                .topRecommendedAction("Schedule immediate maintenance block.")
                .build();
        when(priorityEngine.getDashboardPrioritySummary()).thenReturn(prioSummary);

        DashboardSummaryResponse summary = dashboardService.getSummary();

        assertThat(summary).isNotNull();
        assertThat(summary.getTotalTasks()).isEqualTo(1L);
        assertThat(summary.getCriticalTasks()).isEqualTo(1L);
        assertThat(summary.getAssetAvailabilityPercent()).isEqualTo(95.0);
        assertThat(summary.getTotalWorkloadHoursPerWeek()).isEqualTo(3.0);
        assertThat(summary.getAiPriorityScore()).isEqualTo(94.0);
        assertThat(summary.getAiPriorityLevel()).isEqualTo("CRITICAL");
    }

    @Test
    @DisplayName("getCorridorTimeline: returns timeline with trains, blocks, and maintenance requests")
    void getCorridorTimeline_returnsDetails() {
        when(corridorRepository.findById(1L)).thenReturn(Optional.of(corridor));
        when(trainRepository.findByCorridor_Id(1L)).thenReturn(List.of());
        when(blockPlanRepository.findByCorridor_Id(1L)).thenReturn(List.of());
        when(taskRepository.findAll()).thenReturn(List.of(task));

        CorridorTimelineResponse resp = dashboardService.getCorridorTimeline(1L);

        assertThat(resp).isNotNull();
        assertThat(resp.getCorridorCode()).isEqualTo("NDLS-CNB");
        assertThat(resp.getMaintenanceRequests()).hasSize(1);
        assertThat(resp.getMaintenanceRequests().get(0).getTaskId()).isEqualTo("TASK-001");
    }

    @Test
    @DisplayName("getMaintenanceWorkload: returns department-wise workload breakdown")
    void getMaintenanceWorkload_returnsWorkload() {
        when(taskRepository.findAll()).thenReturn(List.of(task));
        when(departmentRepository.findAllWithTasks()).thenReturn(List.of(pwayDept));

        MaintenanceWorkloadResponse resp = dashboardService.getMaintenanceWorkload();

        assertThat(resp).isNotNull();
        assertThat(resp.getTotalTasks()).isEqualTo(1L);
        assertThat(resp.getDepartments()).hasSize(1);
        assertThat(resp.getDepartments().get(0).getCode()).isEqualTo("PWAY");
    }
}

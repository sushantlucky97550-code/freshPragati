package com.railopt.service;

import com.railopt.dto.DepartmentRequest;
import com.railopt.dto.DepartmentResponse;
import com.railopt.entity.Department;
import com.railopt.entity.DepartmentStatus;
import com.railopt.exception.DuplicateResourceException;
import com.railopt.exception.ResourceNotFoundException;
import com.railopt.repository.DepartmentRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("DepartmentService Unit Tests")
class DepartmentServiceTest {

    @Mock
    private DepartmentRepository departmentRepository;

    @InjectMocks
    private DepartmentService departmentService;

    private Department sampleDepartment;

    @BeforeEach
    void setUp() {
        sampleDepartment = Department.builder()
                .id(1L)
                .name("Permanent Way")
                .code("PWAY")
                .description("Track maintenance department")
                .status(DepartmentStatus.ACTIVE)
                .build();
    }

    // ─── getAllDepartments ────────────────────────────────────────────────────

    @Test
    @DisplayName("getAllDepartments: returns list of department responses")
    void getAllDepartments_returnsList() {
        when(departmentRepository.findAllWithTasks()).thenReturn(List.of(sampleDepartment));

        List<DepartmentResponse> result = departmentService.getAllDepartments();

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getCode()).isEqualTo("PWAY");
        verify(departmentRepository).findAllWithTasks();
    }

    // ─── getDepartmentById ────────────────────────────────────────────────────

    @Test
    @DisplayName("getDepartmentById: returns correct department when found")
    void getDepartmentById_found() {
        when(departmentRepository.findById(1L)).thenReturn(Optional.of(sampleDepartment));

        DepartmentResponse result = departmentService.getDepartmentById(1L);

        assertThat(result.getId()).isEqualTo(1L);
        assertThat(result.getName()).isEqualTo("Permanent Way");
    }

    @Test
    @DisplayName("getDepartmentById: throws ResourceNotFoundException when not found")
    void getDepartmentById_notFound() {
        when(departmentRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> departmentService.getDepartmentById(99L))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("99");
    }

    // ─── createDepartment ────────────────────────────────────────────────────

    @Test
    @DisplayName("createDepartment: saves and returns response when code is unique")
    void createDepartment_success() {
        DepartmentRequest request = new DepartmentRequest();
        request.setName("Traction & Rolling Distribution");
        request.setCode("trd");
        request.setDescription("OHE maintenance");

        when(departmentRepository.existsByCode("TRD")).thenReturn(false);
        when(departmentRepository.save(any(Department.class))).thenAnswer(inv -> {
            Department d = inv.getArgument(0);
            d.setId(2L);
            return d;
        });

        DepartmentResponse result = departmentService.createDepartment(request);

        assertThat(result.getCode()).isEqualTo("TRD");    // code is uppercased
        assertThat(result.getStatus()).isEqualTo(DepartmentStatus.ACTIVE);
        verify(departmentRepository).save(any(Department.class));
    }

    @Test
    @DisplayName("createDepartment: throws DuplicateResourceException when code exists")
    void createDepartment_duplicateCode() {
        DepartmentRequest request = new DepartmentRequest();
        request.setName("Duplicate");
        request.setCode("PWAY");

        when(departmentRepository.existsByCode("PWAY")).thenReturn(true);

        assertThatThrownBy(() -> departmentService.createDepartment(request))
                .isInstanceOf(DuplicateResourceException.class)
                .hasMessageContaining("PWAY");

        verify(departmentRepository, never()).save(any());
    }

    // ─── deleteDepartment ────────────────────────────────────────────────────

    @Test
    @DisplayName("deleteDepartment: deletes successfully when department exists")
    void deleteDepartment_success() {
        when(departmentRepository.findById(1L)).thenReturn(Optional.of(sampleDepartment));

        departmentService.deleteDepartment(1L);

        verify(departmentRepository).delete(sampleDepartment);
    }

    @Test
    @DisplayName("deleteDepartment: throws ResourceNotFoundException when not found")
    void deleteDepartment_notFound() {
        when(departmentRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> departmentService.deleteDepartment(99L))
                .isInstanceOf(ResourceNotFoundException.class);

        verify(departmentRepository, never()).delete(any());
    }
}

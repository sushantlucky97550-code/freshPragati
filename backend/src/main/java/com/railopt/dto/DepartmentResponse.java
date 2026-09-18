package com.railopt.dto;

import com.railopt.entity.Department;
import com.railopt.entity.DepartmentStatus;
import lombok.Builder;
import lombok.Data;

/**
 * Response DTO for Department — safe to serialize directly to JSON.
 * Never exposes the JPA entity or its lazy-loaded collections directly.
 */
@Data
@Builder
public class DepartmentResponse {

    private Long id;
    private String name;
    private String code;
    private String description;
    private DepartmentStatus status;

    /** Number of maintenance tasks belonging to this department */
    private int taskCount;

    /**
     * Maps a Department entity to a DepartmentResponse.
     *
     * @param dept the JPA entity (maintenanceTasks list must be initialised)
     * @return the response DTO
     */
    public static DepartmentResponse from(Department dept) {
        return DepartmentResponse.builder()
                .id(dept.getId())
                .name(dept.getName())
                .code(dept.getCode())
                .description(dept.getDescription())
                .status(dept.getStatus())
                .taskCount(dept.getMaintenanceTasks() != null ? dept.getMaintenanceTasks().size() : 0)
                .build();
    }
}

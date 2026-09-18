package com.railopt.entity;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.Transient;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.ArrayList;
import java.util.List;

/**
 * Represents an Indian Railway maintenance department (e.g., P-Way, TRD, S&T).
 */
@Document(collection = "departments")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Department {

    @Id
    private Long id;

    @NotBlank
    @Size(max = 100)
    private String name;

    /** Short department code, e.g. "PWAY", "TRD", "ST" */
    @NotBlank
    @Size(max = 20)
    @Indexed(unique = true)
    private String code;

    @Size(max = 500)
    private String description;

    @Builder.Default
    private DepartmentStatus status = DepartmentStatus.ACTIVE;

    /**
     * Maintenance tasks belonging to this department.
     * Stored as transient in MongoDB to prevent duplicate nested storage;
     * tasks reference department via @DBRef.
     */
    @Transient
    @Builder.Default
    private List<MaintenanceTask> maintenanceTasks = new ArrayList<>();
}

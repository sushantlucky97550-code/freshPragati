package com.railopt.service;

import com.railopt.dto.DepartmentRequest;
import com.railopt.dto.DepartmentResponse;
import com.railopt.entity.Department;
import com.railopt.entity.DepartmentStatus;
import com.railopt.exception.DuplicateResourceException;
import com.railopt.exception.ResourceNotFoundException;
import com.railopt.repository.DepartmentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class DepartmentService {

    private final DepartmentRepository departmentRepository;

    /**
     * Returns all departments with their task counts.
     * Uses a JOIN FETCH to avoid N+1 queries.
     */
    public List<DepartmentResponse> getAllDepartments() {
        log.debug("Fetching all departments");
        return departmentRepository.findAllWithTasks()
                .stream()
                .map(DepartmentResponse::from)
                .toList();
    }

    /**
     * Returns a single department by its database ID.
     *
     * @throws ResourceNotFoundException if no department exists with the given id
     */
    public DepartmentResponse getDepartmentById(Long id) {
        log.debug("Fetching department with id: {}", id);
        Department dept = findDepartmentOrThrow(id);
        return DepartmentResponse.from(dept);
    }

    /**
     * Creates a new department.
     *
     * @throws DuplicateResourceException if a department with the same code already exists
     */
    @Transactional
    public DepartmentResponse createDepartment(DepartmentRequest request) {
        log.info("Creating department with code: {}", request.getCode());
        if (departmentRepository.existsByCode(request.getCode().toUpperCase())) {
            throw new DuplicateResourceException(
                    "Department with code '" + request.getCode() + "' already exists");
        }

        Department dept = Department.builder()
                .name(request.getName())
                .code(request.getCode().toUpperCase())
                .description(request.getDescription())
                .status(request.getStatus() != null ? request.getStatus() : DepartmentStatus.ACTIVE)
                .build();

        Department saved = departmentRepository.save(dept);
        log.info("Created department id={}, code={}", saved.getId(), saved.getCode());
        return DepartmentResponse.from(saved);
    }

    /**
     * Updates an existing department.
     *
     * @throws ResourceNotFoundException  if no department exists with the given id
     * @throws DuplicateResourceException if the new code conflicts with another department
     */
    @Transactional
    public DepartmentResponse updateDepartment(Long id, DepartmentRequest request) {
        log.info("Updating department id: {}", id);
        Department dept = findDepartmentOrThrow(id);

        String newCode = request.getCode().toUpperCase();
        if (departmentRepository.existsByCodeAndIdNot(newCode, id)) {
            throw new DuplicateResourceException(
                    "Department with code '" + newCode + "' already exists");
        }

        dept.setName(request.getName());
        dept.setCode(newCode);
        dept.setDescription(request.getDescription());
        if (request.getStatus() != null) {
            dept.setStatus(request.getStatus());
        }

        Department saved = departmentRepository.save(dept);
        log.info("Updated department id={}", saved.getId());
        return DepartmentResponse.from(saved);
    }

    /**
     * Deletes a department by ID.
     *
     * @throws ResourceNotFoundException if no department exists with the given id
     */
    @Transactional
    public void deleteDepartment(Long id) {
        log.info("Deleting department id: {}", id);
        Department dept = findDepartmentOrThrow(id);
        departmentRepository.delete(dept);
        log.info("Deleted department id={}", id);
    }

    // ─── Internal helpers ────────────────────────────────────────────────────

    private Department findDepartmentOrThrow(Long id) {
        return departmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Department not found with id: " + id));
    }
}

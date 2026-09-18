package com.railopt.repository;

import com.railopt.entity.Department;
import com.railopt.entity.DepartmentStatus;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DepartmentRepository extends MongoRepository<Department, Long> {

    /** Check if a department with this code already exists (for uniqueness validation) */
    boolean existsByCode(String code);

    /** Check for duplicate code excluding the current department (for update operations) */
    boolean existsByCodeAndIdNot(String code, Long id);

    /** Find a department by its short code (e.g., "PWAY") */
    Optional<Department> findByCode(String code);

    /** Filter departments by operational status */
    List<Department> findByStatus(DepartmentStatus status);

    /**
     * Fetch all departments.
     */
    default List<Department> findAllWithTasks() {
        return findAll();
    }
}

package com.railopt.repository;

import com.railopt.entity.MaintenanceTask;
import com.railopt.entity.Priority;
import com.railopt.entity.TaskStatus;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MaintenanceTaskRepository extends MongoRepository<MaintenanceTask, Long> {

    /** Check if a task with this taskId already exists (unique identifier) */
    boolean existsByTaskId(String taskId);

    /** Check for duplicate taskId excluding the current task (for update operations) */
    boolean existsByTaskIdAndIdNot(String taskId, Long id);

    /** Filter tasks by lifecycle status */
    List<MaintenanceTask> findByStatus(TaskStatus status);

    /** Filter tasks by scheduling priority */
    List<MaintenanceTask> findByPriority(Priority priority);

    /** All tasks belonging to a specific department */
    @Query("{'department.$id': ?0}")
    List<MaintenanceTask> findByDepartmentId(Long departmentId);

    /**
     * Fetch all tasks with department. In MongoDB, @DBRef automatically resolves.
     */
    default List<MaintenanceTask> findAllWithDepartment() {
        return findAll();
    }

    default List<MaintenanceTask> findByStatusWithDepartment(TaskStatus status) {
        return findByStatus(status);
    }

    default List<MaintenanceTask> findByPriorityWithDepartment(Priority priority) {
        return findByPriority(priority);
    }

    default List<MaintenanceTask> findByDepartmentIdWithDepartment(Long departmentId) {
        return findByDepartmentId(departmentId);
    }
}

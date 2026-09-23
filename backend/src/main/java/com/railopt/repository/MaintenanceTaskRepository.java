package com.railopt.repository;

import com.railopt.entity.MaintenanceTask;
import com.railopt.entity.Priority;
import com.railopt.entity.TaskStatus;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MaintenanceTaskRepository extends MongoRepository<MaintenanceTask, Long> {

    /** Check if a task with this taskId already exists (unique identifier) */
    boolean existsByTaskId(String taskId);

    /** Check for duplicate taskId excluding the current task (for update operations) */
    boolean existsByTaskIdAndIdNot(String taskId, Long id);

    Optional<MaintenanceTask> findByTaskId(String taskId);

    /** Filter tasks by lifecycle status */
    List<MaintenanceTask> findByStatus(TaskStatus status);

    /** Filter tasks by scheduling priority */
    List<MaintenanceTask> findByPriority(Priority priority);

    /** Zone-scoped queries */
    List<MaintenanceTask> findByZone(String zone);

    List<MaintenanceTask> findByZoneAndDivision(String zone, String division);

    List<MaintenanceTask> findByZoneAndStatus(String zone, TaskStatus status);

    List<MaintenanceTask> findByZoneAndLifecycleState(String zone, String lifecycleState);

    /** All tasks belonging to a specific department */
    @Query("{'department.$id': ?0}")
    List<MaintenanceTask> findByDepartmentId(Long departmentId);

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

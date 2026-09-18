package com.railopt.repository;

import com.railopt.entity.AiBlockPlan;
import com.railopt.entity.BlockPlanStatus;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface AiBlockPlanRepository extends MongoRepository<AiBlockPlan, Long> {

    @Query("{'corridor.$id': ?0}")
    List<AiBlockPlan> findByCorridor_Id(Long corridorId);

    List<AiBlockPlan> findByStatus(BlockPlanStatus status);

    List<AiBlockPlan> findByScheduledDate(LocalDate date);

    java.util.Optional<AiBlockPlan> findByPlanId(String planId);

    long countByStatus(BlockPlanStatus status);
}

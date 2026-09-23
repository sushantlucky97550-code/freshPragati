package com.railopt.repository;

import com.railopt.entity.BlockPlanVersion;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BlockPlanVersionRepository extends MongoRepository<BlockPlanVersion, Long> {
    List<BlockPlanVersion> findByPlanIdOrderByVersionDesc(String planId);
    List<BlockPlanVersion> findByZoneOrderByTimestampDesc(String zone);
}

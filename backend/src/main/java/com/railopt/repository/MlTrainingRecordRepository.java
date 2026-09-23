package com.railopt.repository;

import com.railopt.entity.MlTrainingRecord;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MlTrainingRecordRepository extends MongoRepository<MlTrainingRecord, Long> {
    List<MlTrainingRecord> findTop5ByZoneOrderByTrainedAtDesc(String zone);
    List<MlTrainingRecord> findAllByOrderByTrainedAtDesc();
}

package com.railopt.repository;

import com.railopt.entity.TrainTelemetry;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TrainTelemetryRepository extends MongoRepository<TrainTelemetry, String> {

    Optional<TrainTelemetry> findByTrainNumber(String trainNumber);

    List<TrainTelemetry> findByMatchedCorridorId(Long matchedCorridorId);

    List<TrainTelemetry> findByMatchedCorridorCode(String matchedCorridorCode);

    List<TrainTelemetry> findByDataSource(String dataSource);

    List<TrainTelemetry> findByFreshness(String freshness);
}

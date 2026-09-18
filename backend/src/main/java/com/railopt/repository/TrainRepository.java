package com.railopt.repository;

import com.railopt.entity.Train;
import com.railopt.entity.TrainStatus;
import com.railopt.entity.TrainType;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TrainRepository extends MongoRepository<Train, Long> {

    Optional<Train> findByTrainNumber(String trainNumber);

    @Query("{'corridor.$id': ?0}")
    List<Train> findByCorridor_Id(Long corridorId);

    default List<Train> findByCorridor_CorridorId(String corridorCode) {
        return findAll().stream()
                .filter(t -> t.getCorridor() != null && corridorCode.equalsIgnoreCase(t.getCorridor().getCorridorId()))
                .toList();
    }

    List<Train> findByStatus(TrainStatus status);

    List<Train> findByTrainType(TrainType trainType);

    @Query("{'corridor.$id': ?0, 'trainType': ?1}")
    List<Train> findByCorridor_IdAndTrainType(Long corridorId, TrainType trainType);
}

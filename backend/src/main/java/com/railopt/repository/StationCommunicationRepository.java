package com.railopt.repository;

import com.railopt.entity.StationCommunication;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface StationCommunicationRepository extends MongoRepository<StationCommunication, Long> {
    List<StationCommunication> findByZoneOrderByTimestampAsc(String zone);
    List<StationCommunication> findByWorkIdOrderByTimestampAsc(String workId);
}

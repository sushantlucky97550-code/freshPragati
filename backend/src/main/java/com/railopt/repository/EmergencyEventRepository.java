package com.railopt.repository;

import com.railopt.entity.EmergencyEvent;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EmergencyEventRepository extends MongoRepository<EmergencyEvent, Long> {
    List<EmergencyEvent> findByZoneOrderByReportedAtDesc(String zone);
    List<EmergencyEvent> findByStatus(String status);
}

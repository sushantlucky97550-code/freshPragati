package com.railopt.repository;

import com.railopt.entity.MaintenanceReport;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MaintenanceReportRepository extends MongoRepository<MaintenanceReport, Long> {
    Optional<MaintenanceReport> findByReportId(String reportId);
    List<MaintenanceReport> findByZoneOrderBySubmittedAtDesc(String zone);
    List<MaintenanceReport> findByWorkId(String workId);
}

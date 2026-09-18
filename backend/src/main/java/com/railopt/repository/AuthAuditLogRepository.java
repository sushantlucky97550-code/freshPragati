package com.railopt.repository;

import com.railopt.entity.AuthAuditLog;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AuthAuditLogRepository extends MongoRepository<AuthAuditLog, Long> {

    List<AuthAuditLog> findByOfficerIdOrderByTimestampDesc(String officerId);

    List<AuthAuditLog> findTop100ByOrderByTimestampDesc();
}

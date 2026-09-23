package com.railopt.repository;

import com.railopt.entity.TcpRequest;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TcpRequestRepository extends MongoRepository<TcpRequest, Long> {
    List<TcpRequest> findByZoneOrderByRequestedAtDesc(String zone);
    List<TcpRequest> findByWorkId(String workId);
}

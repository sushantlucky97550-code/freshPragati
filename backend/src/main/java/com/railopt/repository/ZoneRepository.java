package com.railopt.repository;

import com.railopt.entity.Zone;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ZoneRepository extends MongoRepository<Zone, String> {
    Optional<Zone> findByCodeIgnoreCase(String code);
}

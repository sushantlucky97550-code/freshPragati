package com.railopt.repository;

import com.railopt.entity.Corridor;
import com.railopt.entity.CorridorStatus;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CorridorRepository extends MongoRepository<Corridor, Long> {

    Optional<Corridor> findByCorridorId(String corridorId);

    boolean existsByCorridorId(String corridorId);

    List<Corridor> findByStatus(CorridorStatus status);

    /** In MongoDB tracks and stations are embedded documents, so findAll() returns them directly */
    default List<Corridor> findAllWithDetails() {
        return findAll();
    }

    default Optional<Corridor> findByIdWithDetails(Long id) {
        return findById(id);
    }
}

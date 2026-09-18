package com.railopt.repository;

import com.railopt.entity.User;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends MongoRepository<User, Long> {

    Optional<User> findByOfficerId(String officerId);

    boolean existsByOfficerId(String officerId);
}

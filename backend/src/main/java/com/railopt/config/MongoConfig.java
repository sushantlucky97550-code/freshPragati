package com.railopt.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.data.mongodb.config.EnableMongoAuditing;
import org.springframework.data.mongodb.repository.config.EnableMongoRepositories;

/**
 * MongoDB configuration enabling Spring Data Mongo Auditing and Repository scanning.
 */
@Configuration
@EnableMongoAuditing
@EnableMongoRepositories(basePackages = "com.railopt.repository")
public class MongoConfig {
}

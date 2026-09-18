package com.railopt.entity;

public enum TrainStatus {
    ON_TIME,
    SLIGHT_DELAY,   // < 30 mins
    DELAYED,        // 30-120 mins
    HEAVILY_DELAYED, // > 120 mins
    REGULATED,      // Held at loop/station for operational reasons
    CANCELLED,
    DIVERTED
}

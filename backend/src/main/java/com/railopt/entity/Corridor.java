package com.railopt.entity;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.Transient;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.ArrayList;
import java.util.List;

/**
 * Represents an Indian Railway operational corridor (e.g., Delhi - Kanpur HDN-1).
 * Contains embedded track lines and station lists for timeline rendering.
 */
@Document(collection = "corridors")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Corridor {

    @Id
    private Long id;

    /** Human-readable code e.g. "NDLS-CNB", "HDN-1" */
    @Indexed(unique = true)
    private String corridorId;

    private String name;

    private String fromStation;

    private String toStation;

    /** Total route length in kilometres */
    private Integer lengthKm;

    /** Capacity utilization % (can exceed 100 = over-saturated) */
    private Integer capacityUtilization;

    private Integer dailyTrains;

    private String zone;

    private String division;

    private String signaling;

    private String traction;

    private Integer speedLimit;

    @Builder.Default
    private CorridorStatus status = CorridorStatus.OPERATIONAL;

    /** Track lines (UP Main, DN Main, 3rd Line, etc.) embedded in document */
    @Builder.Default
    private List<CorridorTrack> tracks = new ArrayList<>();

    /** Station sequence along the corridor embedded in document */
    @Builder.Default
    private List<CorridorStation> stations = new ArrayList<>();

    /** Trains operating on this corridor (referenced independently via @DBRef from Train) */
    @Transient
    @Builder.Default
    private List<Train> trains = new ArrayList<>();

    /** Railway assets on this corridor (referenced independently via @DBRef from RailwayAsset) */
    @Transient
    @Builder.Default
    private List<RailwayAsset> assets = new ArrayList<>();
}

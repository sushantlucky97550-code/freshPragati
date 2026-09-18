package com.railopt.entity;

import lombok.*;

/**
 * A station along a corridor, with chainage (km) and loop/speed data
 * used for train path analysis and timeline rendering.
 * Modeled as an embedded document inside Corridor.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CorridorStation {

    private Long id;

    /** e.g. "NDLS", "GZB", "ALJN", "TDL", "CNB" */
    private String stationCode;

    private String stationName;

    /** Distance from corridor start in km */
    private Integer km;

    private Boolean hasLoops;

    /** Maximum permitted speed through station in km/h */
    private Integer maxSpeed;
}

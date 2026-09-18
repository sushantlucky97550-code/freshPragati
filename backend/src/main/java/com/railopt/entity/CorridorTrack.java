package com.railopt.entity;

import lombok.*;

/**
 * A track line within a corridor, e.g. "UP Main", "DN Main", "3rd Line".
 * Modeled as an embedded document inside Corridor.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CorridorTrack {

    private Long id;

    /** e.g. "UP_MAIN", "DN_MAIN", "3RD_LINE" */
    private String trackCode;

    private String trackName;

    @Builder.Default
    private TrackDirection direction = TrackDirection.UP;

    @Builder.Default
    private CorridorStatus status = CorridorStatus.OPERATIONAL;
}

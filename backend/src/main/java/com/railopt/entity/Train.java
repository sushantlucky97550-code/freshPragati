package com.railopt.entity;

import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

/**
 * Represents a train operating on a corridor.
 * Schedule times are stored as strings (HH:mm) for flexibility.
 */
@Document(collection = "trains")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Train {

    @Id
    private Long id;

    /** e.g. "22436", "12302", "FR-BOXN-4012" */
    @Indexed
    private String trainNumber;

    private String trainName;

    @Builder.Default
    private TrainType trainType = TrainType.EXPRESS;

    /** Category label e.g. "Rajdhani", "Vande Bharat", "BOXN Freight" */
    private String category;

    /** Source station code */
    private String source;

    /** Destination station code */
    private String destination;

    /** The corridor this train primarily operates on */
    @DBRef
    private Corridor corridor;

    /** Default track line: UP_MAIN or DN_MAIN */
    private String trackLine;

    /** Scheduling priority: 1 = highest (Rajdhani), 5 = lowest (freight) */
    @Builder.Default
    private Integer priority = 3;

    /** Max permissible speed in km/h */
    private Integer maxSpeed;

    /** Number of coaches/wagons */
    private Integer rakeLength;

    /** HH:mm departure from source */
    private String departureTime;

    /** HH:mm arrival at destination or key intermediate station */
    private String arrivalTime;

    @Builder.Default
    private TrainStatus status = TrainStatus.ON_TIME;

    /** Current delay in minutes (0 = on time) */
    @Builder.Default
    private Integer delayMinutes = 0;

    @Builder.Default
    private Boolean kavachFitted = false;

    @CreatedDate
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;
}

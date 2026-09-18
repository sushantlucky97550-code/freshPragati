package com.railopt.dto;

import com.railopt.entity.Train;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class TrainResponse {

    private Long id;
    private String trainNumber;
    private String trainName;
    private String trainType;
    private String category;
    private String source;
    private String destination;
    private Long corridorId;
    private String corridorName;
    private String corridorCode;
    private String trackLine;
    private Integer priority;
    private Integer maxSpeed;
    private Integer rakeLength;
    private String departureTime;
    private String arrivalTime;
    private String status;
    private Integer delayMinutes;
    private Boolean kavachFitted;
    private LocalDateTime createdAt;

    public static TrainResponse from(Train t) {
        return TrainResponse.builder()
                .id(t.getId())
                .trainNumber(t.getTrainNumber())
                .trainName(t.getTrainName())
                .trainType(t.getTrainType().name())
                .category(t.getCategory())
                .source(t.getSource())
                .destination(t.getDestination())
                .corridorId(t.getCorridor() != null ? t.getCorridor().getId() : null)
                .corridorName(t.getCorridor() != null ? t.getCorridor().getName() : null)
                .corridorCode(t.getCorridor() != null ? t.getCorridor().getCorridorId() : null)
                .trackLine(t.getTrackLine())
                .priority(t.getPriority())
                .maxSpeed(t.getMaxSpeed())
                .rakeLength(t.getRakeLength())
                .departureTime(t.getDepartureTime())
                .arrivalTime(t.getArrivalTime())
                .status(t.getStatus().name())
                .delayMinutes(t.getDelayMinutes())
                .kavachFitted(t.getKavachFitted())
                .createdAt(t.getCreatedAt())
                .build();
    }
}

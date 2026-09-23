package com.railopt.entity;

import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

/**
 * Persists ML learning updates and model version metadata.
 */
@Document(collection = "ml_training_records")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MlTrainingRecord {

    @Id
    private Long id;

    private String modelVersion; // e.g. "v2.4-BPL-ONLINE"
    private int samplesTrained;
    private double historicalAccuracyPercent;
    private double meanDurationVariance;
    private String zone;
    private String division;
    private String triggerEvent; // "FINAL_REPORT_INGESTION"

    /**
     * Learned insights JSON summary e.g.
     * "Similar maintenance works on BPL-SEH historically exceeded planned duration by 18-22%."
     */
    private String learnedPatternsSummaryJson;

    @CreatedDate
    private LocalDateTime trainedAt;
}

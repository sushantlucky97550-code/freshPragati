package com.railopt.entity;

import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

/**
 * Represents live dynamic telemetry for a train received from RailRadar API
 * or the fallback Simulation tracking provider.
 *
 * Stored in the 'train_telemetry' MongoDB collection.
 * Master train records in 'trains' remain authoritative for schedules and rake metadata.
 */
@Document(collection = "train_telemetry")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TrainTelemetry {

    @Id
    private String id; // e.g. "TEL-12301" or trainNumber

    @Indexed(unique = true)
    private String trainNumber;

    private String trainName;

    private String trainType;

    /** Current GPS latitude if returned by RailRadar or station coordinates */
    private Double latitude;

    /** Current GPS longitude if returned by RailRadar or station coordinates */
    private Double longitude;

    /** Current speed in km/h */
    @Builder.Default
    private Double speedKmh = 0.0;

    /** Bearing heading in degrees (0 - 360) */
    private Integer bearingDegrees;

    /** Current direction of travel: UP or DN */
    private String direction;

    /** Current station code e.g. "ALJN", "TDL", "CNB" */
    private String currentStation;

    /** Current station name e.g. "Aligarh Junction" */
    private String currentStationName;

    /** Next scheduled halt code */
    private String nextStation;

    /** Next scheduled halt name */
    private String nextStationName;

    /** Current operational section on corridor e.g. "ALJN-TDL", "TDL-CNB" */
    private String currentSection;

    /** Current delay in minutes (positive = delayed, 0 = on time) */
    @Builder.Default
    private Integer delayMinutes = 0;

    /** Operational status e.g. "RUNNING", "HALTED", "DEPARTED", "ARRIVED" */
    @Builder.Default
    private String status = "RUNNING";

    /** Data source: "RAILRADAR" or "SIMULATION" */
    @Builder.Default
    private String dataSource = "SIMULATION";

    /**
     * Telemetry freshness category:
     * - LIVE (< 60 seconds old)
     * - RECENT (< 180 seconds old)
     * - STALE (> 180 seconds old)
     * - UNAVAILABLE (upstream error)
     * - SIMULATION (synthetic provider)
     */
    @Builder.Default
    private String freshness = "SIMULATION";

    /**
     * Route match assessment:
     * - MATCHED: Confidently mapped to seeded corridor
     * - ROUTE_MATCH_UNCERTAIN: Insufficient data or low confidence
     * - OFF_NETWORK: Operating outside seeded NCR corridors
     */
    @Builder.Default
    private String routeMatchStatus = "MATCHED";

    /** Seeded Corridor numeric ID if matched */
    private Long matchedCorridorId;

    /** Seeded Corridor human-readable code e.g. "NDLS-CNB" */
    private String matchedCorridorCode;

    /** Matched operational section e.g. "ALJN-TDL", "TDL-CNB" */
    private String matchedSection;

    /** True if GPS coordinates are actual/valid; false if using station centroid */
    @Builder.Default
    private Boolean isGpsAvailable = false;

    /** Upstream timestamp reported by provider */
    private LocalDateTime providerTimestamp;

    /** Last updated timestamp alias */
    private LocalDateTime lastUpdatedAt;

    /** When this telemetry record was fetched by RailOpt */
    private LocalDateTime fetchedAt;

    @CreatedDate
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;

    public String getOperationalStatus() {
        return this.status;
    }

    public void setOperationalStatus(String operationalStatus) {
        this.status = operationalStatus;
    }
}

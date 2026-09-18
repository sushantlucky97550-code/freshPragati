package com.railopt.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class TrainTelemetrySummaryResponse {

    private long totalTrains;
    private long liveTrains;
    private long delayedTrains;
    private long staleTrains;
    private long activeConflicts;
    private String dataSource;
    private String freshness;
    private String overallFreshness;
    private String lastUpdate;
    private boolean providerAvailable;
    private String providerName;
    private String provider;

    public String getOverallFreshness() {
        return this.overallFreshness != null ? this.overallFreshness : this.freshness;
    }

    public String getProvider() {
        return this.provider != null ? this.provider : (this.providerName != null ? this.providerName : this.dataSource);
    }
}

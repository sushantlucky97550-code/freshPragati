package com.railopt.service.tracking;

import com.railopt.entity.TrainTelemetry;

import java.util.List;
import java.util.Optional;

/**
 * Provider interface for live train tracking telemetry.
 * Decouples external live providers (RailRadar) from local development/test simulation providers.
 */
public interface TrainTrackingProvider {

    /**
     * Fetch live telemetry for a single train number.
     *
     * @param trainNumber e.g. "12301", "22436"
     * @return Optional containing TrainTelemetry if found, or empty if unavailable
     */
    Optional<TrainTelemetry> getLiveTrain(String trainNumber);

    /**
     * Fetch live telemetry for multiple trains in batch.
     *
     * @param trainNumbers list of train numbers
     * @return list of available train telemetries
     */
    List<TrainTelemetry> getLiveTrains(List<String> trainNumbers);

    /**
     * Unique identifier for the provider ("RAILRADAR" or "SIMULATION").
     */
    String getProviderName();

    /**
     * Checks whether the upstream provider is configured and available.
     */
    boolean isAvailable();
}

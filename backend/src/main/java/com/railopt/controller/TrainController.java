package com.railopt.controller;

import com.railopt.dto.TrainLiveResponse;
import com.railopt.dto.TrainResponse;
import com.railopt.dto.TrainTelemetrySummaryResponse;
import com.railopt.entity.TrainTelemetry;
import com.railopt.exception.ResourceNotFoundException;
import com.railopt.service.TrainService;
import com.railopt.service.tracking.TrainTrackingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/trains")
@RequiredArgsConstructor
public class TrainController {

    private final TrainService trainService;
    private final TrainTrackingService trackingService;

    /**
     * GET /api/trains
     * GET /api/trains?corridor=NDLS-CNB
     * GET /api/trains?corridorCode=NDLS-CNB
     * GET /api/trains?corridorId=1
     */
    @GetMapping
    public ResponseEntity<List<TrainResponse>> getTrains(
            @RequestParam(required = false) String corridor,
            @RequestParam(required = false) String corridorCode,
            @RequestParam(required = false) Long corridorId) {

        String code = corridor != null ? corridor : corridorCode;
        if (code != null) {
            return ResponseEntity.ok(trainService.getTrainsByCorridorCode(code));
        }
        if (corridorId != null) {
            return ResponseEntity.ok(trainService.getTrainsByCorridor(corridorId));
        }
        return ResponseEntity.ok(trainService.getAllTrains());
    }

    /**
     * GET /api/trains/live
     * Returns real-time telemetry for all operating trains.
     */
    @GetMapping("/live")
    public ResponseEntity<List<TrainLiveResponse>> getAllLiveTrains(
            @RequestParam(defaultValue = "false") boolean forceRefresh) {

        List<TrainTelemetry> telemetryList = trackingService.getAllLiveTelemetry(forceRefresh);
        List<TrainLiveResponse> responses = telemetryList.stream()
                .map(TrainLiveResponse::from)
                .toList();
        return ResponseEntity.ok(responses);
    }

    /**
     * GET /api/trains/live/summary
     * Returns dashboard telemetry summary (live, delayed, stale, source).
     */
    @GetMapping("/live/summary")
    public ResponseEntity<TrainTelemetrySummaryResponse> getLiveTelemetrySummary() {
        return ResponseEntity.ok(trackingService.getTelemetrySummary());
    }

    /**
     * POST /api/trains/live/refresh
     * Forces immediate refresh from tracking provider.
     */
    @PostMapping("/live/refresh")
    public ResponseEntity<List<TrainLiveResponse>> refreshLiveTrains() {
        List<TrainTelemetry> telemetryList = trackingService.getAllLiveTelemetry(true);
        List<TrainLiveResponse> responses = telemetryList.stream()
                .map(TrainLiveResponse::from)
                .toList();
        return ResponseEntity.ok(responses);
    }

    /**
     * GET /api/trains/{identifier}/live
     * Returns live telemetry for a specific train number.
     */
    @GetMapping("/{identifier}/live")
    public ResponseEntity<TrainLiveResponse> getLiveTrainByNumber(@PathVariable String identifier) {
        TrainTelemetry telemetry = trackingService.getLiveTelemetryForTrain(identifier)
                .orElseThrow(() -> new ResourceNotFoundException("Live telemetry unavailable for train: " + identifier));
        return ResponseEntity.ok(TrainLiveResponse.from(telemetry));
    }

    /**
     * GET /api/trains/{id}
     * Returns train master by primary key ID.
     */
    @GetMapping("/{id}")
    public ResponseEntity<TrainResponse> getTrainById(@PathVariable Long id) {
        return ResponseEntity.ok(trainService.getTrainById(id));
    }
}

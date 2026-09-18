package com.railopt.controller;

import com.railopt.dto.AssetResponse;
import com.railopt.service.RailwayAssetService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/assets")
@RequiredArgsConstructor
public class RailwayAssetController {

    private final RailwayAssetService assetService;

    /**
     * GET /api/assets
     * GET /api/assets?department=PWAY
     * GET /api/assets?status=CRITICAL
     * GET /api/assets?corridorId=1
     */
    @GetMapping
    public ResponseEntity<List<AssetResponse>> getAssets(
            @RequestParam(required = false) String department,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) Long corridorId) {

        if (department != null) {
            return ResponseEntity.ok(assetService.getAssetsByDepartment(department));
        }
        if (status != null) {
            return ResponseEntity.ok(assetService.getAssetsByStatus(status));
        }
        if (corridorId != null) {
            return ResponseEntity.ok(assetService.getAssetsByCorridor(corridorId));
        }
        return ResponseEntity.ok(assetService.getAllAssets());
    }

    @GetMapping("/{id}")
    public ResponseEntity<AssetResponse> getAssetById(@PathVariable Long id) {
        return ResponseEntity.ok(assetService.getAssetById(id));
    }
}

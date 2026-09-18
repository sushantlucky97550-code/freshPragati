package com.railopt.service;

import com.railopt.dto.AssetResponse;
import com.railopt.entity.AssetStatus;
import com.railopt.entity.RailwayAsset;
import com.railopt.exception.ResourceNotFoundException;
import com.railopt.repository.RailwayAssetRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class RailwayAssetService {

    private final RailwayAssetRepository assetRepository;

    public List<AssetResponse> getAllAssets() {
        return assetRepository.findAll().stream().map(AssetResponse::from).toList();
    }

    public List<AssetResponse> getAssetsByDepartment(String departmentCode) {
        return assetRepository.findByDepartment_Code(departmentCode)
                .stream().map(AssetResponse::from).toList();
    }

    public List<AssetResponse> getAssetsByStatus(String statusStr) {
        AssetStatus status = AssetStatus.valueOf(statusStr.toUpperCase());
        return assetRepository.findByStatus(status)
                .stream().map(AssetResponse::from).toList();
    }

    public List<AssetResponse> getAssetsByCorridor(Long corridorId) {
        return assetRepository.findByCorridor_Id(corridorId)
                .stream().map(AssetResponse::from).toList();
    }

    public AssetResponse getAssetById(Long id) {
        RailwayAsset asset = assetRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Asset not found with id: " + id));
        return AssetResponse.from(asset);
    }
}

package com.railopt.dto;

import com.railopt.entity.RailwayAsset;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;

@Data
@Builder
public class AssetResponse {

    private Long id;
    private String assetId;
    private String name;
    private String assetType;
    private Long departmentId;
    private String departmentName;
    private String departmentCode;
    private Long corridorId;
    private String corridorName;
    private String corridorCode;
    private String section;
    private String location;
    private Integer healthScore;
    private String status;
    private LocalDate lastMaintenance;
    private LocalDate nextInspectionDue;
    private Integer defectsCount;
    private String activeTsr;
    private Double gmtCarried;

    public static AssetResponse from(RailwayAsset a) {
        return AssetResponse.builder()
                .id(a.getId())
                .assetId(a.getAssetId())
                .name(a.getName())
                .assetType(a.getAssetType().name())
                .departmentId(a.getDepartment() != null ? a.getDepartment().getId() : null)
                .departmentName(a.getDepartment() != null ? a.getDepartment().getName() : null)
                .departmentCode(a.getDepartment() != null ? a.getDepartment().getCode() : null)
                .corridorId(a.getCorridor() != null ? a.getCorridor().getId() : null)
                .corridorName(a.getCorridor() != null ? a.getCorridor().getName() : null)
                .corridorCode(a.getCorridor() != null ? a.getCorridor().getCorridorId() : null)
                .section(a.getSection())
                .location(a.getLocation())
                .healthScore(a.getHealthScore())
                .status(a.getStatus().name())
                .lastMaintenance(a.getLastMaintenance())
                .nextInspectionDue(a.getNextInspectionDue())
                .defectsCount(a.getDefectsCount())
                .activeTsr(a.getActiveTsr())
                .gmtCarried(a.getGmtCarried())
                .build();
    }
}

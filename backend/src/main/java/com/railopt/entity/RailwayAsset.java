package com.railopt.entity;

import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Represents a physical railway asset — track, bridge, signal, TSS, OHE, etc.
 * Linked to a Department (owner) and a Corridor (location) via @DBRef.
 */
@Document(collection = "railway_assets")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RailwayAsset {

    @Id
    private Long id;

    /** Human-readable unique ID e.g. "AST-TRK-01", "AST-TSS-05" */
    @Indexed(unique = true)
    private String assetId;

    private String name;

    private AssetType assetType;

    /** Department responsible for this asset */
    @DBRef
    private Department department;

    /** Corridor where this asset is located */
    @DBRef
    private Corridor corridor;

    /** Track section or chainage e.g. "Aligarh - Sasni" */
    private String section;

    /** Physical location description */
    private String location;

    /** Health score 0-100 */
    @Builder.Default
    private Integer healthScore = 100;

    @Builder.Default
    private AssetStatus status = AssetStatus.GOOD;

    private LocalDate lastMaintenance;

    private LocalDate nextInspectionDue;

    /** Number of currently open defects */
    @Builder.Default
    private Integer defectsCount = 0;

    /** Active Temporary Speed Restriction if any */
    private String activeTsr;

    /** GMT (Gross Million Tonnes) carried for track sections */
    private Double gmtCarried;

    @CreatedDate
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;
}

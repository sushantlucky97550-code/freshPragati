package com.railopt.repository;

import com.railopt.entity.AssetStatus;
import com.railopt.entity.AssetType;
import com.railopt.entity.RailwayAsset;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RailwayAssetRepository extends MongoRepository<RailwayAsset, Long> {

    Optional<RailwayAsset> findByAssetId(String assetId);

    default List<RailwayAsset> findByDepartment_Code(String departmentCode) {
        return findAll().stream()
                .filter(a -> a.getDepartment() != null && departmentCode.equalsIgnoreCase(a.getDepartment().getCode()))
                .toList();
    }

    List<RailwayAsset> findByStatus(AssetStatus status);

    @Query("{'corridor.$id': ?0}")
    List<RailwayAsset> findByCorridor_Id(Long corridorId);

    List<RailwayAsset> findByAssetType(AssetType assetType);

    @Query("{'corridor.$id': ?0, 'status': ?1}")
    List<RailwayAsset> findByCorridor_IdAndStatus(Long corridorId, AssetStatus status);

    @Query("{'healthScore': { $lt: ?0 }}")
    List<RailwayAsset> findByHealthScoreLessThan(int threshold);

    long countByStatus(AssetStatus status);
}

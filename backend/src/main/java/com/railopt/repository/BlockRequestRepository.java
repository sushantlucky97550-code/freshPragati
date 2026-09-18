package com.railopt.repository;

import com.railopt.entity.BlockRequest;
import com.railopt.entity.BlockRequestStatus;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BlockRequestRepository extends MongoRepository<BlockRequest, Long> {

    @Query("{'corridor.$id': ?0}")
    List<BlockRequest> findByCorridor_Id(Long corridorId);

    default List<BlockRequest> findByDepartment_Code(String departmentCode) {
        return findAll().stream()
                .filter(b -> b.getDepartment() != null && departmentCode.equalsIgnoreCase(b.getDepartment().getCode()))
                .toList();
    }

    List<BlockRequest> findByStatus(BlockRequestStatus status);

    boolean existsByBlockId(String blockId);

    long countByStatus(BlockRequestStatus status);
}

package com.railopt.service;

import com.railopt.dto.BlockRequestRequest;
import com.railopt.dto.BlockRequestResponse;
import com.railopt.entity.BlockRequest;
import com.railopt.entity.BlockRequestStatus;
import com.railopt.entity.Corridor;
import com.railopt.entity.Department;
import com.railopt.exception.ResourceNotFoundException;
import com.railopt.repository.BlockRequestRepository;
import com.railopt.repository.CorridorRepository;
import com.railopt.repository.DepartmentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class BlockRequestService {

    private final BlockRequestRepository blockRequestRepository;
    private final CorridorRepository corridorRepository;
    private final DepartmentRepository departmentRepository;

    public List<BlockRequestResponse> getAllBlockRequests() {
        return blockRequestRepository.findAll().stream()
                .map(BlockRequestResponse::from).toList();
    }

    public List<BlockRequestResponse> getBlockRequestsByStatus(String statusStr) {
        BlockRequestStatus status = BlockRequestStatus.valueOf(statusStr.toUpperCase());
        return blockRequestRepository.findByStatus(status).stream()
                .map(BlockRequestResponse::from).toList();
    }

    @Transactional
    public BlockRequestResponse createBlockRequest(BlockRequestRequest request) {
        Corridor corridor = corridorRepository.findByCorridorId(request.getCorridorId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Corridor not found: " + request.getCorridorId()));

        Department department = departmentRepository.findByCode(request.getDepartmentCode())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Department not found: " + request.getDepartmentCode()));

        String blockId = "BLK-REQ-" + request.getDepartmentCode() + "-"
                + UUID.randomUUID().toString().substring(0, 8).toUpperCase();

        BlockRequest blockRequest = BlockRequest.builder()
                .blockId(blockId)
                .corridor(corridor)
                .department(department)
                .trackLine(request.getTrackLine())
                .requestedStart(request.getRequestedStart())
                .requestedEnd(request.getRequestedEnd())
                .durationMinutes(request.getDurationMinutes())
                .priority(request.getPriority())
                .status(BlockRequestStatus.PENDING)
                .notes(request.getNotes())
                .requestedBy(request.getRequestedBy())
                .build();

        BlockRequest saved = blockRequestRepository.save(blockRequest);
        log.info("Created block request: {}", saved.getBlockId());
        return BlockRequestResponse.from(saved);
    }
}

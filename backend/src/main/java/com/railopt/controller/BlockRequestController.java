package com.railopt.controller;

import com.railopt.dto.BlockRequestRequest;
import com.railopt.dto.BlockRequestResponse;
import com.railopt.service.BlockRequestService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/block-requests")
@RequiredArgsConstructor
public class BlockRequestController {

    private final BlockRequestService blockRequestService;

    /**
     * GET /api/block-requests
     * GET /api/block-requests?status=PENDING
     */
    @GetMapping
    public ResponseEntity<List<BlockRequestResponse>> getBlockRequests(
            @RequestParam(required = false) String status) {
        if (status != null) {
            return ResponseEntity.ok(blockRequestService.getBlockRequestsByStatus(status));
        }
        return ResponseEntity.ok(blockRequestService.getAllBlockRequests());
    }

    @PostMapping
    public ResponseEntity<BlockRequestResponse> createBlockRequest(
            @Valid @RequestBody BlockRequestRequest request) {
        BlockRequestResponse response = blockRequestService.createBlockRequest(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
}

package com.railopt.service;

import com.railopt.dto.CorridorResponse;
import com.railopt.entity.Corridor;
import com.railopt.exception.ResourceNotFoundException;
import com.railopt.repository.CorridorRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class CorridorService {

    private final CorridorRepository corridorRepository;

    public List<CorridorResponse> getAllCorridors() {
        log.debug("Fetching all corridors");
        return corridorRepository.findAllWithDetails()
                .stream()
                .map(CorridorResponse::from)
                .toList();
    }

    public CorridorResponse getCorridorById(Long id) {
        log.debug("Fetching corridor id={}", id);
        Corridor corridor = corridorRepository.findByIdWithDetails(id)
                .orElseThrow(() -> new ResourceNotFoundException("Corridor not found with id: " + id));
        return CorridorResponse.from(corridor);
    }

    public CorridorResponse getCorridorByCode(String corridorId) {
        log.debug("Fetching corridor code={}", corridorId);
        Corridor corridor = corridorRepository.findByCorridorId(corridorId)
                .orElseThrow(() -> new ResourceNotFoundException("Corridor not found with code: " + corridorId));
        return CorridorResponse.from(corridor);
    }
}

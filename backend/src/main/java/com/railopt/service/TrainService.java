package com.railopt.service;

import com.railopt.dto.TrainResponse;
import com.railopt.entity.Train;
import com.railopt.exception.ResourceNotFoundException;
import com.railopt.repository.TrainRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class TrainService {

    private final TrainRepository trainRepository;

    public List<TrainResponse> getAllTrains() {
        return trainRepository.findAll().stream().map(TrainResponse::from).toList();
    }

    public List<TrainResponse> getTrainsByCorridor(Long corridorId) {
        return trainRepository.findByCorridor_Id(corridorId)
                .stream().map(TrainResponse::from).toList();
    }

    public List<TrainResponse> getTrainsByCorridorCode(String corridorCode) {
        return trainRepository.findByCorridor_CorridorId(corridorCode)
                .stream().map(TrainResponse::from).toList();
    }

    public TrainResponse getTrainById(Long id) {
        Train train = trainRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Train not found with id: " + id));
        return TrainResponse.from(train);
    }
}

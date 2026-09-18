package com.railopt.dto;

import com.railopt.entity.BlockRequest;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class BlockRequestResponse {

    private Long id;
    private String blockId;
    private Long corridorId;
    private String corridorName;
    private String corridorCode;
    private Long departmentId;
    private String departmentName;
    private String departmentCode;
    private String trackLine;
    private String requestedStart;
    private String requestedEnd;
    private Integer durationMinutes;
    private String priority;
    private String status;
    private String notes;
    private String requestedBy;
    private LocalDateTime createdAt;

    public static BlockRequestResponse from(BlockRequest r) {
        return BlockRequestResponse.builder()
                .id(r.getId())
                .blockId(r.getBlockId())
                .corridorId(r.getCorridor() != null ? r.getCorridor().getId() : null)
                .corridorName(r.getCorridor() != null ? r.getCorridor().getName() : null)
                .corridorCode(r.getCorridor() != null ? r.getCorridor().getCorridorId() : null)
                .departmentId(r.getDepartment() != null ? r.getDepartment().getId() : null)
                .departmentName(r.getDepartment() != null ? r.getDepartment().getName() : null)
                .departmentCode(r.getDepartment() != null ? r.getDepartment().getCode() : null)
                .trackLine(r.getTrackLine())
                .requestedStart(r.getRequestedStart())
                .requestedEnd(r.getRequestedEnd())
                .durationMinutes(r.getDurationMinutes())
                .priority(r.getPriority() != null ? r.getPriority().name() : null)
                .status(r.getStatus().name())
                .notes(r.getNotes())
                .requestedBy(r.getRequestedBy())
                .createdAt(r.getCreatedAt())
                .build();
    }
}

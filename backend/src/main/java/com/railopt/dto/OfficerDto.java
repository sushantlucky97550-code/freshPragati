package com.railopt.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OfficerDto {

    private Long id;
    private String officerId;
    private String name;
    private String department;
    private String role;
    private String title;
    private String zone;
    private String division;
    private List<String> authorizedDivisions;
    private List<String> permissions;
    private String accountStatus;
    private LocalDateTime lastLogin;
}

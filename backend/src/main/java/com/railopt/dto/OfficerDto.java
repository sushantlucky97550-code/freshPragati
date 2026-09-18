package com.railopt.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

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
    private String division;
    private String accountStatus;
    private LocalDateTime lastLogin;
}

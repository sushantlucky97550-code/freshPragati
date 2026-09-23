package com.railopt.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuthorizeTodayRequest {

    @NotBlank(message = "DOM Officer ID is required")
    private String officerId;

    @NotBlank(message = "Password is required")
    private String password;

    @NotEmpty(message = "At least one task must be selected")
    private List<String> taskIds; // Can be taskId strings or numeric IDs

    private String zone; // e.g. "WCR"
    private String division; // e.g. "Bhopal"
    private String remarks;
}

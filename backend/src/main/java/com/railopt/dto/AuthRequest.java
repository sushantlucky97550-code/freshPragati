package com.railopt.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuthRequest {

    @NotBlank(message = "Government / Officer ID is required")
    private String officerId;

    @NotBlank(message = "Password is required")
    private String password;

    /**
     * Optional requested Railway Zone context (e.g. "WCR", "NR").
     * When present, backend enforces that officer is authorized for this zone.
     */
    private String zone;

    public AuthRequest(String officerId, String password) {
        this.officerId = officerId;
        this.password = password;
        this.zone = null;
    }
}

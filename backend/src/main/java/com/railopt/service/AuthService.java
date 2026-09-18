package com.railopt.service;

import com.railopt.dto.AuthRequest;
import com.railopt.dto.AuthResponse;
import com.railopt.dto.OfficerDto;
import com.railopt.entity.AuthAuditLog;
import com.railopt.entity.User;
import jakarta.servlet.http.HttpServletRequest;

import java.util.List;

public interface AuthService {

    AuthResponse login(AuthRequest request, HttpServletRequest httpRequest);

    void logout(String officerId, HttpServletRequest httpRequest);

    OfficerDto getMe(String officerId);

    List<AuthAuditLog> getAuditLogs();

    List<OfficerDto> getAllOfficers();

    OfficerDto toDto(User user);
}

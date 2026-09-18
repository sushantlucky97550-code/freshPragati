package com.railopt.service;

import com.railopt.dto.AuthRequest;
import com.railopt.dto.AuthResponse;
import com.railopt.dto.OfficerDto;
import com.railopt.entity.AccountStatus;
import com.railopt.entity.AuthAuditLog;
import com.railopt.entity.AuthEventType;
import com.railopt.entity.User;
import com.railopt.repository.AuthAuditLogRepository;
import com.railopt.repository.UserRepository;
import com.railopt.security.JwtService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.LockedException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final AuthAuditLogRepository auditLogRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    private static final int MAX_FAILED_ATTEMPTS = 5;
    private static final int LOCKOUT_MINUTES = 15;

    @Override
    @Transactional
    public AuthResponse login(AuthRequest request, HttpServletRequest httpRequest) {
        String officerId = request.getOfficerId().trim();
        String ipAddress = extractClientIp(httpRequest);
        String userAgent = httpRequest.getHeader("User-Agent");

        Optional<User> userOpt = userRepository.findByOfficerId(officerId);

        if (userOpt.isPresent()) {
            User user = userOpt.get();

            // 1. Check if account is suspended
            if (user.getAccountStatus() == AccountStatus.SUSPENDED) {
                recordAudit(officerId, AuthEventType.LOGIN_FAILED, ipAddress, userAgent, false, "Account suspended");
                throw new BadCredentialsException("Account is suspended. Contact Railway System Administrator.");
            }

            // 2. Check lockout status
            if (user.getAccountStatus() == AccountStatus.LOCKED) {
                if (user.getLockedUntil() != null && LocalDateTime.now().isBefore(user.getLockedUntil())) {
                    long remainingMins = ChronoUnit.MINUTES.between(LocalDateTime.now(), user.getLockedUntil()) + 1;
                    recordAudit(officerId, AuthEventType.ACCOUNT_LOCKED, ipAddress, userAgent, false,
                            "Login attempted while account locked. Remaining: " + remainingMins + "m");
                    throw new LockedException("Account temporarily locked due to excessive failed attempts. Please try again in "
                            + remainingMins + " minutes.");
                } else {
                    // Lock duration has elapsed — reset lock
                    user.setAccountStatus(AccountStatus.ACTIVE);
                    user.setFailedLoginAttempts(0);
                    user.setLockedUntil(null);
                    userRepository.save(user);
                    log.info("[AuthService] Account lockout expired for officer: {}", officerId);
                }
            }

            // 3. Check password
            if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
                int attempts = user.getFailedLoginAttempts() + 1;
                user.setFailedLoginAttempts(attempts);

                if (attempts >= MAX_FAILED_ATTEMPTS) {
                    user.setAccountStatus(AccountStatus.LOCKED);
                    user.setLockedUntil(LocalDateTime.now().plusMinutes(LOCKOUT_MINUTES));
                    userRepository.save(user);

                    recordAudit(officerId, AuthEventType.ACCOUNT_LOCKED, ipAddress, userAgent, false,
                            "Account locked after " + attempts + " failed attempts");
                    log.warn("[AuthService] Account locked for officer {} due to {} failed attempts", officerId, attempts);
                    throw new LockedException("Account temporarily locked due to 5 failed attempts. Locked for 15 minutes.");
                } else {
                    userRepository.save(user);
                    recordAudit(officerId, AuthEventType.LOGIN_FAILED, ipAddress, userAgent, false,
                            "Invalid credentials (attempt " + attempts + " of " + MAX_FAILED_ATTEMPTS + ")");
                    throw new BadCredentialsException("Invalid Officer ID or password.");
                }
            }

            // 4. Successful Authentication
            user.setFailedLoginAttempts(0);
            user.setLockedUntil(null);
            user.setLastLogin(LocalDateTime.now());
            userRepository.save(user);

            String token = jwtService.generateToken(user);

            recordAudit(officerId, AuthEventType.LOGIN_SUCCESS, ipAddress, userAgent, true,
                    "Officer authenticated successfully");
            log.info("[AuthService] Officer {} ({}) successfully authenticated", officerId, user.getRole());

            return AuthResponse.builder()
                    .authenticated(true)
                    .token(token)
                    .officer(toDto(user))
                    .message("Authentication successful")
                    .build();

        } else {
            // User does not exist — record generic audit without leaking existence
            recordAudit(officerId, AuthEventType.LOGIN_FAILED, ipAddress, userAgent, false, "Unknown officer ID attempt");
            throw new BadCredentialsException("Invalid Officer ID or password.");
        }
    }

    @Override
    public void logout(String officerId, HttpServletRequest httpRequest) {
        String ipAddress = extractClientIp(httpRequest);
        String userAgent = httpRequest.getHeader("User-Agent");
        recordAudit(officerId != null ? officerId : "UNKNOWN", AuthEventType.LOGOUT, ipAddress, userAgent, true,
                "Officer logged out session");
        log.info("[AuthService] Officer {} logged out", officerId);
    }

    @Override
    public OfficerDto getMe(String officerId) {
        User user = userRepository.findByOfficerId(officerId)
                .orElseThrow(() -> new BadCredentialsException("Officer profile not found"));
        return toDto(user);
    }

    @Override
    public List<AuthAuditLog> getAuditLogs() {
        return auditLogRepository.findTop100ByOrderByTimestampDesc();
    }

    @Override
    public List<OfficerDto> getAllOfficers() {
        return userRepository.findAll().stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public OfficerDto toDto(User user) {
        return OfficerDto.builder()
                .id(user.getId())
                .officerId(user.getOfficerId())
                .name(user.getName())
                .department(user.getDepartment())
                .role(user.getRole())
                .title(user.getTitle())
                .division(user.getDivision())
                .accountStatus(user.getAccountStatus() != null ? user.getAccountStatus().name() : "ACTIVE")
                .lastLogin(user.getLastLogin())
                .build();
    }

    private void recordAudit(String officerId, AuthEventType eventType, String ip, String userAgent, boolean success, String details) {
        try {
            AuthAuditLog logEntry = AuthAuditLog.builder()
                    .officerId(officerId)
                    .eventType(eventType)
                    .timestamp(LocalDateTime.now())
                    .ipAddress(ip)
                    .userAgent(userAgent != null && userAgent.length() > 200 ? userAgent.substring(0, 200) : userAgent)
                    .success(success)
                    .details(details)
                    .build();
            auditLogRepository.save(logEntry);
        } catch (Exception e) {
            log.error("[AuthService] Failed to record audit log: {}", e.getMessage());
        }
    }

    private String extractClientIp(HttpServletRequest request) {
        if (request == null) return "127.0.0.1";
        String xfHeader = request.getHeader("X-Forwarded-For");
        if (xfHeader != null && !xfHeader.isEmpty() && !"unknown".equalsIgnoreCase(xfHeader)) {
            return xfHeader.split(",")[0].trim();
        }
        return request.getRemoteAddr() != null ? request.getRemoteAddr() : "127.0.0.1";
    }
}

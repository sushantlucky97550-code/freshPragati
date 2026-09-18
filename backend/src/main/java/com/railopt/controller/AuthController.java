package com.railopt.controller;

import com.railopt.dto.AuthRequest;
import com.railopt.dto.AuthResponse;
import com.railopt.dto.OfficerDto;
import com.railopt.entity.AuthAuditLog;
import com.railopt.entity.User;
import com.railopt.repository.UserRepository;
import com.railopt.security.JwtService;
import com.railopt.service.AuthService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.LockedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Slf4j
public class AuthController {

    private final AuthService authService;
    private final JwtService jwtService;
    private final UserRepository userRepository;

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody AuthRequest request, HttpServletRequest httpRequest) {
        try {
            AuthResponse response = authService.login(request, httpRequest);
            return ResponseEntity.ok(response);
        } catch (LockedException e) {
            return ResponseEntity.status(HttpStatus.LOCKED).body(Map.of(
                    "authenticated", false,
                    "error", "ACCOUNT_LOCKED",
                    "message", e.getMessage()
            ));
        } catch (BadCredentialsException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of(
                    "authenticated", false,
                    "error", "INVALID_CREDENTIALS",
                    "message", e.getMessage()
            ));
        } catch (Exception e) {
            log.error("[AuthController] Unexpected error during login: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                    "authenticated", false,
                    "error", "SERVER_ERROR",
                    "message", "An error occurred during authentication. Please contact Railway Control Helpdesk."
            ));
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpServletRequest httpRequest) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String officerId = null;
        if (auth != null && auth.getPrincipal() instanceof User user) {
            officerId = user.getOfficerId();
        }
        authService.logout(officerId, httpRequest);
        SecurityContextHolder.clearContext();
        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Session successfully invalidated."
        ));
    }

    @GetMapping("/me")
    public ResponseEntity<?> getMe() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !(auth.getPrincipal() instanceof User user)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of(
                    "authenticated", false,
                    "message", "No active session found."
            ));
        }

        OfficerDto officer = authService.getMe(user.getOfficerId());
        return ResponseEntity.ok(Map.of(
                "authenticated", true,
                "officer", officer
        ));
    }

    @PostMapping("/refresh")
    public ResponseEntity<?> refreshToken() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !(auth.getPrincipal() instanceof User user)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of(
                    "authenticated", false,
                    "message", "Cannot refresh expired or invalid session."
            ));
        }

        User freshUser = userRepository.findByOfficerId(user.getOfficerId())
                .orElse(user);
        String newToken = jwtService.generateToken(freshUser);

        return ResponseEntity.ok(AuthResponse.builder()
                .authenticated(true)
                .token(newToken)
                .officer(authService.toDto(freshUser))
                .message("Session refreshed")
                .build());
    }

    @GetMapping("/audit-logs")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<AuthAuditLog>> getAuditLogs() {
        return ResponseEntity.ok(authService.getAuditLogs());
    }

    @GetMapping("/users")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<OfficerDto>> getAllOfficers() {
        return ResponseEntity.ok(authService.getAllOfficers());
    }
}

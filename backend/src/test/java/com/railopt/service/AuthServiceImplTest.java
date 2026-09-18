package com.railopt.service;

import com.railopt.dto.AuthRequest;
import com.railopt.dto.AuthResponse;
import com.railopt.entity.AccountStatus;
import com.railopt.entity.AuthEventType;
import com.railopt.entity.User;
import com.railopt.repository.AuthAuditLogRepository;
import com.railopt.repository.UserRepository;
import com.railopt.security.JwtService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.mockito.Mockito;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.LockedException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.lang.reflect.Field;
import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@DisplayName("AuthServiceImpl Unit Tests")
class AuthServiceImplTest {

    private UserRepository userRepository;
    private AuthAuditLogRepository auditLogRepository;
    private PasswordEncoder passwordEncoder;
    private JwtService jwtService;
    private AuthServiceImpl authService;

    @BeforeEach
    void setUp() throws Exception {
        userRepository = Mockito.mock(UserRepository.class);
        auditLogRepository = Mockito.mock(AuthAuditLogRepository.class);
        passwordEncoder = new BCryptPasswordEncoder();
        jwtService = new JwtService();

        // Configure jwt secret and expiration via reflection for testing
        Field secretField = JwtService.class.getDeclaredField("secretString");
        secretField.setAccessible(true);
        secretField.set(jwtService, "RailOptAI-Secure-Railway-Defense-SecretKey-For-Authentication-2026-Strict");

        Field expField = JwtService.class.getDeclaredField("jwtExpirationMs");
        expField.setAccessible(true);
        expField.set(jwtService, 86400000L);

        authService = new AuthServiceImpl(userRepository, auditLogRepository, passwordEncoder, jwtService);
    }

    @Test
    @DisplayName("login() succeeds with valid credentials and returns JWT")
    void login_success() {
        User user = User.builder()
                .id(1L)
                .officerId("OFF-ENG-201")
                .name("Er. Vikram Singh")
                .department("ENGINEERING")
                .role("ENGINEERING_OFFICER")
                .title("Senior Section Engineer (P-Way)")
                .division("NCR - Prayagraj Division")
                .passwordHash(passwordEncoder.encode("RailOpt@Eng2026"))
                .accountStatus(AccountStatus.ACTIVE)
                .failedLoginAttempts(0)
                .build();

        when(userRepository.findByOfficerId("OFF-ENG-201")).thenReturn(Optional.of(user));

        AuthRequest request = new AuthRequest("OFF-ENG-201", "RailOpt@Eng2026");
        MockHttpServletRequest httpRequest = new MockHttpServletRequest();

        AuthResponse response = authService.login(request, httpRequest);

        assertTrue(response.isAuthenticated());
        assertNotNull(response.getToken());
        assertEquals("OFF-ENG-201", response.getOfficer().getOfficerId());
        assertEquals("ENGINEERING_OFFICER", response.getOfficer().getRole());
        assertEquals(0, user.getFailedLoginAttempts());
        assertNotNull(user.getLastLogin());

        verify(auditLogRepository, times(1)).save(argThat(log ->
                log.getEventType() == AuthEventType.LOGIN_SUCCESS && log.isSuccess()
        ));
    }

    @Test
    @DisplayName("login() throws BadCredentialsException on wrong password and tracks failed attempts")
    void login_wrongPassword_incrementsAttempts() {
        User user = User.builder()
                .id(1L)
                .officerId("OFF-ENG-201")
                .name("Er. Vikram Singh")
                .department("ENGINEERING")
                .role("ENGINEERING_OFFICER")
                .passwordHash(passwordEncoder.encode("CorrectPass"))
                .accountStatus(AccountStatus.ACTIVE)
                .failedLoginAttempts(2)
                .build();

        when(userRepository.findByOfficerId("OFF-ENG-201")).thenReturn(Optional.of(user));

        AuthRequest request = new AuthRequest("OFF-ENG-201", "WrongPass");
        MockHttpServletRequest httpRequest = new MockHttpServletRequest();

        assertThrows(BadCredentialsException.class, () -> authService.login(request, httpRequest));
        assertEquals(3, user.getFailedLoginAttempts());
        verify(userRepository, times(1)).save(user);

        verify(auditLogRepository, times(1)).save(argThat(log ->
                log.getEventType() == AuthEventType.LOGIN_FAILED && !log.isSuccess()
        ));
    }

    @Test
    @DisplayName("login() triggers account lockout after 5 failed attempts")
    void login_lockoutAfter5Attempts() {
        User user = User.builder()
                .id(1L)
                .officerId("OFF-ENG-201")
                .name("Er. Vikram Singh")
                .department("ENGINEERING")
                .role("ENGINEERING_OFFICER")
                .passwordHash(passwordEncoder.encode("CorrectPass"))
                .accountStatus(AccountStatus.ACTIVE)
                .failedLoginAttempts(4)
                .build();

        when(userRepository.findByOfficerId("OFF-ENG-201")).thenReturn(Optional.of(user));

        AuthRequest request = new AuthRequest("OFF-ENG-201", "WrongPass");
        MockHttpServletRequest httpRequest = new MockHttpServletRequest();

        assertThrows(LockedException.class, () -> authService.login(request, httpRequest));
        assertEquals(5, user.getFailedLoginAttempts());
        assertEquals(AccountStatus.LOCKED, user.getAccountStatus());
        assertNotNull(user.getLockedUntil());
        verify(userRepository, times(1)).save(user);

        verify(auditLogRepository, times(1)).save(argThat(log ->
                log.getEventType() == AuthEventType.ACCOUNT_LOCKED
        ));
    }

    @Test
    @DisplayName("login() rejects unknown officer ID without leaking whether ID exists")
    void login_unknownOfficerId() {
        when(userRepository.findByOfficerId("OFF-UNKNOWN")).thenReturn(Optional.empty());

        AuthRequest request = new AuthRequest("OFF-UNKNOWN", "SomePass");
        MockHttpServletRequest httpRequest = new MockHttpServletRequest();

        BadCredentialsException ex = assertThrows(BadCredentialsException.class,
                () -> authService.login(request, httpRequest));
        assertEquals("Invalid Officer ID or password.", ex.getMessage());

        verify(auditLogRepository, times(1)).save(argThat(log ->
                log.getEventType() == AuthEventType.LOGIN_FAILED && "OFF-UNKNOWN".equals(log.getOfficerId())
        ));
    }
}

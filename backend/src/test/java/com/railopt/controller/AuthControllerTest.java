package com.railopt.controller;

import com.railopt.dto.AuthRequest;
import com.railopt.dto.AuthResponse;
import com.railopt.dto.OfficerDto;
import com.railopt.entity.AuthAuditLog;
import com.railopt.entity.AuthEventType;
import com.railopt.entity.User;
import com.railopt.repository.UserRepository;
import com.railopt.security.JwtService;
import com.railopt.service.AuthService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.LockedException;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@DisplayName("AuthController Unit Tests")
class AuthControllerTest {

    private AuthService authService;
    private JwtService jwtService;
    private UserRepository userRepository;
    private AuthController controller;

    @BeforeEach
    void setUp() {
        authService = Mockito.mock(AuthService.class);
        userRepository = Mockito.mock(UserRepository.class);
        jwtService = new JwtService();
        controller = new AuthController(authService, jwtService, userRepository);
    }

    @Test
    @DisplayName("login() with valid credentials returns 200 OK with AuthResponse")
    void login_validCredentials_returnsOk() {
        OfficerDto officer = OfficerDto.builder()
                .id(1L)
                .officerId("OFF-ENG-201")
                .name("Er. Vikram Singh")
                .department("ENGINEERING")
                .role("ENGINEERING_OFFICER")
                .title("Senior Section Engineer (P-Way)")
                .division("NCR - Prayagraj Division")
                .build();

        AuthResponse mockResponse = AuthResponse.builder()
                .authenticated(true)
                .token("mock-jwt-token-xyz")
                .officer(officer)
                .message("Authentication successful")
                .build();

        when(authService.login(any(AuthRequest.class), any())).thenReturn(mockResponse);

        AuthRequest request = new AuthRequest("OFF-ENG-201", "RailOpt@Eng2026");
        MockHttpServletRequest httpRequest = new MockHttpServletRequest();

        ResponseEntity<?> response = controller.login(request, httpRequest);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertTrue(response.getBody() instanceof AuthResponse);
        AuthResponse body = (AuthResponse) response.getBody();
        assertTrue(body.isAuthenticated());
        assertEquals("OFF-ENG-201", body.getOfficer().getOfficerId());
        assertEquals("mock-jwt-token-xyz", body.getToken());
    }

    @Test
    @DisplayName("login() with bad credentials returns 401 UNAUTHORIZED with generic error")
    void login_invalidCredentials_returns401() {
        when(authService.login(any(AuthRequest.class), any()))
                .thenThrow(new BadCredentialsException("Invalid Officer ID or password."));

        AuthRequest request = new AuthRequest("OFF-ENG-201", "WrongPass");
        MockHttpServletRequest httpRequest = new MockHttpServletRequest();

        ResponseEntity<?> response = controller.login(request, httpRequest);

        assertEquals(HttpStatus.UNAUTHORIZED, response.getStatusCode());
        assertTrue(response.getBody() instanceof Map);
        Map<?, ?> body = (Map<?, ?>) response.getBody();
        assertEquals(false, body.get("authenticated"));
        assertEquals("INVALID_CREDENTIALS", body.get("error"));
        assertEquals("Invalid Officer ID or password.", body.get("message"));
    }

    @Test
    @DisplayName("login() with locked account returns 423 LOCKED with warning")
    void login_lockedAccount_returns423() {
        when(authService.login(any(AuthRequest.class), any()))
                .thenThrow(new LockedException("Account temporarily locked due to 5 failed attempts. Locked for 15 minutes."));

        AuthRequest request = new AuthRequest("OFF-ENG-201", "AnyPass");
        MockHttpServletRequest httpRequest = new MockHttpServletRequest();

        ResponseEntity<?> response = controller.login(request, httpRequest);

        assertEquals(HttpStatus.LOCKED, response.getStatusCode());
        assertTrue(response.getBody() instanceof Map);
        Map<?, ?> body = (Map<?, ?>) response.getBody();
        assertEquals(false, body.get("authenticated"));
        assertEquals("ACCOUNT_LOCKED", body.get("error"));
    }

    @Test
    @DisplayName("logout() clears session and returns success")
    void logout_success() {
        MockHttpServletRequest httpRequest = new MockHttpServletRequest();
        ResponseEntity<?> response = controller.logout(httpRequest);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertTrue(response.getBody() instanceof Map);
        Map<?, ?> body = (Map<?, ?>) response.getBody();
        assertEquals(true, body.get("success"));
    }

    @Test
    @DisplayName("getAuditLogs() returns list of audit events")
    void getAuditLogs_returnsList() {
        AuthAuditLog log1 = AuthAuditLog.builder()
                .id(1L)
                .officerId("OFF-ENG-201")
                .eventType(AuthEventType.LOGIN_SUCCESS)
                .timestamp(LocalDateTime.now())
                .success(true)
                .build();

        when(authService.getAuditLogs()).thenReturn(List.of(log1));

        ResponseEntity<List<AuthAuditLog>> response = controller.getAuditLogs();

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(1, response.getBody().size());
        assertEquals(AuthEventType.LOGIN_SUCCESS, response.getBody().get(0).getEventType());
    }
}

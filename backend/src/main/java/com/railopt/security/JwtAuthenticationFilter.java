package com.railopt.security;

import com.railopt.entity.AccountStatus;
import com.railopt.entity.User;
import com.railopt.repository.UserRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Component
@Slf4j
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final UserRepository userRepository;

    public JwtAuthenticationFilter(
            @Autowired(required = false) JwtService jwtService,
            @Autowired(required = false) UserRepository userRepository
    ) {
        this.jwtService = jwtService;
        this.userRepository = userRepository;
    }

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain
    ) throws ServletException, IOException {

        if (jwtService == null || userRepository == null) {
            filterChain.doFilter(request, response);
            return;
        }

        final String authHeader = request.getHeader("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        final String jwt = authHeader.substring(7);
        try {
            final String officerId = jwtService.extractOfficerId(jwt);

            if (officerId != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                Optional<User> userOpt = userRepository.findByOfficerId(officerId);

                if (userOpt.isPresent()) {
                    User user = userOpt.get();

                    if (user.getAccountStatus() == AccountStatus.ACTIVE && jwtService.isTokenValid(jwt, user.getOfficerId())) {
                        List<SimpleGrantedAuthority> authorities = new ArrayList<>();
                        // Role authority (e.g. ROLE_ADMIN, ROLE_ENGINEERING_OFFICER)
                        authorities.add(new SimpleGrantedAuthority("ROLE_" + user.getRole()));
                        // Department authority (e.g. DEPT_ENGINEERING)
                        if (user.getDepartment() != null) {
                            authorities.add(new SimpleGrantedAuthority("DEPT_" + user.getDepartment()));
                        }

                        UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                                user,
                                null,
                                authorities
                        );
                        authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                        SecurityContextHolder.getContext().setAuthentication(authToken);
                    }
                }
            }
        } catch (Exception e) {
            log.debug("JWT authentication filter exception: {}", e.getMessage());
        }

        filterChain.doFilter(request, response);
    }
}

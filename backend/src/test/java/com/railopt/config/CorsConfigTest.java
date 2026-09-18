package com.railopt.config;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

import java.lang.reflect.Field;

import static org.assertj.core.api.Assertions.assertThat;

@DisplayName("CORS Configuration Tests")
class CorsConfigTest {

    private final CorsConfig corsConfig = new CorsConfig();

    @Test
    @DisplayName("CORS filter allows http://localhost:5173 and standard HTTP methods")
    void corsFilter_allowsConfiguredOriginsAndMethods() throws Exception {
        CorsFilter filter = corsConfig.corsFilter();
        assertThat(filter).isNotNull();

        // Extract configuration source
        Field configSourceField = CorsFilter.class.getDeclaredField("configSource");
        configSourceField.setAccessible(true);
        CorsConfigurationSource configSource = (CorsConfigurationSource) configSourceField.get(filter);

        MockHttpServletRequest request = new MockHttpServletRequest("GET", "/api/departments");
        CorsConfiguration config = configSource.getCorsConfiguration(request);

        assertThat(config).isNotNull();
        assertThat(config.getAllowedOrigins()).contains("http://localhost:5173", "http://localhost:3000");
        assertThat(config.getAllowedMethods()).contains("GET", "POST", "PUT", "DELETE", "OPTIONS");
        assertThat(config.getAllowCredentials()).isTrue();
    }
}

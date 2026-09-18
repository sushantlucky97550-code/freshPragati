package com.railopt.service.ai;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.railopt.dto.BlockPlanExplanationResponse;
import com.railopt.dto.ConflictResponse;
import com.railopt.entity.AiBlockPlan;
import com.railopt.entity.BlockPlanStatus;
import com.railopt.entity.Corridor;
import com.railopt.entity.MaintenanceTask;
import com.railopt.entity.TrainTelemetry;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDate;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class LlmExplanationServiceTest {

    @Mock
    private RestTemplate restTemplate;

    private ObjectMapper objectMapper;
    private LlmExplanationService explanationService;
    private AiBlockPlan samplePlan;

    private static final String MOCK_GEMINI_SUCCESS_JSON = """
            {
              "candidates": [
                {
                  "content": {
                    "parts": [
                      {
                        "text": "{\\"summary\\": \\"Window 01:30-04:30 was selected during night valley to optimize track possession.\\", \\"whySelected\\": [\\"Lowest coaching density\\", \\"Bundles 3 critical tasks\\"], \\"trafficImpact\\": \\"Freight trains regulated at loops with zero terminal delay.\\", \\"maintenanceImpact\\": \\"Saves 4 hours of independent block occupations.\\", \\"conflicts\\": [\\"Resolved track possession overlap via siding routing\\"], \\"confidenceExplanation\\": \\"Optimization score 89.2% validated by 12-factor engine.\\", \\"operationalNotes\\": [\\"Counter-sign TRD permit before OHE isolation\\"]}"
                      }
                    ]
                  }
                }
              ]
            }
            """;

    @BeforeEach
    void setUp() {
        objectMapper = new ObjectMapper();

        explanationService = new LlmExplanationService(
                restTemplate,
                objectMapper,
                "test-gemini-key-123",
                "gemini-3.6-flash",
                "https://generativelanguage.googleapis.com/v1beta"
        );

        Corridor corridor = Corridor.builder()
                .id(1L)
                .corridorId("NDLS-CNB")
                .name("New Delhi - Kanpur Central")
                .build();

        samplePlan = AiBlockPlan.builder()
                .id(101L)
                .planId("BLK-AI-2026-9041")
                .corridor(corridor)
                .trackLine("UP_MAIN")
                .scheduledDate(LocalDate.now().plusDays(1))
                .windowStart("01:30")
                .windowEnd("04:30")
                .durationHours(3.0)
                .optimizationScore(89.2)
                .status(BlockPlanStatus.PROPOSED)
                .departments("PWAY,TRD,ST")
                .build();
    }

    @Test
    @DisplayName("Gemini Success: Returns structured explanation with explanationSource = GEMINI")
    void generateExplanation_geminiSuccess_returnsGeminiSource() {
        ResponseEntity<String> mockResponse = new ResponseEntity<>(MOCK_GEMINI_SUCCESS_JSON, HttpStatus.OK);
        when(restTemplate.exchange(anyString(), eq(HttpMethod.POST), any(HttpEntity.class), eq(String.class)))
                .thenReturn(mockResponse);

        BlockPlanExplanationResponse resp = explanationService.generateBlockPlanExplanation(samplePlan);

        assertThat(resp).isNotNull();
        assertThat(resp.getExplanationSource()).isEqualTo("GEMINI");
        assertThat(resp.getModelUsed()).isEqualTo("gemini-3.6-flash");
        assertThat(resp.getPlanId()).isEqualTo("BLK-AI-2026-9041");
        assertThat(resp.getSummary()).contains("Window 01:30-04:30 was selected");
        assertThat(resp.getWhySelected()).hasSize(2);
        assertThat(resp.getTrafficImpact()).contains("Freight trains regulated");
        assertThat(resp.getSafetyNotice()).isEqualTo("RailOpt AI selected this block using deterministic optimization. Gemini generated the explanation.");
    }

    @Test
    @DisplayName("Missing API Key: Returns deterministic explanation without calling RestTemplate")
    void generateExplanation_missingApiKey_returnsDeterministicFallback() {
        LlmExplanationService unconfiguredService = new LlmExplanationService(
                restTemplate, objectMapper, "", "gemini-3.6-flash", "https://generativelanguage.googleapis.com/v1beta"
        );

        BlockPlanExplanationResponse resp = unconfiguredService.generateBlockPlanExplanation(samplePlan);

        assertThat(resp).isNotNull();
        assertThat(resp.getExplanationSource()).isEqualTo("DETERMINISTIC");
        assertThat(resp.getModelUsed()).isEqualTo("deterministic-rule-engine");
        assertThat(resp.getSummary()).contains("Block window 01:30 - 04:30 was selected");
        assertThat(resp.getWhySelected()).isNotEmpty();
        assertThat(resp.getSafetyNotice()).contains("deterministic optimization");
        verifyNoInteractions(restTemplate);
    }

    @Test
    @DisplayName("Gemini Timeout: ResourceAccessException triggers deterministic fallback")
    void generateExplanation_timeout_returnsDeterministicFallback() {
        when(restTemplate.exchange(anyString(), eq(HttpMethod.POST), any(HttpEntity.class), eq(String.class)))
                .thenThrow(new ResourceAccessException("Read timed out"));

        BlockPlanExplanationResponse resp = explanationService.generateBlockPlanExplanation(samplePlan);

        assertThat(resp).isNotNull();
        assertThat(resp.getExplanationSource()).isEqualTo("DETERMINISTIC");
        assertThat(resp.getModelUsed()).isEqualTo("deterministic-rule-engine");
        assertThat(resp.getSummary()).isNotEmpty();
    }

    @Test
    @DisplayName("Gemini 401 Unauthorized: Triggers deterministic fallback cleanly")
    void generateExplanation_unauthorized401_returnsDeterministicFallback() {
        when(restTemplate.exchange(anyString(), eq(HttpMethod.POST), any(HttpEntity.class), eq(String.class)))
                .thenThrow(new HttpClientErrorException(HttpStatus.UNAUTHORIZED, "Invalid API Key"));

        BlockPlanExplanationResponse resp = explanationService.generateBlockPlanExplanation(samplePlan);

        assertThat(resp).isNotNull();
        assertThat(resp.getExplanationSource()).isEqualTo("DETERMINISTIC");
        assertThat(resp.getModelUsed()).isEqualTo("deterministic-rule-engine");
    }

    @Test
    @DisplayName("Gemini 429 Rate Limit: Triggers deterministic fallback cleanly")
    void generateExplanation_rateLimit429_returnsDeterministicFallback() {
        when(restTemplate.exchange(anyString(), eq(HttpMethod.POST), any(HttpEntity.class), eq(String.class)))
                .thenThrow(new HttpClientErrorException(HttpStatus.TOO_MANY_REQUESTS, "Quota exceeded"));

        BlockPlanExplanationResponse resp = explanationService.generateBlockPlanExplanation(samplePlan);

        assertThat(resp).isNotNull();
        assertThat(resp.getExplanationSource()).isEqualTo("DETERMINISTIC");
        assertThat(resp.getModelUsed()).isEqualTo("deterministic-rule-engine");
    }

    @Test
    @DisplayName("Malformed Gemini JSON: Parser failure triggers deterministic fallback")
    void generateExplanation_malformedJson_returnsDeterministicFallback() {
        String malformedJson = "{\"candidates\": [{\"content\": {\"parts\": [{\"text\": \"THIS IS NOT VALID JSON\"}]}}]}";
        ResponseEntity<String> mockResponse = new ResponseEntity<>(malformedJson, HttpStatus.OK);
        when(restTemplate.exchange(anyString(), eq(HttpMethod.POST), any(HttpEntity.class), eq(String.class)))
                .thenReturn(mockResponse);

        BlockPlanExplanationResponse resp = explanationService.generateBlockPlanExplanation(samplePlan);

        assertThat(resp).isNotNull();
        assertThat(resp.getExplanationSource()).isEqualTo("DETERMINISTIC");
        assertThat(resp.getModelUsed()).isEqualTo("deterministic-rule-engine");
    }

    @Test
    @DisplayName("SAFETY INVARIANT: AiBlockPlan entity is never modified by explanation service")
    void generateExplanation_preservesAiBlockPlanImmutability() {
        ResponseEntity<String> mockResponse = new ResponseEntity<>(MOCK_GEMINI_SUCCESS_JSON, HttpStatus.OK);
        when(restTemplate.exchange(anyString(), eq(HttpMethod.POST), any(HttpEntity.class), eq(String.class)))
                .thenReturn(mockResponse);

        String originalPlanId = samplePlan.getPlanId();
        BlockPlanStatus originalStatus = samplePlan.getStatus();
        Double originalScore = samplePlan.getOptimizationScore();
        String originalWindow = samplePlan.getWindowStart();

        explanationService.generateBlockPlanExplanation(samplePlan);

        assertThat(samplePlan.getPlanId()).isEqualTo(originalPlanId);
        assertThat(samplePlan.getStatus()).isEqualTo(originalStatus);
        assertThat(samplePlan.getOptimizationScore()).isEqualTo(originalScore);
        assertThat(samplePlan.getWindowStart()).isEqualTo(originalWindow);
    }

    @Test
    @DisplayName("Null Plan: Gracefully returns safe fallback without throwing NPE")
    void generateExplanation_nullPlan_returnsEmptyFallback() {
        BlockPlanExplanationResponse resp = explanationService.generateBlockPlanExplanation(null);

        assertThat(resp).isNotNull();
        assertThat(resp.getExplanationSource()).isEqualTo("DETERMINISTIC");
        assertThat(resp.getSummary()).contains("No valid block plan");
    }
}

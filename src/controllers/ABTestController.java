package com.wellsfargo.abtest.controller;

import com.wellsfargo.abtest.dto.*;
import com.wellsfargo.abtest.service.ABTestService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/v1/ab-tests")
@RequiredArgsConstructor
@Tag(name = "A/B Testing", description = "Complete A/B Testing APIs with Analytics")
public class ABTestController {

    private final ABTestService abTestService;

    @PostMapping
    @Operation(summary = "Create a new A/B test")
    public ResponseEntity<ABTestResponse> createABTest(
            @Valid @RequestBody ABTestRequest request,
            @AuthenticationPrincipal Jwt jwt) {

        log.info("Creating A/B test: {}", request.getName());

        String userId = jwt != null ? jwt.getSubject() : "system";
        ABTestResponse response = abTestService.createABTest(request, userId);

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/{testId}/start")
    @Operation(summary = "Start an A/B test")
    public ResponseEntity<ABTestResponse> startABTest(
            @PathVariable String testId) {

        log.info("Starting A/B test: {}", testId);

        ABTestResponse response = abTestService.startABTest(testId);

        return ResponseEntity.ok(response);
    }

    @PostMapping("/{testId}/stop")
    @Operation(summary = "Stop a running A/B test")
    public ResponseEntity<ABTestResponse> stopABTest(
            @PathVariable String testId) {

        log.info("Stopping A/B test: {}", testId);

        ABTestResponse response = abTestService.stopABTest(testId);

        return ResponseEntity.ok(response);
    }

    @PostMapping("/{testId}/execute")
    @Operation(summary = "Execute a single A/B test request")
    public ResponseEntity<ExecutionResultResponse> executeABTest(
            @PathVariable String testId,
            @Valid @RequestBody ExecuteABTestRequest request) {

        log.info("Executing A/B test: {}", testId);

        String selectedArmId = abTestService.executeABTest(testId, request);

        ExecutionResultResponse result = ExecutionResultResponse.builder()
            .testId(testId)
            .selectedArmId(selectedArmId)
            .status("SUCCESS")
            .build();

        return ResponseEntity.ok(result);
    }

    @GetMapping
    @Operation(summary = "List all A/B tests")
    public ResponseEntity<List<ABTestResponse>> listABTests() {

        log.info("Listing all A/B tests");

        List<ABTestResponse> tests = abTestService.listABTests();

        return ResponseEntity.ok(tests);
    }

    @GetMapping("/{testId}")
    @Operation(summary = "Get A/B test details with metrics")
    public ResponseEntity<ABTestResponse> getABTest(
            @PathVariable String testId) {

        log.info("Fetching A/B test: {}", testId);

        ABTestResponse response = abTestService.getABTest(testId);

        return ResponseEntity.ok(response);
    }

    @GetMapping("/{testId}/analytics")
    @Operation(summary = "Get complete analytics data for A/B test")
    public ResponseEntity<ABTestAnalyticsResponse> getAnalytics(
            @PathVariable String testId) {

        log.info("Fetching analytics for A/B test: {}", testId);

        ABTestAnalyticsResponse analytics = abTestService.getAnalytics(testId);

        return ResponseEntity.ok(analytics);
    }

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<ErrorResponse> handleRuntimeException(RuntimeException ex) {
        log.error("Runtime exception occurred", ex);

        ErrorResponse error = ErrorResponse.builder()
            .message(ex.getMessage())
            .error("ABTEST_ERROR")
            .build();

        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ErrorResponse> handleIllegalArgumentException(IllegalArgumentException ex) {
        log.error("Validation error occurred", ex);

        ErrorResponse error = ErrorResponse.builder()
            .message(ex.getMessage())
            .error("VALIDATION_ERROR")
            .build();

        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
    }

    @ExceptionHandler(IllegalStateException.class)
    public ResponseEntity<ErrorResponse> handleIllegalStateException(IllegalStateException ex) {
        log.error("State error occurred", ex);

        ErrorResponse error = ErrorResponse.builder()
            .message(ex.getMessage())
            .error("STATE_ERROR")
            .build();

        return ResponseEntity.status(HttpStatus.CONFLICT).body(error);
    }
}

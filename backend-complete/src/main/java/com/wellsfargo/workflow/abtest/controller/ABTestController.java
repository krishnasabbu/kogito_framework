package com.wellsfargo.workflow.abtest.controller;

import com.wellsfargo.workflow.abtest.dto.*;
import com.wellsfargo.workflow.abtest.service.ABTestService;
import com.wellsfargo.workflow.common.dto.ErrorResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/ab-tests")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000"})
public class ABTestController {

    private final ABTestService abTestService;

    @PostMapping
    public ResponseEntity<ABTestResponse> createABTest(@Valid @RequestBody ABTestRequest request) {
        log.info("Creating A/B test: {}", request.getName());
        ABTestResponse response = abTestService.createABTest(request, "system");
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/{testId}/start")
    public ResponseEntity<ABTestResponse> startABTest(@PathVariable String testId) {
        log.info("Starting A/B test: {}", testId);
        return ResponseEntity.ok(abTestService.startABTest(testId));
    }

    @PostMapping("/{testId}/stop")
    public ResponseEntity<ABTestResponse> stopABTest(@PathVariable String testId) {
        log.info("Stopping A/B test: {}", testId);
        return ResponseEntity.ok(abTestService.stopABTest(testId));
    }

    @PostMapping("/{testId}/execute")
    public ResponseEntity<ExecutionResultResponse> executeABTest(
            @PathVariable String testId,
            @Valid @RequestBody ExecuteABTestRequest request) {
        log.info("Executing A/B test: {}", testId);
        return ResponseEntity.ok(abTestService.executeABTest(testId, request));
    }

    @GetMapping
    public ResponseEntity<List<ABTestResponse>> listABTests() {
        log.info("Listing all A/B tests");
        return ResponseEntity.ok(abTestService.listABTests());
    }

    @GetMapping("/{testId}")
    public ResponseEntity<ABTestResponse> getABTest(@PathVariable String testId) {
        log.info("Fetching A/B test: {}", testId);
        return ResponseEntity.ok(abTestService.getABTest(testId));
    }

    @GetMapping("/{testId}/analytics")
    public ResponseEntity<ABTestAnalyticsResponse> getAnalytics(@PathVariable String testId) {
        log.info("Fetching analytics for A/B test: {}", testId);
        return ResponseEntity.ok(abTestService.getAnalytics(testId));
    }

    @GetMapping("/{testId}/logs")
    public ResponseEntity<List<ExecutionResultResponse>> getExecutionLogs(
            @PathVariable String testId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "100") int size) {
        log.info("Fetching execution logs for A/B test: {}, page: {}, size: {}", testId, page, size);
        return ResponseEntity.ok(abTestService.getExecutionLogs(testId, page, size));
    }

    @GetMapping("/{testId}/comprehensive-metrics")
    public ResponseEntity<ABTestAnalyticsResponse> getComprehensiveMetrics(@PathVariable String testId) {
        log.info("Fetching comprehensive metrics for A/B test: {}", testId);
        return ResponseEntity.ok(abTestService.calculateComprehensiveMetrics(testId));
    }

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<ErrorResponse> handleRuntimeException(RuntimeException ex) {
        log.error("Runtime exception", ex);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ErrorResponse.builder()
                        .message(ex.getMessage())
                        .error("ABTEST_ERROR")
                        .build());
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ErrorResponse> handleIllegalArgumentException(IllegalArgumentException ex) {
        log.error("Validation error", ex);
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(ErrorResponse.builder()
                        .message(ex.getMessage())
                        .error("VALIDATION_ERROR")
                        .build());
    }
}

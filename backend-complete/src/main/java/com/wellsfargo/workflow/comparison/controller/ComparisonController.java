package com.wellsfargo.workflow.comparison.controller;

import com.wellsfargo.workflow.common.dto.ErrorResponse;
import com.wellsfargo.workflow.comparison.dto.AggregateMetricsResponse;
import com.wellsfargo.workflow.comparison.dto.ComparisonRequest;
import com.wellsfargo.workflow.comparison.dto.ComparisonResponse;
import com.wellsfargo.workflow.comparison.service.ComparisonService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/comparisons")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000"})
public class ComparisonController {

    private final ComparisonService comparisonService;

    @PostMapping
    public ResponseEntity<ComparisonResponse> createComparison(@RequestBody ComparisonRequest request) {
        log.info("Creating comparison: {}", request.getName());
        ComparisonResponse response = comparisonService.createComparison(request, "system");
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    public ResponseEntity<List<ComparisonResponse>> listComparisons() {
        log.info("Listing all comparisons");
        return ResponseEntity.ok(comparisonService.listComparisons());
    }

    @GetMapping("/{comparisonId}")
    public ResponseEntity<ComparisonResponse> getComparison(@PathVariable String comparisonId) {
        log.info("Getting comparison: {}", comparisonId);
        return ResponseEntity.ok(comparisonService.getComparison(comparisonId));
    }

    @PostMapping("/{comparisonId}/executions")
    public ResponseEntity<Void> addExecution(
            @PathVariable String comparisonId,
            @RequestBody Map<String, String> request) {
        log.info("Adding execution to comparison: {}", comparisonId);
        String executionId = request.get("executionId");
        comparisonService.addExecutionToComparison(comparisonId, executionId);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{comparisonId}/executions/{executionId}")
    public ResponseEntity<Void> removeExecution(
            @PathVariable String comparisonId,
            @PathVariable String executionId) {
        log.info("Removing execution {} from comparison {}", executionId, comparisonId);
        comparisonService.removeExecutionFromComparison(comparisonId, executionId);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{comparisonId}/aggregate-metrics")
    public ResponseEntity<AggregateMetricsResponse> getAggregateMetrics(@PathVariable String comparisonId) {
        log.info("Calculating aggregate metrics for comparison: {}", comparisonId);
        return ResponseEntity.ok(comparisonService.calculateAggregateMetrics(comparisonId));
    }

    @DeleteMapping("/{comparisonId}")
    public ResponseEntity<Void> deleteComparison(@PathVariable String comparisonId) {
        log.info("Deleting comparison: {}", comparisonId);
        comparisonService.deleteComparison(comparisonId);
        return ResponseEntity.ok().build();
    }

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<ErrorResponse> handleRuntimeException(RuntimeException ex) {
        log.error("Runtime exception", ex);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ErrorResponse.builder()
                        .message(ex.getMessage())
                        .error("COMPARISON_ERROR")
                        .build());
    }
}

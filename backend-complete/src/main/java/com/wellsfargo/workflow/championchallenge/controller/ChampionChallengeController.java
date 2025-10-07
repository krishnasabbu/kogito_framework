package com.wellsfargo.workflow.championchallenge.controller;

import com.wellsfargo.workflow.championchallenge.dto.*;
import com.wellsfargo.workflow.championchallenge.service.ChampionChallengeService;
import com.wellsfargo.workflow.common.dto.ErrorResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/champion-challenge")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000"})
public class ChampionChallengeController {

    private final ChampionChallengeService championChallengeService;

    // ========== COMPARISON ENDPOINTS (MASTER) ==========

    @PostMapping("/comparisons")
    public ResponseEntity<ComparisonResponse> createComparison(@Valid @RequestBody ComparisonRequest request) {
        log.info("Creating comparison: {}", request.getName());
        ComparisonResponse response = championChallengeService.createComparison(request, "system");
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/comparisons")
    public ResponseEntity<List<ComparisonResponse>> listComparisons() {
        log.info("Listing all comparisons");
        return ResponseEntity.ok(championChallengeService.listComparisons());
    }

    @GetMapping("/comparisons/{id}")
    public ResponseEntity<ComparisonResponse> getComparison(@PathVariable UUID id) {
        log.info("Fetching comparison: {}", id);
        return ResponseEntity.ok(championChallengeService.getComparison(id));
    }

    @DeleteMapping("/comparisons/{id}")
    public ResponseEntity<Void> deleteComparison(@PathVariable UUID id) {
        log.info("Deleting comparison: {}", id);
        championChallengeService.deleteComparison(id);
        return ResponseEntity.noContent().build();
    }

    // ========== EXECUTION ENDPOINTS (DETAIL) ==========

    @PostMapping("/comparisons/{id}/execute")
    public ResponseEntity<ExecutionResponse> executeComparison(
            @PathVariable UUID id,
            @RequestBody Map<String, Object> payload) {
        log.info("Executing comparison: {}", id);
        String requestPayload = payload.toString(); // Convert to JSON string in production
        ExecutionResponse response = championChallengeService.executeComparison(id, requestPayload, "system");
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/comparisons/{id}/executions")
    public ResponseEntity<List<ExecutionResponse>> listExecutions(@PathVariable UUID id) {
        log.info("Listing executions for comparison: {}", id);
        return ResponseEntity.ok(championChallengeService.listExecutions(id));
    }

    @GetMapping("/executions/{executionId}")
    public ResponseEntity<ExecutionResponse> getExecution(@PathVariable String executionId) {
        log.info("Fetching execution: {}", executionId);
        return ResponseEntity.ok(championChallengeService.getExecution(executionId));
    }

    // ========== EXCEPTION HANDLERS ==========

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<ErrorResponse> handleRuntimeException(RuntimeException ex) {
        log.error("Runtime exception", ex);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ErrorResponse.builder()
                        .message(ex.getMessage())
                        .error("CC_ERROR")
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

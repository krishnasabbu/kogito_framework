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

@RestController
@RequestMapping("/api/v2/champion-challenge/executions")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000"})
public class ChampionChallengeController {

    private final ChampionChallengeService championChallengeService;

    @PostMapping
    public ResponseEntity<ExecutionResponse> createExecution(@Valid @RequestBody ExecutionRequest request) {
        log.info("Creating champion/challenge execution: {}", request.getName());
        ExecutionResponse response = championChallengeService.createExecution(request, "system");
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    public ResponseEntity<List<ExecutionResponse>> listExecutions() {
        log.info("Listing all executions");
        return ResponseEntity.ok(championChallengeService.listExecutions());
    }

    @GetMapping("/{executionId}")
    public ResponseEntity<ExecutionResponse> getExecution(@PathVariable String executionId) {
        log.info("Fetching execution: {}", executionId);
        return ResponseEntity.ok(championChallengeService.getExecution(executionId));
    }

    @GetMapping("/{executionId}/analytics")
    public ResponseEntity<AnalyticsResponse> getAnalytics(@PathVariable String executionId) {
        log.info("Fetching analytics for execution: {}", executionId);
        return ResponseEntity.ok(championChallengeService.getAnalytics(executionId));
    }

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

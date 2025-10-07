package com.wellsfargo.championchallenge.controller;

import com.wellsfargo.championchallenge.dto.*;
import com.wellsfargo.championchallenge.service.ChampionChallengeServiceImpl;
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
@RequestMapping("/api/v2/champion-challenge")
@RequiredArgsConstructor
@Tag(name = "Champion vs Challenge V2", description = "Complete Champion vs Challenge APIs with Analytics")
public class ChampionChallengeControllerV2 {

    private final ChampionChallengeServiceImpl championChallengeService;

    @PostMapping("/executions")
    @Operation(summary = "Create and execute champion vs challenge comparison")
    public ResponseEntity<ExecutionResponse> createExecution(
            @Valid @RequestBody ExecutionRequest request,
            @AuthenticationPrincipal Jwt jwt) {

        log.info("Creating champion vs challenge execution: {}", request.getName());

        String userId = jwt != null ? jwt.getSubject() : "system";
        ExecutionResponse response = championChallengeService.createExecution(request, userId);

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/executions")
    @Operation(summary = "List all executions")
    public ResponseEntity<List<ExecutionResponse>> listExecutions() {
        log.info("Listing all executions");

        List<ExecutionResponse> executions = championChallengeService.listExecutions();

        return ResponseEntity.ok(executions);
    }

    @GetMapping("/executions/user/{userId}")
    @Operation(summary = "List executions by user")
    public ResponseEntity<List<ExecutionResponse>> listExecutionsByUser(
            @PathVariable String userId) {

        log.info("Listing executions for user: {}", userId);

        List<ExecutionResponse> executions = championChallengeService.listExecutionsByUser(userId);

        return ResponseEntity.ok(executions);
    }

    @GetMapping("/executions/{executionId}")
    @Operation(summary = "Get detailed execution with all metrics")
    public ResponseEntity<ExecutionResponse> getExecution(
            @PathVariable String executionId) {

        log.info("Fetching execution: {}", executionId);

        ExecutionResponse execution = championChallengeService.getExecution(executionId);

        return ResponseEntity.ok(execution);
    }

    @GetMapping("/executions/{executionId}/analytics")
    @Operation(summary = "Get complete analytics data for charts")
    public ResponseEntity<AnalyticsResponse> getAnalytics(
            @PathVariable String executionId) {

        log.info("Fetching analytics for execution: {}", executionId);

        AnalyticsResponse analytics = championChallengeService.getAnalytics(executionId);

        return ResponseEntity.ok(analytics);
    }

    @PutMapping("/executions/{executionId}/status")
    @Operation(summary = "Update execution status")
    public ResponseEntity<Void> updateStatus(
            @PathVariable String executionId,
            @RequestParam String status) {

        log.info("Updating status for execution: {} to: {}", executionId, status);

        championChallengeService.updateExecutionStatus(
            executionId,
            com.wellsfargo.championchallenge.entity.ChampionChallengeExecutionEntity.ExecutionStatus.valueOf(status)
        );

        return ResponseEntity.ok().build();
    }

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<ErrorResponse> handleRuntimeException(RuntimeException ex) {
        log.error("Runtime exception occurred", ex);

        ErrorResponse error = ErrorResponse.builder()
            .message(ex.getMessage())
            .error("EXECUTION_ERROR")
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
}

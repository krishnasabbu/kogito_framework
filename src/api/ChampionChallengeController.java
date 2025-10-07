package com.wellsfargo.orchestrator.controller;

import com.wellsfargo.orchestrator.dto.*;
import com.wellsfargo.orchestrator.service.ChampionChallengeService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.util.List;
import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/api/v1/champion-challenge")
@RequiredArgsConstructor
@Validated
@Tag(name = "Champion vs Challenge", description = "APIs for BPMN workflow comparison and analysis")
public class ChampionChallengeController {

    private final ChampionChallengeService championChallengeService;

    @PostMapping("/executions")
    @Operation(summary = "Create and execute champion vs challenge comparison")
    public ResponseEntity<ExecutionResponseDTO> createExecution(
            @Valid @RequestBody ExecutionRequestDTO request,
            @AuthenticationPrincipal Jwt jwt) {

        log.info("Creating champion vs challenge execution: {}", request.getName());

        String userId = jwt.getSubject();
        ExecutionResponseDTO response = championChallengeService.createAndExecute(request, userId);

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/executions")
    @Operation(summary = "List all executions with pagination and filtering")
    public ResponseEntity<Page<ExecutionSummaryDTO>> listExecutions(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String searchTerm,
            Pageable pageable,
            @AuthenticationPrincipal Jwt jwt) {

        log.info("Listing executions - status: {}, search: {}", status, searchTerm);

        Page<ExecutionSummaryDTO> executions = championChallengeService.listExecutions(
                status, searchTerm, pageable);

        return ResponseEntity.ok(executions);
    }

    @GetMapping("/executions/{executionId}")
    @Operation(summary = "Get detailed execution results")
    public ResponseEntity<ExecutionDetailDTO> getExecutionDetails(
            @PathVariable UUID executionId,
            @AuthenticationPrincipal Jwt jwt) {

        log.info("Fetching execution details for: {}", executionId);

        ExecutionDetailDTO details = championChallengeService.getExecutionDetails(executionId);

        return ResponseEntity.ok(details);
    }

    @GetMapping("/executions/{executionId}/metrics")
    @Operation(summary = "Get all node metrics for an execution")
    public ResponseEntity<NodeMetricsResponseDTO> getNodeMetrics(
            @PathVariable UUID executionId,
            @RequestParam(required = false) String variant,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String nodeType,
            @AuthenticationPrincipal Jwt jwt) {

        log.info("Fetching metrics for execution: {} with filters - variant: {}, status: {}, nodeType: {}",
                executionId, variant, status, nodeType);

        NodeMetricsResponseDTO metrics = championChallengeService.getNodeMetrics(
                executionId, variant, status, nodeType);

        return ResponseEntity.ok(metrics);
    }

    @GetMapping("/executions/{executionId}/comparison")
    @Operation(summary = "Get comparison summary between champion and challenge")
    public ResponseEntity<ComparisonSummaryDTO> getComparisonSummary(
            @PathVariable UUID executionId,
            @AuthenticationPrincipal Jwt jwt) {

        log.info("Fetching comparison summary for: {}", executionId);

        ComparisonSummaryDTO summary = championChallengeService.getComparisonSummary(executionId);

        return ResponseEntity.ok(summary);
    }

    @PostMapping("/executions/{executionId}/filters")
    @Operation(summary = "Save filter configuration")
    public ResponseEntity<FilterConfigDTO> saveFilter(
            @PathVariable UUID executionId,
            @Valid @RequestBody FilterConfigDTO filterConfig,
            @AuthenticationPrincipal Jwt jwt) {

        log.info("Saving filter configuration for execution: {}", executionId);

        String userId = jwt.getSubject();
        FilterConfigDTO saved = championChallengeService.saveFilter(executionId, filterConfig, userId);

        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @GetMapping("/executions/{executionId}/filters")
    @Operation(summary = "Get saved filters for an execution")
    public ResponseEntity<List<FilterConfigDTO>> getFilters(
            @PathVariable UUID executionId,
            @AuthenticationPrincipal Jwt jwt) {

        log.info("Fetching filters for execution: {}", executionId);

        List<FilterConfigDTO> filters = championChallengeService.getFilters(executionId);

        return ResponseEntity.ok(filters);
    }

    @PostMapping("/executions/{executionId}/filters/{filterId}/apply")
    @Operation(summary = "Apply saved filter and get filtered results")
    public ResponseEntity<NodeMetricsResponseDTO> applyFilter(
            @PathVariable UUID executionId,
            @PathVariable UUID filterId,
            @AuthenticationPrincipal Jwt jwt) {

        log.info("Applying filter {} to execution: {}", filterId, executionId);

        NodeMetricsResponseDTO filtered = championChallengeService.applyFilter(executionId, filterId);

        return ResponseEntity.ok(filtered);
    }

    @DeleteMapping("/executions/{executionId}")
    @Operation(summary = "Delete an execution and all related data")
    public ResponseEntity<Void> deleteExecution(
            @PathVariable UUID executionId,
            @AuthenticationPrincipal Jwt jwt) {

        log.info("Deleting execution: {}", executionId);

        String userId = jwt.getSubject();
        championChallengeService.deleteExecution(executionId, userId);

        return ResponseEntity.noContent().build();
    }

    @GetMapping("/workflows")
    @Operation(summary = "List available BPMN workflows")
    public ResponseEntity<List<WorkflowInfoDTO>> listWorkflows(
            @AuthenticationPrincipal Jwt jwt) {

        log.info("Listing available workflows");

        List<WorkflowInfoDTO> workflows = championChallengeService.listAvailableWorkflows();

        return ResponseEntity.ok(workflows);
    }

    @GetMapping("/executions/{executionId}/export")
    @Operation(summary = "Export execution results as JSON")
    public ResponseEntity<ExecutionExportDTO> exportExecution(
            @PathVariable UUID executionId,
            @AuthenticationPrincipal Jwt jwt) {

        log.info("Exporting execution: {}", executionId);

        ExecutionExportDTO export = championChallengeService.exportExecution(executionId);

        return ResponseEntity.ok(export);
    }

    @PostMapping("/executions/{executionId}/retry")
    @Operation(summary = "Retry a failed execution")
    public ResponseEntity<ExecutionResponseDTO> retryExecution(
            @PathVariable UUID executionId,
            @AuthenticationPrincipal Jwt jwt) {

        log.info("Retrying execution: {}", executionId);

        String userId = jwt.getSubject();
        ExecutionResponseDTO response = championChallengeService.retryExecution(executionId, userId);

        return ResponseEntity.ok(response);
    }
}

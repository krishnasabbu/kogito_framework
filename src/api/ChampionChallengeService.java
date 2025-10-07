package com.wellsfargo.orchestrator.service;

import com.wellsfargo.orchestrator.dto.*;
import com.wellsfargo.orchestrator.entity.*;
import com.wellsfargo.orchestrator.repository.*;
import com.wellsfargo.orchestrator.exception.*;
import com.wellsfargo.orchestrator.bpmn.BpmnExecutionEngine;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.*;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class ChampionChallengeService {

    private final ChampionChallengeExecutionRepository executionRepository;
             
    private final ExecutorService executorService = Executors.newFixedThreadPool(10);

    @Transactional
    public ExecutionResponseDTO createAndExecute(ExecutionRequestDTO request, String userId) {
        log.info("Creating execution: {} by user: {}", request.getName(), userId);

        ChampionChallengeExecution execution = ChampionChallengeExecution.builder()
                .name(request.getName())
                .description(request.getDescription())
                .championWorkflowId(request.getChampionWorkflowId())
                .challengeWorkflowId(request.getChallengeWorkflowId())
                .requestPayload(request.getRequestPayload())
                .status("PENDING")
                .createdBy(UUID.fromString(userId))
                .build();

        execution = executionRepository.save(execution);

        final UUID executionId = execution.getId();

        CompletableFuture.runAsync(() -> executeWorkflows(executionId), executorService)
                .exceptionally(throwable -> {
                    log.error("Execution failed for: {}", executionId, throwable);
                    updateExecutionStatus(executionId, "FAILED");
                    return null;
                });

        return mapToResponseDTO(execution);
    }

    private void executeWorkflows(UUID executionId) {
        log.info("Starting execution: {}", executionId);

        ChampionChallengeExecution execution = executionRepository.findById(executionId)
                .orElseThrow(() -> new ResourceNotFoundException("Execution not found: " + executionId));

        execution.setStatus("RUNNING");
        execution.setStartedAt(Instant.now());
        executionRepository.save(execution);

        try {
            CompletableFuture<List<NodeMetric>> championFuture = CompletableFuture.supplyAsync(() ->
                    executeWorkflow(executionId, execution.getChampionWorkflowId(),
                            execution.getRequestPayload(), "CHAMPION"), executorService);

            CompletableFuture<List<NodeMetric>> challengeFuture = CompletableFuture.supplyAsync(() ->
                    executeWorkflow(executionId, execution.getChallengeWorkflowId(),
                            execution.getRequestPayload(), "CHALLENGE"), executorService);

            CompletableFuture.allOf(championFuture, challengeFuture).join();

            List<NodeMetric> championMetrics = championFuture.get();
            List<NodeMetric> challengeMetrics = challengeFuture.get();

            saveMetrics(executionId, championMetrics);
            saveMetrics(executionId, challengeMetrics);

            calculateAndSaveComparisons(executionId, championMetrics, challengeMetrics);

            execution.setStatus("COMPLETED");
            execution.setCompletedAt(Instant.now());
            execution.setTotalChampionTimeMs(championMetrics.stream()
                    .mapToInt(NodeMetric::getExecutionTimeMs).sum());
            execution.setTotalChallengeTimeMs(challengeMetrics.stream()
                    .mapToInt(NodeMetric::getExecutionTimeMs).sum());

            if (execution.getTotalChampionTimeMs() < execution.getTotalChallengeTimeMs()) {
                execution.setWinner("CHAMPION");
            } else if (execution.getTotalChallengeTimeMs() < execution.getTotalChampionTimeMs()) {
                execution.setWinner("CHALLENGE");
            } else {
                execution.setWinner("TIE");
            }

            executionRepository.save(execution);

            log.info("Execution completed: {} - Winner: {}", executionId, execution.getWinner());

        } catch (Exception e) {
            log.error("Execution failed: {}", executionId, e);
            execution.setStatus("FAILED");
            execution.setCompletedAt(Instant.now());
            executionRepository.save(execution);
            throw new ExecutionException("Workflow execution failed", e);
        }
    }

    private List<NodeMetric> executeWorkflow(UUID executionId, String workflowId,
                                             Map<String, Object> payload, String variant) {
        log.info("Executing {} workflow: {} for execution: {}", variant, workflowId, executionId);

        return bpmnEngine.executeWorkflow(workflowId, payload, variant);
    }

    @Transactional
    protected void saveMetrics(UUID executionId, List<NodeMetric> metrics) {
        List<ExecutionNodeMetricsEntity> entities = metrics.stream()
                .map(metric -> ExecutionNodeMetricsEntity.builder()
                        .executionId(executionId)
                        .variant(metric.getVariant())
                        .nodeId(metric.getNodeId())
                        .nodeName(metric.getNodeName())
                        .nodeType(metric.getNodeType())
                        .sequence(metric.getSequence())
                        .requestData(metric.getRequestData())
                        .responseData(metric.getResponseData())
                        .executionTimeMs(metric.getExecutionTimeMs())
                        .status(metric.getStatus())
                        .errorMessage(metric.getErrorMessage())
                        .errorStack(metric.getErrorStack())
                        .startedAt(metric.getStartedAt())
                        .completedAt(metric.getCompletedAt())
                        .memoryUsedMb(metric.getMemoryUsedMb())
                        .cpuUsagePercent(metric.getCpuUsagePercent())
                        .metadata(metric.getMetadata())
                        .build())
                .collect(Collectors.toList());

        metricsRepository.saveAll(entities);
        log.info("Saved {} metrics for execution: {}", entities.size(), executionId);
    }

    @Transactional
    protected void calculateAndSaveComparisons(UUID executionId,
                                               List<NodeMetric> championMetrics,
                                               List<NodeMetric> challengeMetrics) {
        List<ExecutionComparison> comparisons = new ArrayList<>();

        int championTotalTime = championMetrics.stream().mapToInt(NodeMetric::getExecutionTimeMs).sum();
        int challengeTotalTime = challengeMetrics.stream().mapToInt(NodeMetric::getExecutionTimeMs).sum();

        comparisons.add(createComparison(executionId, "Total Execution Time", "PERFORMANCE",
                championTotalTime, challengeTotalTime, "ms"));

        double championAvgTime = championMetrics.isEmpty() ? 0 :
                championTotalTime / (double) championMetrics.size();
        double challengeAvgTime = challengeMetrics.isEmpty() ? 0 :
                challengeTotalTime / (double) challengeMetrics.size();

        comparisons.add(createComparison(executionId, "Average Node Time", "PERFORMANCE",
                championAvgTime, challengeAvgTime, "ms"));

        long championSuccessCount = championMetrics.stream()
                .filter(m -> "SUCCESS".equals(m.getStatus())).count();
        long challengeSuccessCount = challengeMetrics.stream()
                .filter(m -> "SUCCESS".equals(m.getStatus())).count();

        double championSuccessRate = championMetrics.isEmpty() ? 0 :
                (championSuccessCount / (double) championMetrics.size()) * 100;
        double challengeSuccessRate = challengeMetrics.isEmpty() ? 0 :
                (challengeSuccessCount / (double) challengeMetrics.size()) * 100;

        comparisons.add(createComparison(executionId, "Success Rate", "QUALITY",
                championSuccessRate, challengeSuccessRate, "%"));

        long championErrorCount = championMetrics.stream()
                .filter(m -> "ERROR".equals(m.getStatus())).count();
        long challengeErrorCount = challengeMetrics.stream()
                .filter(m -> "ERROR".equals(m.getStatus())).count();

        comparisons.add(createComparison(executionId, "Error Count", "QUALITY",
                championErrorCount, challengeErrorCount, "count"));

        comparisonsRepository.saveAll(comparisons);
        log.info("Saved {} comparisons for execution: {}", comparisons.size(), executionId);
    }

    private ExecutionComparison createComparison(UUID executionId, String metricName,
                                                 String category, double championValue,
                                                 double challengeValue, String unit) {
        double difference = challengeValue - championValue;
        double differencePercentage = championValue == 0 ? 0 :
                (difference / championValue) * 100;

        String winner;
        if (category.equals("QUALITY") || metricName.contains("Success")) {
            winner = championValue > challengeValue ? "CHAMPION" :
                    challengeValue > championValue ? "CHALLENGE" : "TIE";
        } else {
            winner = championValue < challengeValue ? "CHAMPION" :
                    challengeValue < championValue ? "CHALLENGE" : "TIE";
        }

        return ExecutionComparison.builder()
                .executionId(executionId)
                .metricName(metricName)
                .metricCategory(category)
                .championValue(championValue)
                .challengeValue(challengeValue)
                .difference(difference)
                .differencePercentage(differencePercentage)
                .winner(winner)
                .unit(unit)
                .build();
    }

    @Transactional(readOnly = true)
    public Page<ExecutionSummaryDTO> listExecutions(String status, String searchTerm, Pageable pageable) {
        Page<ChampionChallengeExecution> executions;

        if (status != null && searchTerm != null) {
            executions = executionRepository.findByStatusAndNameContainingIgnoreCase(
                    status, searchTerm, pageable);
        } else if (status != null) {
            executions = executionRepository.findByStatus(status, pageable);
        } else if (searchTerm != null) {
            executions = executionRepository.findByNameContainingIgnoreCase(searchTerm, pageable);
        } else {
            executions = executionRepository.findAll(pageable);
        }

        return executions.map(this::mapToSummaryDTO);
    }

    @Transactional(readOnly = true)
    public ExecutionDetailDTO getExecutionDetails(UUID executionId) {
        ChampionChallengeExecution execution = executionRepository.findById(executionId)
                .orElseThrow(() -> new ResourceNotFoundException("Execution not found: " + executionId));

        return mapToDetailDTO(execution);
    }

    @Transactional(readOnly = true)
    public NodeMetricsResponseDTO getNodeMetrics(UUID executionId, String variant,
                                                  String status, String nodeType) {
        List<ExecutionNodeMetricsEntity> metrics = metricsRepository
                .findByExecutionIdOrderBySequenceAsc(executionId);

        if (variant != null) {
            metrics = metrics.stream()
                    .filter(m -> variant.equals(m.getVariant()))
                    .collect(Collectors.toList());
        }
        if (status != null) {
            metrics = metrics.stream()
                    .filter(m -> status.equals(m.getStatus()))
                    .collect(Collectors.toList());
        }
        if (nodeType != null) {
            metrics = metrics.stream()
                    .filter(m -> nodeType.equals(m.getNodeType()))
                    .collect(Collectors.toList());
        }

        Map<String, List<NodeMetricDTO>> groupedMetrics = metrics.stream()
                .map(this::mapToNodeMetricDTO)
                .collect(Collectors.groupingBy(NodeMetricDTO::getVariant));

        return NodeMetricsResponseDTO.builder()
                .executionId(executionId)
                .championMetrics(groupedMetrics.getOrDefault("CHAMPION", Collections.emptyList()))
                .challengeMetrics(groupedMetrics.getOrDefault("CHALLENGE", Collections.emptyList()))
                .build();
    }

    @Transactional(readOnly = true)
    public ComparisonSummaryDTO getComparisonSummary(UUID executionId) {
        List<ExecutionComparison> comparisons = comparisonsRepository.findByExecutionId(executionId);

        return ComparisonSummaryDTO.builder()
                .executionId(executionId)
                .comparisons(comparisons.stream()
                        .map(this::mapToComparisonDTO)
                        .collect(Collectors.toList()))
                .build();
    }

    @Transactional
    public FilterConfigDTO saveFilter(UUID executionId, FilterConfigDTO filterConfig, String userId) {
        ExecutionFilter filter = ExecutionFilter.builder()
                .executionId(executionId)
                .name(filterConfig.getName())
                .filterConfig(filterConfig.getConfig())
                .createdBy(UUID.fromString(userId))
                .build();

        filter = filtersRepository.save(filter);

        return mapToFilterDTO(filter);
    }

    @Transactional(readOnly = true)
    public List<FilterConfigDTO> getFilters(UUID executionId) {
        return filtersRepository.findByExecutionId(executionId).stream()
                .map(this::mapToFilterDTO)
                .collect(Collectors.toList());
    }

    public NodeMetricsResponseDTO applyFilter(UUID executionId, UUID filterId) {
        ExecutionFilter filter = filtersRepository.findById(filterId)
                .orElseThrow(() -> new ResourceNotFoundException("Filter not found: " + filterId));

        return getNodeMetrics(executionId, null, null, null);
    }

    @Transactional
    public void deleteExecution(UUID executionId, String userId) {
        ChampionChallengeExecution execution = executionRepository.findById(executionId)
                .orElseThrow(() -> new ResourceNotFoundException("Execution not found: " + executionId));

        if (!execution.getCreatedBy().toString().equals(userId)) {
            throw new UnauthorizedException("Not authorized to delete this execution");
        }

        executionRepository.delete(execution);
        log.info("Deleted execution: {} by user: {}", executionId, userId);
    }

    public List<WorkflowInfoDTO> listAvailableWorkflows() {
        return bpmnEngine.listAvailableWorkflows();
    }

    public ExecutionExportDTO exportExecution(UUID executionId) {
        ExecutionDetailDTO details = getExecutionDetails(executionId);
        NodeMetricsResponseDTO metrics = getNodeMetrics(executionId, null, null, null);
        ComparisonSummaryDTO summary = getComparisonSummary(executionId);

        return ExecutionExportDTO.builder()
                .execution(details)
                .metrics(metrics)
                .summary(summary)
                .exportedAt(Instant.now())
                .build();
    }

    @Transactional
    public ExecutionResponseDTO retryExecution(UUID executionId, String userId) {
        ChampionChallengeExecution execution = executionRepository.findById(executionId)
                .orElseThrow(() -> new ResourceNotFoundException("Execution not found: " + executionId));

        if (!execution.getCreatedBy().toString().equals(userId)) {
            throw new UnauthorizedException("Not authorized to retry this execution");
        }

        ExecutionRequestDTO request = ExecutionRequestDTO.builder()
                .name(execution.getName() + " (Retry)")
                .description(execution.getDescription())
                .championWorkflowId(execution.getChampionWorkflowId())
                .challengeWorkflowId(execution.getChallengeWorkflowId())
                .requestPayload(execution.getRequestPayload())
                .build();

        return createAndExecute(request, userId);
    }

    private void updateExecutionStatus(UUID executionId, String status) {
        executionRepository.findById(executionId).ifPresent(execution -> {
            execution.setStatus(status);
            executionRepository.save(execution);
        });
    }

    private ExecutionResponseDTO mapToResponseDTO(ChampionChallengeExecution execution) {
        return ExecutionResponseDTO.builder()
                .id(execution.getId())
                .name(execution.getName())
                .status(execution.getStatus())
                .createdAt(execution.getCreatedAt())
                .build();
    }

    private ExecutionSummaryDTO mapToSummaryDTO(ChampionChallengeExecution execution) {
        return ExecutionSummaryDTO.builder()
                .id(execution.getId())
                .name(execution.getName())
                .description(execution.getDescription())
                .status(execution.getStatus())
                .winner(execution.getWinner())
                .totalChampionTimeMs(execution.getTotalChampionTimeMs())
                .totalChallengeTimeMs(execution.getTotalChallengeTimeMs())
                .createdAt(execution.getCreatedAt())
                .completedAt(execution.getCompletedAt())
                .build();
    }

    private ExecutionDetailDTO mapToDetailDTO(ChampionChallengeExecution execution) {
        return ExecutionDetailDTO.builder()
                .id(execution.getId())
                .name(execution.getName())
                .description(execution.getDescription())
                .championWorkflowId(execution.getChampionWorkflowId())
                .challengeWorkflowId(execution.getChallengeWorkflowId())
                .requestPayload(execution.getRequestPayload())
                .status(execution.getStatus())
                .winner(execution.getWinner())
                .totalChampionTimeMs(execution.getTotalChampionTimeMs())
                .totalChallengeTimeMs(execution.getTotalChallengeTimeMs())
                .startedAt(execution.getStartedAt())
                .completedAt(execution.getCompletedAt())
                .createdAt(execution.getCreatedAt())
                .build();
    }

    private NodeMetricDTO mapToNodeMetricDTO(ExecutionNodeMetricsEntity entity) {
        return NodeMetricDTO.builder()
                .id(entity.getId())
                .variant(entity.getVariant())
                .nodeId(entity.getNodeId())
                .nodeName(entity.getNodeName())
                .nodeType(entity.getNodeType())
                .sequence(entity.getSequence())
                .requestData(entity.getRequestData())
                .responseData(entity.getResponseData())
                .executionTimeMs(entity.getExecutionTimeMs())
                .status(entity.getStatus())
                .errorMessage(entity.getErrorMessage())
                .startedAt(entity.getStartedAt())
                .completedAt(entity.getCompletedAt())
                .memoryUsedMb(entity.getMemoryUsedMb())
                .cpuUsagePercent(entity.getCpuUsagePercent())
                .metadata(entity.getMetadata())
                .build();
    }

    private ComparisonMetricDTO mapToComparisonDTO(ExecutionComparison comparison) {
        return ComparisonMetricDTO.builder()
                .metricName(comparison.getMetricName())
                .category(comparison.getMetricCategory())
                .championValue(comparison.getChampionValue())
                .challengeValue(comparison.getChallengeValue())
                .difference(comparison.getDifference())
                .differencePercentage(comparison.getDifferencePercentage())
                .winner(comparison.getWinner())
                .unit(comparison.getUnit())
                .build();
    }

    private FilterConfigDTO mapToFilterDTO(ExecutionFilter filter) {
        return FilterConfigDTO.builder()
                .id(filter.getId())
                .name(filter.getName())
                .config(filter.getFilterConfig())
                .createdAt(filter.getCreatedAt())
                .build();
    }
}

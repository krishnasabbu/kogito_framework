package com.wellsfargo.workflow.championchallenge.service;

import com.wellsfargo.workflow.championchallenge.dto.*;
import com.wellsfargo.workflow.championchallenge.entity.*;
import com.wellsfargo.workflow.championchallenge.repository.*;
import com.wellsfargo.workflow.common.service.WorkflowExecutionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@Slf4j
@RequiredArgsConstructor
public class ChampionChallengeService {

    private final ChampionChallengeExecutionRepository executionRepository;
    private final ExecutionNodeMetricRepository metricRepository;
    private final ExecutionComparisonRepository executionComparisonRepository;
    private final ComparisonRepository comparisonRepository;
    private final WorkflowExecutionService workflowExecutionService;

    private static final List<String> SAMPLE_NODES = Arrays.asList(
            "StartEvent", "ServiceTask_ValidateInput", "ServiceTask_ProcessData",
            "ServiceTask_CallAPI", "Gateway_CheckCondition", "ServiceTask_HandleResult",
            "EndEvent"
    );

    // ========== COMPARISON METHODS (MASTER) ==========

    @Transactional
    public ComparisonResponse createComparison(ComparisonRequest request, String userId) {
        log.info("Creating comparison: {}", request.getName());

        ComparisonEntity comparison = new ComparisonEntity();
        comparison.setName(request.getName());
        comparison.setDescription(request.getDescription());
        comparison.setChampionWorkflowId(request.getChampionWorkflowId());
        comparison.setChallengeWorkflowId(request.getChallengeWorkflowId());
        comparison.setCreatedBy(userId);

        comparison = comparisonRepository.save(comparison);
        return mapToComparisonResponse(comparison);
    }

    @Transactional(readOnly = true)
    public List<ComparisonResponse> listComparisons() {
        log.info("Listing all comparisons");
        List<ComparisonEntity> comparisons = comparisonRepository.findAllByOrderByCreatedAtDesc();

        return comparisons.stream().map(comparison -> {
            ComparisonResponse response = mapToComparisonResponse(comparison);
            // Get execution stats
            List<ChampionChallengeExecutionEntity> executions = comparison.getExecutions();
            response.setTotalExecutions((long) executions.size());
            response.setCompletedExecutions(executions.stream()
                    .filter(e -> e.getStatus() == ChampionChallengeExecutionEntity.ExecutionStatus.COMPLETED)
                    .count());
            response.setRunningExecutions(executions.stream()
                    .filter(e -> e.getStatus() == ChampionChallengeExecutionEntity.ExecutionStatus.RUNNING)
                    .count());
            response.setFailedExecutions(executions.stream()
                    .filter(e -> e.getStatus() == ChampionChallengeExecutionEntity.ExecutionStatus.FAILED)
                    .count());
            response.setLastExecutionAt(executions.stream()
                    .map(ChampionChallengeExecutionEntity::getCreatedAt)
                    .max(LocalDateTime::compareTo)
                    .orElse(null));
            return response;
        }).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ComparisonResponse getComparison(UUID id) {
        log.info("Getting comparison: {}", id);
        ComparisonEntity comparison = comparisonRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Comparison not found"));
        return mapToComparisonResponse(comparison);
    }

    @Transactional
    public void deleteComparison(UUID id) {
        log.info("Deleting comparison: {}", id);
        comparisonRepository.deleteById(id);
    }

    // ========== EXECUTION METHODS (DETAIL) ==========

    @Transactional
    public ExecutionResponse executeComparison(UUID comparisonId, String requestPayload, String userId) {
        log.info("Executing comparison: {}", comparisonId);

        ComparisonEntity comparison = comparisonRepository.findById(comparisonId)
                .orElseThrow(() -> new RuntimeException("Comparison not found"));

        ChampionChallengeExecutionEntity execution = new ChampionChallengeExecutionEntity();
        execution.setComparison(comparison);
        execution.setRequestPayload(requestPayload);
        execution.setCreatedBy(userId);
        execution.setStatus(ChampionChallengeExecutionEntity.ExecutionStatus.RUNNING);
        execution.setStartedAt(LocalDateTime.now());

        execution = executionRepository.save(execution);

        List<ExecutionNodeMetricEntity> championMetrics = executeWorkflow(
                execution, "CHAMPION", comparison.getChampionWorkflowId());
        List<ExecutionNodeMetricEntity> challengeMetrics = executeWorkflow(
                execution, "CHALLENGE", comparison.getChallengeWorkflowId());

        long championTotal = championMetrics.stream()
                .mapToLong(ExecutionNodeMetricEntity::getExecutionTimeMs).sum();
        long challengeTotal = challengeMetrics.stream()
                .mapToLong(ExecutionNodeMetricEntity::getExecutionTimeMs).sum();

        execution.setTotalChampionTimeMs(championTotal);
        execution.setTotalChallengeTimeMs(challengeTotal);
        execution.setWinner(championTotal < challengeTotal ? "CHAMPION" : "CHALLENGE");
        execution.setStatus(ChampionChallengeExecutionEntity.ExecutionStatus.COMPLETED);
        execution.setCompletedAt(LocalDateTime.now());

        executionRepository.save(execution);
        createExecutionComparisons(execution, championMetrics, challengeMetrics);

        return mapToExecutionResponse(execution, comparison);
    }

    @Transactional(readOnly = true)
    public List<ExecutionResponse> listExecutions(UUID comparisonId) {
        log.info("Listing executions for comparison: {}", comparisonId);
        ComparisonEntity comparison = comparisonRepository.findById(comparisonId)
                .orElseThrow(() -> new RuntimeException("Comparison not found"));

        return comparison.getExecutions().stream()
                .sorted(Comparator.comparing(ChampionChallengeExecutionEntity::getCreatedAt).reversed())
                .map(exec -> mapToExecutionResponse(exec, comparison))
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ExecutionResponse getExecution(String executionId) {
        log.info("Getting execution: {}", executionId);
        ChampionChallengeExecutionEntity execution = executionRepository.findByIdWithMetrics(executionId)
                .orElseThrow(() -> new RuntimeException("Execution not found"));
        return mapToExecutionResponse(execution, execution.getComparison());
    }

    // ========== HELPER METHODS ==========

    private List<ExecutionNodeMetricEntity> executeWorkflow(
            ChampionChallengeExecutionEntity execution, String variant, String workflowId) {
        List<ExecutionNodeMetricEntity> metrics = new ArrayList<>();
        boolean isChallenge = "CHALLENGE".equals(variant);
        Random random = new Random();

        for (int i = 0; i < SAMPLE_NODES.size(); i++) {
            String nodeName = SAMPLE_NODES.get(i);
            LocalDateTime start = LocalDateTime.now();
            long execTime;
            String status = "SUCCESS";
            String errorMessage = null;

            try {
                execTime = workflowExecutionService.simulateNodeExecution(nodeName, isChallenge);
            } catch (Exception e) {
                execTime = 0L;
                status = "ERROR";
                errorMessage = e.getMessage();
            }

            ExecutionNodeMetricEntity metric = new ExecutionNodeMetricEntity();
            metric.setExecution(execution);
            metric.setVariant(variant);
            metric.setNodeId(nodeName.toLowerCase());
            metric.setNodeName(nodeName);
            metric.setNodeType(nodeName.contains("Task") ? "ServiceTask" :
                    nodeName.contains("Gateway") ? "Gateway" : "Event");
            metric.setSequence(i);
            metric.setExecutionTimeMs(execTime);
            metric.setStatus(status);
            metric.setErrorMessage(errorMessage);
            metric.setStartedAt(start);
            metric.setCompletedAt(LocalDateTime.now());
            metric.setMemoryUsedMb(20.0 + random.nextDouble() * 80.0);
            metric.setCpuUsagePercent(10.0 + random.nextDouble() * 80.0);
            metric.setRequestData("{\"payload\":\"test\"}");
            metric.setResponseData("{\"result\":\"success\"}");

            execution.addNodeMetric(metric);
            metricRepository.save(metric);
            metrics.add(metric);

            if ("ERROR".equals(status)) {
                break;
            }
        }

        return metrics;
    }

    private void createExecutionComparisons(ChampionChallengeExecutionEntity execution,
                                           List<ExecutionNodeMetricEntity> championMetrics,
                                           List<ExecutionNodeMetricEntity> challengeMetrics) {
        long championTotal = championMetrics.stream()
                .mapToLong(ExecutionNodeMetricEntity::getExecutionTimeMs).sum();
        long challengeTotal = challengeMetrics.stream()
                .mapToLong(ExecutionNodeMetricEntity::getExecutionTimeMs).sum();

        createComparisonMetric(execution, "Total Execution Time", "PERFORMANCE",
                (double) championTotal, (double) challengeTotal, "ms");

        double championAvg = championMetrics.isEmpty() ? 0 : championTotal / (double) championMetrics.size();
        double challengeAvg = challengeMetrics.isEmpty() ? 0 : challengeTotal / (double) challengeMetrics.size();
        createComparisonMetric(execution, "Average Node Time", "PERFORMANCE",
                championAvg, challengeAvg, "ms");

        long championSuccess = championMetrics.stream()
                .filter(m -> "SUCCESS".equals(m.getStatus())).count();
        long challengeSuccess = challengeMetrics.stream()
                .filter(m -> "SUCCESS".equals(m.getStatus())).count();
        double championSuccessRate = championMetrics.isEmpty() ? 0 :
                (championSuccess / (double) championMetrics.size()) * 100;
        double challengeSuccessRate = challengeMetrics.isEmpty() ? 0 :
                (challengeSuccess / (double) challengeMetrics.size()) * 100;
        createComparisonMetric(execution, "Success Rate", "QUALITY",
                championSuccessRate, challengeSuccessRate, "%");
    }

    private void createComparisonMetric(ChampionChallengeExecutionEntity execution, String metricName,
                                       String category, double championValue, double challengeValue, String unit) {
        double difference = challengeValue - championValue;
        double diffPercentage = championValue == 0 ? 0 : (difference / championValue) * 100;

        String winner;
        if ("QUALITY".equals(category)) {
            winner = championValue > challengeValue ? "CHAMPION" :
                    challengeValue > championValue ? "CHALLENGE" : "TIE";
        } else {
            winner = championValue < challengeValue ? "CHAMPION" :
                    challengeValue < championValue ? "CHALLENGE" : "TIE";
        }

        ExecutionComparisonEntity comparison = new ExecutionComparisonEntity();
        comparison.setExecution(execution);
        comparison.setMetricName(metricName);
        comparison.setMetricCategory(category);
        comparison.setChampionValue(championValue);
        comparison.setChallengeValue(challengeValue);
        comparison.setDifference(difference);
        comparison.setDifferencePercentage(diffPercentage);
        comparison.setWinner(winner);
        comparison.setUnit(unit);

        executionComparisonRepository.save(comparison);
    }

    private ComparisonResponse mapToComparisonResponse(ComparisonEntity comparison) {
        ComparisonResponse response = new ComparisonResponse();
        response.setId(comparison.getId().toString());
        response.setName(comparison.getName());
        response.setDescription(comparison.getDescription());
        response.setChampionWorkflowId(comparison.getChampionWorkflowId());
        response.setChallengeWorkflowId(comparison.getChallengeWorkflowId());
        response.setCreatedAt(comparison.getCreatedAt());
        response.setUpdatedAt(comparison.getUpdatedAt());
        response.setCreatedBy(comparison.getCreatedBy());
        return response;
    }

    private ExecutionResponse mapToExecutionResponse(ChampionChallengeExecutionEntity execution,
                                                     ComparisonEntity comparison) {
        List<NodeMetricResponse> championMetrics = execution.getNodeMetrics().stream()
                .filter(m -> "CHAMPION".equals(m.getVariant()))
                .sorted(Comparator.comparing(ExecutionNodeMetricEntity::getSequence))
                .map(this::mapMetricToResponse)
                .collect(Collectors.toList());

        List<NodeMetricResponse> challengeMetrics = execution.getNodeMetrics().stream()
                .filter(m -> "CHALLENGE".equals(m.getVariant()))
                .sorted(Comparator.comparing(ExecutionNodeMetricEntity::getSequence))
                .map(this::mapMetricToResponse)
                .collect(Collectors.toList());

        return ExecutionResponse.builder()
                .id(execution.getId())
                .name(comparison.getName())
                .description(comparison.getDescription())
                .championWorkflowId(comparison.getChampionWorkflowId())
                .challengeWorkflowId(comparison.getChallengeWorkflowId())
                .requestPayload(execution.getRequestPayload())
                .status(execution.getStatus().name())
                .startedAt(execution.getStartedAt())
                .completedAt(execution.getCompletedAt())
                .createdAt(execution.getCreatedAt())
                .createdBy(execution.getCreatedBy())
                .totalChampionTimeMs(execution.getTotalChampionTimeMs())
                .totalChallengeTimeMs(execution.getTotalChallengeTimeMs())
                .winner(execution.getWinner())
                .championMetrics(championMetrics)
                .challengeMetrics(challengeMetrics)
                .build();
    }

    private NodeMetricResponse mapMetricToResponse(ExecutionNodeMetricEntity metric) {
        return NodeMetricResponse.builder()
                .id(metric.getId())
                .variant(metric.getVariant())
                .nodeId(metric.getNodeId())
                .nodeName(metric.getNodeName())
                .nodeType(metric.getNodeType())
                .requestData(metric.getRequestData())
                .responseData(metric.getResponseData())
                .executionTimeMs(metric.getExecutionTimeMs())
                .status(metric.getStatus())
                .errorMessage(metric.getErrorMessage())
                .startedAt(metric.getStartedAt())
                .completedAt(metric.getCompletedAt())
                .metadata(metric.getMetadata())
                .build();
    }
}

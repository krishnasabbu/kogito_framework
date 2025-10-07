package com.wellsfargo.championchallenge.service;

import com.wellsfargo.championchallenge.dto.*;
import com.wellsfargo.championchallenge.entity.*;
import com.wellsfargo.championchallenge.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.JsonNode;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;
import java.util.concurrent.CompletableFuture;

@Service
@Slf4j
@RequiredArgsConstructor
public class ChampionChallengeServiceImpl {

    private final ChampionChallengeExecutionRepository executionRepository;
    private final ExecutionNodeMetricRepository metricRepository;
    private final ObjectMapper objectMapper;
    private final WorkflowExecutionService workflowExecutionService;

    @Transactional
    public ExecutionResponse createExecution(ExecutionRequest request, String userId) {
        log.info("Creating execution: {} for user: {}", request.getName(), userId);

        ChampionChallengeExecutionEntity execution = new ChampionChallengeExecutionEntity();
        execution.setName(request.getName());
        execution.setDescription(request.getDescription());
        execution.setChampionWorkflowId(request.getChampionWorkflowId());
        execution.setChallengeWorkflowId(request.getChallengeWorkflowId());
        execution.setRequestPayload(request.getRequestPayload().toString());
        execution.setStatus(ChampionChallengeExecutionEntity.ExecutionStatus.PENDING);
        execution.setCreatedBy(userId);

        execution = executionRepository.save(execution);
        log.info("Execution created with ID: {}", execution.getId());

        final String executionId = execution.getId();
        CompletableFuture.runAsync(() -> executeAsync(executionId));

        return mapToResponse(execution);
    }

    @Transactional
    public void executeAsync(String executionId) {
        try {
            log.info("Starting async execution: {}", executionId);

            ChampionChallengeExecutionEntity execution = executionRepository.findById(executionId)
                .orElseThrow(() -> new RuntimeException("Execution not found: " + executionId));

            execution.setStatus(ChampionChallengeExecutionEntity.ExecutionStatus.RUNNING);
            execution.setStartedAt(LocalDateTime.now());
            executionRepository.save(execution);

            JsonNode requestPayload = objectMapper.readTree(execution.getRequestPayload());

            List<ExecutionNodeMetricEntity> championMetrics = workflowExecutionService.executeWorkflow(
                executionId,
                execution.getChampionWorkflowId(),
                requestPayload,
                ExecutionNodeMetricEntity.Variant.CHAMPION
            );

            List<ExecutionNodeMetricEntity> challengeMetrics = workflowExecutionService.executeWorkflow(
                executionId,
                execution.getChallengeWorkflowId(),
                requestPayload,
                ExecutionNodeMetricEntity.Variant.CHALLENGE
            );

            for (ExecutionNodeMetricEntity metric : championMetrics) {
                metric.setExecution(execution);
            }
            for (ExecutionNodeMetricEntity metric : challengeMetrics) {
                metric.setExecution(execution);
            }

            metricRepository.saveAll(championMetrics);
            metricRepository.saveAll(challengeMetrics);

            Long championTime = championMetrics.stream()
                .mapToLong(ExecutionNodeMetricEntity::getExecutionTimeMs)
                .sum();

            Long challengeTime = challengeMetrics.stream()
                .mapToLong(ExecutionNodeMetricEntity::getExecutionTimeMs)
                .sum();

            ChampionChallengeExecutionEntity.Winner winner = determineWinner(championTime, challengeTime);

            execution.setTotalChampionTimeMs(championTime);
            execution.setTotalChallengeTimeMs(challengeTime);
            execution.setWinner(winner);
            execution.setStatus(ChampionChallengeExecutionEntity.ExecutionStatus.COMPLETED);
            execution.setCompletedAt(LocalDateTime.now());

            executionRepository.save(execution);
            log.info("Execution completed: {} - Winner: {}", executionId, winner);

        } catch (Exception e) {
            log.error("Execution failed: {}", executionId, e);
            updateExecutionStatus(executionId, ChampionChallengeExecutionEntity.ExecutionStatus.FAILED);
        }
    }

    private ChampionChallengeExecutionEntity.Winner determineWinner(Long championTime, Long challengeTime) {
        if (championTime < challengeTime) {
            return ChampionChallengeExecutionEntity.Winner.CHAMPION;
        } else if (challengeTime < championTime) {
            return ChampionChallengeExecutionEntity.Winner.CHALLENGE;
        } else {
            return ChampionChallengeExecutionEntity.Winner.TIE;
        }
    }

    @Transactional
    public void updateExecutionStatus(String executionId, ChampionChallengeExecutionEntity.ExecutionStatus status) {
        executionRepository.findById(executionId).ifPresent(execution -> {
            execution.setStatus(status);
            if (status == ChampionChallengeExecutionEntity.ExecutionStatus.COMPLETED ||
                status == ChampionChallengeExecutionEntity.ExecutionStatus.FAILED) {
                execution.setCompletedAt(LocalDateTime.now());
            }
            executionRepository.save(execution);
        });
    }

    @Transactional(readOnly = true)
    public ExecutionResponse getExecution(String executionId) {
        ChampionChallengeExecutionEntity execution = executionRepository.findByIdWithMetrics(executionId)
            .orElseThrow(() -> new RuntimeException("Execution not found: " + executionId));

        return mapToResponseWithMetrics(execution);
    }

    @Transactional(readOnly = true)
    public List<ExecutionResponse> listExecutions() {
        return executionRepository.findAllByOrderByCreatedAtDesc().stream()
            .map(this::mapToResponse)
            .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ExecutionResponse> listExecutionsByUser(String userId) {
        return executionRepository.findByCreatedBy(userId).stream()
            .map(this::mapToResponse)
            .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public AnalyticsResponse getAnalytics(String executionId) {
        ChampionChallengeExecutionEntity execution = executionRepository.findByIdWithMetrics(executionId)
            .orElseThrow(() -> new RuntimeException("Execution not found: " + executionId));

        List<ExecutionNodeMetricEntity> championMetrics = metricRepository
            .findByExecutionIdAndVariantOrderedByStartTime(executionId, ExecutionNodeMetricEntity.Variant.CHAMPION);

        List<ExecutionNodeMetricEntity> challengeMetrics = metricRepository
            .findByExecutionIdAndVariantOrderedByStartTime(executionId, ExecutionNodeMetricEntity.Variant.CHALLENGE);

        return calculateAnalytics(execution, championMetrics, challengeMetrics);
    }

    private AnalyticsResponse calculateAnalytics(
        ChampionChallengeExecutionEntity execution,
        List<ExecutionNodeMetricEntity> championMetrics,
        List<ExecutionNodeMetricEntity> challengeMetrics
    ) {
        Long championTotal = championMetrics.stream()
            .mapToLong(ExecutionNodeMetricEntity::getExecutionTimeMs)
            .sum();

        Long challengeTotal = challengeMetrics.stream()
            .mapToLong(ExecutionNodeMetricEntity::getExecutionTimeMs)
            .sum();

        Double avgChampion = championMetrics.stream()
            .mapToLong(ExecutionNodeMetricEntity::getExecutionTimeMs)
            .average()
            .orElse(0.0);

        Double avgChallenge = challengeMetrics.stream()
            .mapToLong(ExecutionNodeMetricEntity::getExecutionTimeMs)
            .average()
            .orElse(0.0);

        long championSuccess = championMetrics.stream()
            .filter(m -> m.getStatus() == ExecutionNodeMetricEntity.MetricStatus.SUCCESS)
            .count();

        long challengeSuccess = challengeMetrics.stream()
            .filter(m -> m.getStatus() == ExecutionNodeMetricEntity.MetricStatus.SUCCESS)
            .count();

        long championError = championMetrics.stream()
            .filter(m -> m.getStatus() == ExecutionNodeMetricEntity.MetricStatus.ERROR)
            .count();

        long challengeError = challengeMetrics.stream()
            .filter(m -> m.getStatus() == ExecutionNodeMetricEntity.MetricStatus.ERROR)
            .count();

        Double improvement = Math.abs(((championTotal - challengeTotal) / (double) challengeTotal) * 100);

        AnalyticsResponse.SummaryCards summaryCards = AnalyticsResponse.SummaryCards.builder()
            .championTotalTime(championTotal)
            .challengeTotalTime(challengeTotal)
            .improvementPercentage(improvement)
            .winner(execution.getWinner() != null ? execution.getWinner().name() : "TIE")
            .build();

        List<AnalyticsResponse.ExecutionTimeData> executionTimeData = new ArrayList<>();
        for (int i = 0; i < Math.min(championMetrics.size(), challengeMetrics.size()); i++) {
            ExecutionNodeMetricEntity champion = championMetrics.get(i);
            ExecutionNodeMetricEntity challenge = challengeMetrics.get(i);

            executionTimeData.add(AnalyticsResponse.ExecutionTimeData.builder()
                .name(champion.getNodeName())
                .champion(champion.getExecutionTimeMs())
                .challenge(challenge.getExecutionTimeMs())
                .difference(champion.getExecutionTimeMs() - challenge.getExecutionTimeMs())
                .build());
        }

        List<AnalyticsResponse.PieData> pieData = Arrays.asList(
            AnalyticsResponse.PieData.builder()
                .name("Champion Total")
                .value(championTotal)
                .color("#C40404")
                .build(),
            AnalyticsResponse.PieData.builder()
                .name("Challenge Total")
                .value(challengeTotal)
                .color("#FFD700")
                .build()
        );

        List<AnalyticsResponse.SuccessRateData> successRateData = Arrays.asList(
            AnalyticsResponse.SuccessRateData.builder()
                .name("Champion")
                .success((int) championSuccess)
                .error((int) championError)
                .build(),
            AnalyticsResponse.SuccessRateData.builder()
                .name("Challenge")
                .success((int) challengeSuccess)
                .error((int) challengeError)
                .build()
        );

        List<AnalyticsResponse.CumulativeData> cumulativeData = new ArrayList<>();
        long championCumulative = 0;
        long challengeCumulative = 0;
        for (int i = 0; i < Math.min(championMetrics.size(), challengeMetrics.size()); i++) {
            championCumulative += championMetrics.get(i).getExecutionTimeMs();
            challengeCumulative += challengeMetrics.get(i).getExecutionTimeMs();

            cumulativeData.add(AnalyticsResponse.CumulativeData.builder()
                .name(championMetrics.get(i).getNodeName())
                .championCumulative(championCumulative)
                .challengeCumulative(challengeCumulative)
                .build());
        }

        Double championSuccessRate = (championSuccess / (double) championMetrics.size()) * 100;
        Double challengeSuccessRate = (challengeSuccess / (double) challengeMetrics.size()) * 100;

        List<AnalyticsResponse.RadarData> radarData = Arrays.asList(
            AnalyticsResponse.RadarData.builder()
                .metric("Speed")
                .champion((challengeTotal / (double) championTotal) * 100)
                .challenge(100.0)
                .build(),
            AnalyticsResponse.RadarData.builder()
                .metric("Success Rate")
                .champion(championSuccessRate)
                .challenge(challengeSuccessRate)
                .build(),
            AnalyticsResponse.RadarData.builder()
                .metric("Efficiency")
                .champion((avgChallenge / avgChampion) * 100)
                .challenge(100.0)
                .build(),
            AnalyticsResponse.RadarData.builder()
                .metric("Reliability")
                .champion(100 - ((championError / (double) championMetrics.size()) * 100))
                .challenge(100 - ((challengeError / (double) challengeMetrics.size()) * 100))
                .build(),
            AnalyticsResponse.RadarData.builder()
                .metric("Consistency")
                .champion(85.0)
                .challenge(90.0)
                .build()
        );

        List<AnalyticsResponse.PerformanceComparison> performanceComparison = Arrays.asList(
            AnalyticsResponse.PerformanceComparison.builder()
                .metric("Avg Time")
                .champion(avgChampion)
                .challenge(avgChallenge)
                .build(),
            AnalyticsResponse.PerformanceComparison.builder()
                .metric("Total Time")
                .champion(championTotal.doubleValue())
                .challenge(challengeTotal.doubleValue())
                .build(),
            AnalyticsResponse.PerformanceComparison.builder()
                .metric("Success Rate")
                .champion(championSuccessRate)
                .challenge(challengeSuccessRate)
                .build()
        );

        AnalyticsResponse.DetailedStatistics detailedStatistics = AnalyticsResponse.DetailedStatistics.builder()
            .championStats(AnalyticsResponse.ChampionStats.builder()
                .totalTime(championTotal)
                .averageTime(avgChampion)
                .totalNodes(championMetrics.size())
                .successfulNodes((int) championSuccess)
                .errorNodes((int) championError)
                .build())
            .challengeStats(AnalyticsResponse.ChallengeStats.builder()
                .totalTime(challengeTotal)
                .averageTime(avgChallenge)
                .totalNodes(challengeMetrics.size())
                .successfulNodes((int) challengeSuccess)
                .errorNodes((int) challengeError)
                .build())
            .comparisonStats(AnalyticsResponse.ComparisonStats.builder()
                .timeDifference(Math.abs(championTotal - challengeTotal))
                .fasterVariant(championTotal < challengeTotal ? "CHAMPION" : "CHALLENGE")
                .improvement(improvement)
                .successRateDiff(Math.abs(championSuccessRate - challengeSuccessRate))
                .build())
            .build();

        return AnalyticsResponse.builder()
            .summaryCards(summaryCards)
            .executionTimeData(executionTimeData)
            .pieData(pieData)
            .successRateData(successRateData)
            .cumulativeData(cumulativeData)
            .radarData(radarData)
            .performanceComparison(performanceComparison)
            .detailedStatistics(detailedStatistics)
            .build();
    }

    private ExecutionResponse mapToResponse(ChampionChallengeExecutionEntity execution) {
        try {
            JsonNode requestPayload = execution.getRequestPayload() != null
                ? objectMapper.readTree(execution.getRequestPayload())
                : null;

            return ExecutionResponse.builder()
                .id(execution.getId())
                .name(execution.getName())
                .description(execution.getDescription())
                .championWorkflowId(execution.getChampionWorkflowId())
                .challengeWorkflowId(execution.getChallengeWorkflowId())
                .requestPayload(requestPayload)
                .status(execution.getStatus())
                .startedAt(execution.getStartedAt())
                .completedAt(execution.getCompletedAt())
                .createdAt(execution.getCreatedAt())
                .createdBy(execution.getCreatedBy())
                .totalChampionTimeMs(execution.getTotalChampionTimeMs())
                .totalChallengeTimeMs(execution.getTotalChallengeTimeMs())
                .winner(execution.getWinner())
                .build();
        } catch (Exception e) {
            throw new RuntimeException("Error mapping execution to response", e);
        }
    }

    private ExecutionResponse mapToResponseWithMetrics(ChampionChallengeExecutionEntity execution) {
        ExecutionResponse response = mapToResponse(execution);

        List<NodeMetricResponse> championMetrics = execution.getMetrics().stream()
            .filter(m -> m.getVariant() == ExecutionNodeMetricEntity.Variant.CHAMPION)
            .map(this::mapMetricToResponse)
            .collect(Collectors.toList());

        List<NodeMetricResponse> challengeMetrics = execution.getMetrics().stream()
            .filter(m -> m.getVariant() == ExecutionNodeMetricEntity.Variant.CHALLENGE)
            .map(this::mapMetricToResponse)
            .collect(Collectors.toList());

        response.setMetrics(ExecutionResponse.ExecutionMetrics.builder()
            .champion(championMetrics)
            .challenge(challengeMetrics)
            .build());

        return response;
    }

    private NodeMetricResponse mapMetricToResponse(ExecutionNodeMetricEntity metric) {
        try {
            JsonNode requestData = metric.getRequestData() != null
                ? objectMapper.readTree(metric.getRequestData())
                : null;

            JsonNode responseData = metric.getResponseData() != null
                ? objectMapper.readTree(metric.getResponseData())
                : null;

            JsonNode metadata = metric.getMetadata() != null
                ? objectMapper.readTree(metric.getMetadata())
                : null;

            return NodeMetricResponse.builder()
                .id(metric.getId())
                .executionId(metric.getExecution().getId())
                .variant(metric.getVariant())
                .nodeId(metric.getNodeId())
                .nodeName(metric.getNodeName())
                .nodeType(metric.getNodeType())
                .requestData(requestData)
                .responseData(responseData)
                .executionTimeMs(metric.getExecutionTimeMs())
                .status(metric.getStatus())
                .errorMessage(metric.getErrorMessage())
                .startedAt(metric.getStartedAt())
                .completedAt(metric.getCompletedAt())
                .metadata(metadata)
                .build();
        } catch (Exception e) {
            throw new RuntimeException("Error mapping metric to response", e);
        }
    }
}

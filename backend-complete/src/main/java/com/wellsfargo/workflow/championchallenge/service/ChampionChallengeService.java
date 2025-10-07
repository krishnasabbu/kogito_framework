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
    private final WorkflowExecutionService workflowExecutionService;

    private static final List<String> SAMPLE_NODES = Arrays.asList(
            "StartEvent", "ServiceTask_ValidateInput", "ServiceTask_ProcessData",
            "ServiceTask_CallAPI", "Gateway_CheckCondition", "ServiceTask_HandleResult",
            "EndEvent"
    );

    @Transactional
    public ExecutionResponse createExecution(ExecutionRequest request, String userId) {
        log.info("Creating execution: {}", request.getName());

        ChampionChallengeExecutionEntity execution = new ChampionChallengeExecutionEntity();
        execution.setName(request.getName());
        execution.setDescription(request.getDescription());
        execution.setChampionWorkflowId(request.getChampionWorkflowId());
        execution.setChallengeWorkflowId(request.getChallengeWorkflowId());
        execution.setRequestPayload(request.getRequestPayload());
        execution.setCreatedBy(userId);
        execution.setStatus(ChampionChallengeExecutionEntity.ExecutionStatus.RUNNING);
        execution.setStartedAt(LocalDateTime.now());

        execution = executionRepository.save(execution);

        long championTotal = executeWorkflow(execution, "CHAMPION", request.getChampionWorkflowId());
        long challengeTotal = executeWorkflow(execution, "CHALLENGE", request.getChallengeWorkflowId());

        execution.setTotalChampionTimeMs(championTotal);
        execution.setTotalChallengeTimeMs(challengeTotal);
        execution.setWinner(championTotal < challengeTotal ? "CHAMPION" : "CHALLENGE");
        execution.setStatus(ChampionChallengeExecutionEntity.ExecutionStatus.COMPLETED);
        execution.setCompletedAt(LocalDateTime.now());

        executionRepository.save(execution);

        return mapToResponse(execution);
    }

    private long executeWorkflow(ChampionChallengeExecutionEntity execution, String variant, String workflowId) {
        long totalTime = 0L;
        boolean isChallenge = "CHALLENGE".equals(variant);

        for (String nodeName : SAMPLE_NODES) {
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
            metric.setExecutionTimeMs(execTime);
            metric.setStatus(status);
            metric.setErrorMessage(errorMessage);
            metric.setStartedAt(start);
            metric.setCompletedAt(LocalDateTime.now());

            execution.addNodeMetric(metric);
            metricRepository.save(metric);

            totalTime += execTime;
        }

        return totalTime;
    }

    @Transactional(readOnly = true)
    public ExecutionResponse getExecution(String executionId) {
        ChampionChallengeExecutionEntity execution = executionRepository.findByIdWithMetrics(executionId)
                .orElseThrow(() -> new RuntimeException("Execution not found"));
        return mapToResponse(execution);
    }

    @Transactional(readOnly = true)
    public List<ExecutionResponse> listExecutions() {
        return executionRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public AnalyticsResponse getAnalytics(String executionId) {
        ChampionChallengeExecutionEntity execution = executionRepository.findByIdWithMetrics(executionId)
                .orElseThrow(() -> new RuntimeException("Execution not found"));

        List<ExecutionNodeMetricEntity> championMetrics = execution.getNodeMetrics().stream()
                .filter(m -> "CHAMPION".equals(m.getVariant()))
                .collect(Collectors.toList());

        List<ExecutionNodeMetricEntity> challengeMetrics = execution.getNodeMetrics().stream()
                .filter(m -> "CHALLENGE".equals(m.getVariant()))
                .collect(Collectors.toList());

        double improvement = execution.getTotalChampionTimeMs() > 0
                ? ((execution.getTotalChampionTimeMs() - execution.getTotalChallengeTimeMs()) /
                (double) execution.getTotalChampionTimeMs()) * 100
                : 0.0;

        AnalyticsResponse.SummaryCards summaryCards = AnalyticsResponse.SummaryCards.builder()
                .championTime(execution.getTotalChampionTimeMs())
                .challengeTime(execution.getTotalChallengeTimeMs())
                .winner(execution.getWinner())
                .improvement(improvement)
                .build();

        List<AnalyticsResponse.ExecutionTimeData> executionTimeData = new ArrayList<>();
        for (int i = 0; i < championMetrics.size() && i < challengeMetrics.size(); i++) {
            executionTimeData.add(AnalyticsResponse.ExecutionTimeData.builder()
                    .node(championMetrics.get(i).getNodeName())
                    .champion(championMetrics.get(i).getExecutionTimeMs())
                    .challenge(challengeMetrics.get(i).getExecutionTimeMs())
                    .build());
        }

        List<AnalyticsResponse.PieData> pieData = Arrays.asList(
                AnalyticsResponse.PieData.builder().name("Champion").value(execution.getTotalChampionTimeMs()).build(),
                AnalyticsResponse.PieData.builder().name("Challenge").value(execution.getTotalChallengeTimeMs()).build()
        );

        long champSuccess = championMetrics.stream().filter(m -> "SUCCESS".equals(m.getStatus())).count();
        long challSuccess = challengeMetrics.stream().filter(m -> "SUCCESS".equals(m.getStatus())).count();

        List<AnalyticsResponse.SuccessRateData> successRateData = Arrays.asList(
                AnalyticsResponse.SuccessRateData.builder()
                        .variant("Champion")
                        .success(champSuccess)
                        .error(championMetrics.size() - champSuccess)
                        .build(),
                AnalyticsResponse.SuccessRateData.builder()
                        .variant("Challenge")
                        .success(challSuccess)
                        .error(challengeMetrics.size() - challSuccess)
                        .build()
        );

        List<AnalyticsResponse.CumulativeData> cumulativeData = new ArrayList<>();
        long champCumulative = 0L;
        long challCumulative = 0L;
        for (int i = 0; i < championMetrics.size() && i < challengeMetrics.size(); i++) {
            champCumulative += championMetrics.get(i).getExecutionTimeMs();
            challCumulative += challengeMetrics.get(i).getExecutionTimeMs();
            cumulativeData.add(AnalyticsResponse.CumulativeData.builder()
                    .node(championMetrics.get(i).getNodeName())
                    .championCumulative(champCumulative)
                    .challengeCumulative(challCumulative)
                    .build());
        }

        AnalyticsResponse.RadarData radarData = AnalyticsResponse.RadarData.builder()
                .metrics(Arrays.asList("Speed", "Efficiency", "Reliability", "Performance", "Quality"))
                .champion(Arrays.asList(85.0, 90.0, 95.0, 88.0, 92.0))
                .challenge(Arrays.asList(90.0, 85.0, 90.0, 92.0, 88.0))
                .build();

        List<AnalyticsResponse.PerformanceComparison> performanceComparison = Arrays.asList(
                AnalyticsResponse.PerformanceComparison.builder()
                        .metric("Avg Time").championValue(championMetrics.stream().mapToLong(ExecutionNodeMetricEntity::getExecutionTimeMs).average().orElse(0.0))
                        .challengeValue(challengeMetrics.stream().mapToLong(ExecutionNodeMetricEntity::getExecutionTimeMs).average().orElse(0.0)).build(),
                AnalyticsResponse.PerformanceComparison.builder()
                        .metric("Total Time").championValue(execution.getTotalChampionTimeMs().doubleValue())
                        .challengeValue(execution.getTotalChallengeTimeMs().doubleValue()).build()
        );

        AnalyticsResponse.DetailedStatistics detailedStatistics = AnalyticsResponse.DetailedStatistics.builder()
                .totalChampionNodes((long) championMetrics.size())
                .totalChallengeNodes((long) challengeMetrics.size())
                .championSuccess(champSuccess)
                .challengeSuccess(challSuccess)
                .championSuccessRate(championMetrics.size() > 0 ? (champSuccess / (double) championMetrics.size()) * 100 : 0.0)
                .challengeSuccessRate(challengeMetrics.size() > 0 ? (challSuccess / (double) challengeMetrics.size()) * 100 : 0.0)
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
        List<NodeMetricResponse> championMetrics = execution.getNodeMetrics().stream()
                .filter(m -> "CHAMPION".equals(m.getVariant()))
                .map(this::mapMetricToResponse)
                .collect(Collectors.toList());

        List<NodeMetricResponse> challengeMetrics = execution.getNodeMetrics().stream()
                .filter(m -> "CHALLENGE".equals(m.getVariant()))
                .map(this::mapMetricToResponse)
                .collect(Collectors.toList());

        return ExecutionResponse.builder()
                .id(execution.getId())
                .name(execution.getName())
                .description(execution.getDescription())
                .championWorkflowId(execution.getChampionWorkflowId())
                .challengeWorkflowId(execution.getChallengeWorkflowId())
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

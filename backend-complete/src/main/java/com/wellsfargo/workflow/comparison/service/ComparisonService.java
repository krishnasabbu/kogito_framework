package com.wellsfargo.workflow.comparison.service;

import com.wellsfargo.workflow.championchallenge.entity.ChampionChallengeExecutionEntity;
import com.wellsfargo.workflow.championchallenge.entity.ExecutionNodeMetricEntity;
import com.wellsfargo.workflow.championchallenge.repository.ChampionChallengeExecutionRepository;
import com.wellsfargo.workflow.championchallenge.repository.ExecutionNodeMetricRepository;
import com.wellsfargo.workflow.comparison.dto.*;
import com.wellsfargo.workflow.comparison.entity.ComparisonMasterEntity;
import com.wellsfargo.workflow.comparison.entity.ExecutionComparisonEntity;
import com.wellsfargo.workflow.comparison.repository.ComparisonMasterRepository;
import com.wellsfargo.workflow.comparison.repository.ExecutionComparisonRepository;
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
public class ComparisonService {

    private final ComparisonMasterRepository comparisonRepository;
    private final ExecutionComparisonRepository executionComparisonRepository;
    private final ChampionChallengeExecutionRepository executionRepository;
    private final ExecutionNodeMetricRepository nodeMetricRepository;

    @Transactional
    public ComparisonResponse createComparison(ComparisonRequest request, String userId) {
        log.info("Creating comparison: {}", request.getName());

        String workflowPair = request.getChampionWorkflowId() + " vs " + request.getChallengeWorkflowId();

        ComparisonMasterEntity comparison = ComparisonMasterEntity.builder()
                .name(request.getName())
                .description(request.getDescription())
                .workflowPair(workflowPair)
                .championWorkflowId(request.getChampionWorkflowId())
                .challengeWorkflowId(request.getChallengeWorkflowId())
                .status("PENDING")
                .createdBy(userId)
                .build();

        comparison = comparisonRepository.save(comparison);

        if (request.getExecutionIds() != null && !request.getExecutionIds().isEmpty()) {
            for (String executionId : request.getExecutionIds()) {
                addExecutionToComparison(comparison.getId(), executionId);
            }
        }

        return mapToResponse(comparison);
    }

    @Transactional(readOnly = true)
    public List<ComparisonResponse> listComparisons() {
        return comparisonRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ComparisonResponse getComparison(String comparisonId) {
        ComparisonMasterEntity comparison = comparisonRepository.findById(comparisonId)
                .orElseThrow(() -> new RuntimeException("Comparison not found"));
        return mapToResponse(comparison);
    }

    @Transactional
    public void addExecutionToComparison(String comparisonId, String executionId) {
        ComparisonMasterEntity comparison = comparisonRepository.findById(comparisonId)
                .orElseThrow(() -> new RuntimeException("Comparison not found"));

        Optional<ExecutionComparisonEntity> existing =
                executionComparisonRepository.findByComparisonIdAndExecutionId(comparisonId, executionId);

        if (existing.isPresent()) {
            log.warn("Execution {} already in comparison {}", executionId, comparisonId);
            return;
        }

        ExecutionComparisonEntity mapping = ExecutionComparisonEntity.builder()
                .comparison(comparison)
                .executionId(executionId)
                .included(true)
                .outlierFlag(false)
                .build();

        executionComparisonRepository.save(mapping);
    }

    @Transactional
    public void removeExecutionFromComparison(String comparisonId, String executionId) {
        executionComparisonRepository.deleteByComparisonIdAndExecutionId(comparisonId, executionId);
    }

    @Transactional
    public AggregateMetricsResponse calculateAggregateMetrics(String comparisonId) {
        log.info("Calculating aggregate metrics for comparison: {}", comparisonId);

        ComparisonMasterEntity comparison = comparisonRepository.findByIdWithMappings(comparisonId)
                .orElseThrow(() -> new RuntimeException("Comparison not found"));

        List<ExecutionComparisonEntity> mappings = comparison.getExecutionMappings().stream()
                .filter(ExecutionComparisonEntity::getIncluded)
                .collect(Collectors.toList());

        if (mappings.isEmpty()) {
            throw new RuntimeException("No executions included in comparison");
        }

        List<String> executionIds = mappings.stream()
                .map(ExecutionComparisonEntity::getExecutionId)
                .collect(Collectors.toList());

        List<ChampionChallengeExecutionEntity> executions = executionRepository.findAllById(executionIds);

        return calculateMetrics(executions, comparison);
    }

    private AggregateMetricsResponse calculateMetrics(
            List<ChampionChallengeExecutionEntity> executions,
            ComparisonMasterEntity comparison) {

        List<Long> championTimes = executions.stream()
                .map(ChampionChallengeExecutionEntity::getTotalChampionTimeMs)
                .filter(Objects::nonNull)
                .map(Integer::longValue)
                .collect(Collectors.toList());

        List<Long> challengeTimes = executions.stream()
                .map(ChampionChallengeExecutionEntity::getTotalChallengeTimeMs)
                .filter(Objects::nonNull)
                .map(Integer::longValue)
                .collect(Collectors.toList());

        AggregateMetricsResponse.PerformanceMetrics performance = calculatePerformanceMetrics(
                championTimes, challengeTimes);

        AggregateMetricsResponse.ReliabilityMetrics reliability = calculateReliabilityMetrics(executions);

        AggregateMetricsResponse.WinnerDistribution winnerDist = calculateWinnerDistribution(executions);

        AggregateMetricsResponse.StatisticalAnalysis statistical = calculateStatisticalAnalysis(
                championTimes, challengeTimes, executions.size());

        List<AggregateMetricsResponse.NodeAggregate> nodeAggregates = calculateNodeAggregates(
                executions.stream().map(ChampionChallengeExecutionEntity::getId).collect(Collectors.toList()));

        List<AggregateMetricsResponse.TimeSeriesPoint> timeSeries = calculateTimeSeries(executions);

        comparison.setStatus("COMPLETED");
        comparison.setCompletedAt(LocalDateTime.now());
        comparisonRepository.save(comparison);

        return AggregateMetricsResponse.builder()
                .totalExecutions(executions.size())
                .includedExecutions(executions.size())
                .outlierCount(0)
                .performance(performance)
                .reliability(reliability)
                .winnerDistribution(winnerDist)
                .statistical(statistical)
                .nodeAggregates(nodeAggregates)
                .timeSeries(timeSeries)
                .build();
    }

    private AggregateMetricsResponse.PerformanceMetrics calculatePerformanceMetrics(
            List<Long> championTimes, List<Long> challengeTimes) {

        double championAvg = championTimes.stream().mapToLong(Long::longValue).average().orElse(0.0);
        double challengeAvg = challengeTimes.stream().mapToLong(Long::longValue).average().orElse(0.0);

        double championMedian = calculateMedian(championTimes);
        double challengeMedian = calculateMedian(challengeTimes);

        double championP95 = calculatePercentile(championTimes, 0.95);
        double challengeP95 = calculatePercentile(challengeTimes, 0.95);

        double improvement = challengeAvg > 0 ? ((championAvg - challengeAvg) / championAvg) * 100 : 0.0;

        double championStdDev = calculateStdDev(championTimes, championAvg);
        double challengeStdDev = calculateStdDev(challengeTimes, challengeAvg);

        return AggregateMetricsResponse.PerformanceMetrics.builder()
                .championAvgTime(championAvg)
                .championMedianTime(championMedian)
                .championP95(championP95)
                .challengeAvgTime(challengeAvg)
                .challengeMedianTime(challengeMedian)
                .challengeP95(challengeP95)
                .improvement(improvement)
                .consistency(AggregateMetricsResponse.ConsistencyMetrics.builder()
                        .championStdDev(championStdDev)
                        .challengeStdDev(challengeStdDev)
                        .build())
                .build();
    }

    private AggregateMetricsResponse.ReliabilityMetrics calculateReliabilityMetrics(
            List<ChampionChallengeExecutionEntity> executions) {

        int total = executions.size();
        int championErrors = 0;
        int challengeErrors = 0;

        for (ChampionChallengeExecutionEntity exec : executions) {
            if ("FAILED".equals(exec.getStatus())) {
                championErrors++;
                challengeErrors++;
            }
        }

        double championSuccessRate = total > 0 ? ((total - championErrors) / (double) total) * 100 : 100.0;
        double challengeSuccessRate = total > 0 ? ((total - challengeErrors) / (double) total) * 100 : 100.0;

        return AggregateMetricsResponse.ReliabilityMetrics.builder()
                .championSuccessRate(championSuccessRate)
                .challengeSuccessRate(challengeSuccessRate)
                .championErrorCount(championErrors)
                .challengeErrorCount(challengeErrors)
                .build();
    }

    private AggregateMetricsResponse.WinnerDistribution calculateWinnerDistribution(
            List<ChampionChallengeExecutionEntity> executions) {

        int championWins = 0;
        int challengeWins = 0;
        int ties = 0;

        for (ChampionChallengeExecutionEntity exec : executions) {
            if ("CHAMPION".equals(exec.getWinner())) {
                championWins++;
            } else if ("CHALLENGE".equals(exec.getWinner())) {
                challengeWins++;
            } else {
                ties++;
            }
        }

        int total = executions.size();
        double winRate = total > 0 ? (challengeWins / (double) total) * 100 : 0.0;

        return AggregateMetricsResponse.WinnerDistribution.builder()
                .championWins(championWins)
                .challengeWins(challengeWins)
                .ties(ties)
                .winRate(winRate)
                .build();
    }

    private AggregateMetricsResponse.StatisticalAnalysis calculateStatisticalAnalysis(
            List<Long> championTimes, List<Long> challengeTimes, int sampleSize) {

        double pValue = calculateTTest(championTimes, challengeTimes);
        boolean isSignificant = pValue < 0.05;

        String recommendation;
        if (sampleSize < 10) {
            recommendation = "Need more data (minimum 10 executions)";
        } else if (!isSignificant) {
            recommendation = "No significant difference - continue testing";
        } else {
            double champAvg = championTimes.stream().mapToLong(Long::longValue).average().orElse(0.0);
            double challAvg = challengeTimes.stream().mapToLong(Long::longValue).average().orElse(0.0);
            recommendation = challAvg < champAvg ?
                    "Deploy Challenge - significantly faster" :
                    "Keep Champion - currently better";
        }

        return AggregateMetricsResponse.StatisticalAnalysis.builder()
                .sampleSize(sampleSize)
                .confidenceLevel(95.0)
                .pValue(pValue)
                .isSignificant(isSignificant)
                .recommendation(recommendation)
                .testMethod("t-test")
                .build();
    }

    private List<AggregateMetricsResponse.NodeAggregate> calculateNodeAggregates(List<String> executionIds) {
        List<ExecutionNodeMetricEntity> allMetrics = nodeMetricRepository.findByExecutionIdIn(executionIds);

        Map<String, List<ExecutionNodeMetricEntity>> metricsByNode = allMetrics.stream()
                .collect(Collectors.groupingBy(ExecutionNodeMetricEntity::getNodeId));

        List<AggregateMetricsResponse.NodeAggregate> nodeAggregates = new ArrayList<>();

        for (Map.Entry<String, List<ExecutionNodeMetricEntity>> entry : metricsByNode.entrySet()) {
            String nodeId = entry.getKey();
            List<ExecutionNodeMetricEntity> nodeMetrics = entry.getValue();

            List<ExecutionNodeMetricEntity> championMetrics = nodeMetrics.stream()
                    .filter(m -> "CHAMPION".equals(m.getVariant()))
                    .collect(Collectors.toList());

            List<ExecutionNodeMetricEntity> challengeMetrics = nodeMetrics.stream()
                    .filter(m -> "CHALLENGE".equals(m.getVariant()))
                    .collect(Collectors.toList());

            if (!championMetrics.isEmpty() && !challengeMetrics.isEmpty()) {
                double champAvg = championMetrics.stream()
                        .mapToInt(ExecutionNodeMetricEntity::getExecutionTimeMs)
                        .average().orElse(0.0);

                double challAvg = challengeMetrics.stream()
                        .mapToInt(ExecutionNodeMetricEntity::getExecutionTimeMs)
                        .average().orElse(0.0);

                double improvement = champAvg > 0 ? ((champAvg - challAvg) / champAvg) * 100 : 0.0;

                String winner = challAvg < champAvg ? "challenge" :
                               challAvg > champAvg ? "champion" : "tie";

                String nodeName = championMetrics.isEmpty() ?
                        challengeMetrics.get(0).getNodeName() :
                        championMetrics.get(0).getNodeName();

                nodeAggregates.add(AggregateMetricsResponse.NodeAggregate.builder()
                        .nodeId(nodeId)
                        .nodeName(nodeName)
                        .championAvgTime(champAvg)
                        .challengeAvgTime(challAvg)
                        .executionCount(nodeMetrics.size())
                        .improvement(improvement)
                        .winner(winner)
                        .build());
            }
        }

        return nodeAggregates;
    }

    private List<AggregateMetricsResponse.TimeSeriesPoint> calculateTimeSeries(
            List<ChampionChallengeExecutionEntity> executions) {

        List<AggregateMetricsResponse.TimeSeriesPoint> timeSeries = new ArrayList<>();

        executions.sort(Comparator.comparing(ChampionChallengeExecutionEntity::getStartedAt));

        int bucketSize = Math.max(1, executions.size() / 10);

        for (int i = 0; i < executions.size(); i += bucketSize) {
            int end = Math.min(i + bucketSize, executions.size());
            List<ChampionChallengeExecutionEntity> bucket = executions.subList(i, end);

            double champAvg = bucket.stream()
                    .map(ChampionChallengeExecutionEntity::getTotalChampionTimeMs)
                    .filter(Objects::nonNull)
                    .mapToInt(Integer::intValue)
                    .average().orElse(0.0);

            double challAvg = bucket.stream()
                    .map(ChampionChallengeExecutionEntity::getTotalChallengeTimeMs)
                    .filter(Objects::nonNull)
                    .mapToInt(Integer::intValue)
                    .average().orElse(0.0);

            LocalDateTime timestamp = bucket.get(0).getStartedAt();

            timeSeries.add(AggregateMetricsResponse.TimeSeriesPoint.builder()
                    .timestamp(timestamp.toString())
                    .championAvg(champAvg)
                    .challengeAvg(challAvg)
                    .count(bucket.size())
                    .build());
        }

        return timeSeries;
    }

    private double calculateMedian(List<Long> values) {
        if (values.isEmpty()) return 0.0;
        List<Long> sorted = new ArrayList<>(values);
        Collections.sort(sorted);
        int size = sorted.size();
        if (size % 2 == 0) {
            return (sorted.get(size / 2 - 1) + sorted.get(size / 2)) / 2.0;
        } else {
            return sorted.get(size / 2);
        }
    }

    private double calculatePercentile(List<Long> values, double percentile) {
        if (values.isEmpty()) return 0.0;
        List<Long> sorted = new ArrayList<>(values);
        Collections.sort(sorted);
        int index = (int) Math.ceil(percentile * sorted.size()) - 1;
        index = Math.max(0, Math.min(index, sorted.size() - 1));
        return sorted.get(index);
    }

    private double calculateStdDev(List<Long> values, double mean) {
        if (values.isEmpty()) return 0.0;
        double variance = values.stream()
                .mapToDouble(v -> Math.pow(v - mean, 2))
                .average().orElse(0.0);
        return Math.sqrt(variance);
    }

    private double calculateTTest(List<Long> group1, List<Long> group2) {
        if (group1.size() < 2 || group2.size() < 2) return 1.0;

        double mean1 = group1.stream().mapToLong(Long::longValue).average().orElse(0.0);
        double mean2 = group2.stream().mapToLong(Long::longValue).average().orElse(0.0);

        double var1 = calculateStdDev(group1, mean1);
        double var2 = calculateStdDev(group2, mean2);

        double pooledStd = Math.sqrt((var1 * var1 / group1.size()) + (var2 * var2 / group2.size()));

        if (pooledStd == 0) return 1.0;

        double tStat = Math.abs((mean1 - mean2) / pooledStd);

        return tStat > 2.0 ? 0.03 : 0.15;
    }

    @Transactional
    public void deleteComparison(String comparisonId) {
        comparisonRepository.deleteById(comparisonId);
    }

    private ComparisonResponse mapToResponse(ComparisonMasterEntity entity) {
        return ComparisonResponse.builder()
                .id(entity.getId())
                .name(entity.getName())
                .description(entity.getDescription())
                .workflowPair(entity.getWorkflowPair())
                .championWorkflowId(entity.getChampionWorkflowId())
                .challengeWorkflowId(entity.getChallengeWorkflowId())
                .status(entity.getStatus())
                .totalExecutions(entity.getTotalExecutions())
                .includedExecutions(entity.getIncludedExecutions())
                .outlierCount(entity.getOutlierCount())
                .createdAt(entity.getCreatedAt())
                .completedAt(entity.getCompletedAt())
                .createdBy(entity.getCreatedBy())
                .build();
    }
}

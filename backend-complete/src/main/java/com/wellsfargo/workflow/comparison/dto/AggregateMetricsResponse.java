package com.wellsfargo.workflow.comparison.dto;

import lombok.*;

import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AggregateMetricsResponse {
    private Integer totalExecutions;
    private Integer includedExecutions;
    private Integer outlierCount;
    private PerformanceMetrics performance;
    private ReliabilityMetrics reliability;
    private WinnerDistribution winnerDistribution;
    private StatisticalAnalysis statistical;
    private List<NodeAggregate> nodeAggregates;
    private List<TimeSeriesPoint> timeSeries;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PerformanceMetrics {
        private Double championAvgTime;
        private Double championMedianTime;
        private Double championP95;
        private Double challengeAvgTime;
        private Double challengeMedianTime;
        private Double challengeP95;
        private Double improvement;
        private ConsistencyMetrics consistency;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ConsistencyMetrics {
        private Double championStdDev;
        private Double challengeStdDev;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ReliabilityMetrics {
        private Double championSuccessRate;
        private Double challengeSuccessRate;
        private Integer championErrorCount;
        private Integer challengeErrorCount;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class WinnerDistribution {
        private Integer championWins;
        private Integer challengeWins;
        private Integer ties;
        private Double winRate;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class StatisticalAnalysis {
        private Integer sampleSize;
        private Double confidenceLevel;
        private Double pValue;
        private Boolean isSignificant;
        private String recommendation;
        private String testMethod;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class NodeAggregate {
        private String nodeId;
        private String nodeName;
        private Double championAvgTime;
        private Double challengeAvgTime;
        private Integer executionCount;
        private Double improvement;
        private String winner;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TimeSeriesPoint {
        private String timestamp;
        private Double championAvg;
        private Double challengeAvg;
        private Integer count;
    }
}

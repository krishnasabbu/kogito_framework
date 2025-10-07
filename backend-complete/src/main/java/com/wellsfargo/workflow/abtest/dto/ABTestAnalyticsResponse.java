package com.wellsfargo.workflow.abtest.dto;

import lombok.*;
import java.util.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ABTestAnalyticsResponse {
    private OverviewMetrics overview;
    private List<ArmPerformance> armPerformance;
    private List<TimeSeriesData> timeSeries;
    private StatisticalAnalysis statisticalAnalysis;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class OverviewMetrics {
        private Long totalExecutions;
        private Long totalSuccessful;
        private Long totalFailed;
        private Double overallSuccessRate;
        private Double avgExecutionTime;
        private String currentWinner;
        private Double winnerConfidence;
        private Boolean isStatisticallySignificant;
        private Integer sampleSizeReached;
        private Integer sampleSizeTarget;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ArmPerformance {
        private String armId;
        private String armName;
        private Boolean isControl;
        private Long executions;
        private Double successRate;
        private Double errorRate;
        private Double avgExecutionTime;
        private Double p50Latency;
        private Double p95Latency;
        private Double p99Latency;
        private Double improvementVsControl;
        private String status;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TimeSeriesData {
        private String timestamp;
        private Map<String, Long> executionsByArm;
        private Map<String, Double> successRateByArm;
        private Map<String, Double> avgLatencyByArm;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class StatisticalAnalysis {
        private String testType;
        private Double pValue;
        private Double confidenceLevel;
        private Boolean isSignificant;
        private Double effectSize;
        private Integer degreesOfFreedom;
        private String interpretation;
        private String recommendation;
        private Double minimumDetectableEffect;
        private Integer requiredSampleSize;
    }
}

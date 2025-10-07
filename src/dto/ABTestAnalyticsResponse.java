package com.wellsfargo.abtest.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;
import java.util.List;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ABTestAnalyticsResponse {

    private OverviewMetrics overview;
    private List<ArmPerformance> armPerformance;
    private List<TimeSeriesData> timeSeries;
    private StatisticalAnalysis statisticalAnalysis;
    private List<LatencyDistribution> latencyDistribution;
    private ConversionFunnel conversionFunnel;
    private List<ErrorAnalysis> errorAnalysis;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
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
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
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
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class TimeSeriesData {
        private String timestamp;
        private Map<String, Long> executionsByArm;
        private Map<String, Double> successRateByArm;
        private Map<String, Double> avgLatencyByArm;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
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

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class LatencyDistribution {
        private String armId;
        private String armName;
        private List<LatencyBucket> buckets;
        private Double median;
        private Double mean;
        private Double standardDeviation;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class LatencyBucket {
        private String range;
        private Long count;
        private Double percentage;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ConversionFunnel {
        private List<FunnelStep> steps;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class FunnelStep {
        private String stepName;
        private Map<String, Long> countByArm;
        private Map<String, Double> conversionRateByArm;
        private Map<String, Double> dropOffRateByArm;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ErrorAnalysis {
        private String armId;
        private String armName;
        private Long totalErrors;
        private Double errorRate;
        private Map<String, Long> errorsByType;
        private List<TopError> topErrors;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class TopError {
        private String errorMessage;
        private Long count;
        private Double percentage;
        private String firstOccurrence;
        private String lastOccurrence;
    }
}

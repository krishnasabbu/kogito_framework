package com.wellsfargo.workflow.championchallenge.dto;

import lombok.*;
import java.util.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AnalyticsResponse {
    private SummaryCards summaryCards;
    private List<ExecutionTimeData> executionTimeData;
    private List<PieData> pieData;
    private List<SuccessRateData> successRateData;
    private List<CumulativeData> cumulativeData;
    private RadarData radarData;
    private List<PerformanceComparison> performanceComparison;
    private DetailedStatistics detailedStatistics;

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class SummaryCards {
        private Long championTime;
        private Long challengeTime;
        private String winner;
        private Double improvement;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class ExecutionTimeData {
        private String node;
        private Long champion;
        private Long challenge;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class PieData {
        private String name;
        private Long value;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class SuccessRateData {
        private String variant;
        private Long success;
        private Long error;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class CumulativeData {
        private String node;
        private Long championCumulative;
        private Long challengeCumulative;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class RadarData {
        private List<String> metrics;
        private List<Double> champion;
        private List<Double> challenge;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class PerformanceComparison {
        private String metric;
        private Double championValue;
        private Double challengeValue;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class DetailedStatistics {
        private Long totalChampionNodes;
        private Long totalChallengeNodes;
        private Long championSuccess;
        private Long challengeSuccess;
        private Double championSuccessRate;
        private Double challengeSuccessRate;
    }
}

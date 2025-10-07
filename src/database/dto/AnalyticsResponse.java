package com.wellsfargo.championchallenge.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AnalyticsResponse {

    private SummaryCards summaryCards;
    private List<ExecutionTimeData> executionTimeData;
    private List<PieData> pieData;
    private List<SuccessRateData> successRateData;
    private List<CumulativeData> cumulativeData;
    private List<RadarData> radarData;
    private List<PerformanceComparison> performanceComparison;
    private DetailedStatistics detailedStatistics;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class SummaryCards {
        private Long championTotalTime;
        private Long challengeTotalTime;
        private Double improvementPercentage;
        private String winner;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ExecutionTimeData {
        private String name;
        private Long champion;
        private Long challenge;
        private Long difference;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class PieData {
        private String name;
        private Long value;
        private String color;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class SuccessRateData {
        private String name;
        private Integer success;
        private Integer error;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class CumulativeData {
        private String name;
        private Long championCumulative;
        private Long challengeCumulative;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class RadarData {
        private String metric;
        private Double champion;
        private Double challenge;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class PerformanceComparison {
        private String metric;
        private Double champion;
        private Double challenge;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class DetailedStatistics {
        private ChampionStats championStats;
        private ChallengeStats challengeStats;
        private ComparisonStats comparisonStats;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ChampionStats {
        private Long totalTime;
        private Double averageTime;
        private Integer totalNodes;
        private Integer successfulNodes;
        private Integer errorNodes;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ChallengeStats {
        private Long totalTime;
        private Double averageTime;
        private Integer totalNodes;
        private Integer successfulNodes;
        private Integer errorNodes;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ComparisonStats {
        private Long timeDifference;
        private String fasterVariant;
        private Double improvement;
        private Double successRateDiff;
    }
}

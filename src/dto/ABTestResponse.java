package com.wellsfargo.abtest.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;
import com.wellsfargo.abtest.entity.ABTestEntity.TestStatus;
import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ABTestResponse {

    private String id;
    private String name;
    private String description;
    private String workflowId;
    private Integer trafficSplit;
    private TestStatus status;
    private LocalDateTime startedAt;
    private LocalDateTime endedAt;
    private LocalDateTime createdAt;
    private String createdBy;
    private String hypothesis;
    private String successMetric;
    private Integer minimumSampleSize;
    private Double confidenceLevel;
    private List<TestArmResponse> arms;
    private TestSummary summary;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class TestArmResponse {
        private String id;
        private String name;
        private String description;
        private String bpmnFilePath;
        private Integer trafficPercentage;
        private Boolean isControl;
        private Long totalExecutions;
        private Long successfulExecutions;
        private Long failedExecutions;
        private Double avgExecutionTimeMs;
        private Long minExecutionTimeMs;
        private Long maxExecutionTimeMs;
        private Long totalExecutionTimeMs;
        private Double successRate;
        private Double errorRate;
        private Double p50Latency;
        private Double p95Latency;
        private Double p99Latency;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class TestSummary {
        private Long totalExecutions;
        private String winningArm;
        private Double confidenceScore;
        private Boolean isStatisticallySignificant;
        private String recommendation;
    }
}

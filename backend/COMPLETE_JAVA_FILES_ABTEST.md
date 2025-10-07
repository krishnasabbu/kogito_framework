# Complete A/B Testing Java Files

Due to file length, here are ALL the remaining A/B Testing files you need to copy:

## File: abtest/dto/ABTestRequest.java
```java
package com.wellsfargo.workflow.abtest.dto;

import jakarta.validation.constraints.*;
import lombok.*;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ABTestRequest {
    @NotBlank(message = "Name is required")
    private String name;
    private String description;
    @NotBlank(message = "Workflow ID is required")
    private String workflowId;
    @Min(0) @Max(100)
    private Integer trafficSplit = 50;
    private String hypothesis;
    private String successMetric;
    @Min(1)
    private Integer minimumSampleSize = 100;
    @Min(0) @Max(1)
    private Double confidenceLevel = 0.95;
    @NotNull
    @Size(min = 2, message = "At least 2 arms required")
    private List<TestArmRequest> arms;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TestArmRequest {
        @NotBlank
        private String name;
        private String description;
        @NotBlank
        private String bpmnFilePath;
        @NotNull @Min(0) @Max(100)
        private Integer trafficPercentage;
        @NotNull
        private Boolean isControl;
    }
}
```

## File: abtest/dto/ABTestResponse.java
```java
package com.wellsfargo.workflow.abtest.dto;

import lombok.*;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ABTestResponse {
    private String id;
    private String name;
    private String description;
    private String workflowId;
    private Integer trafficSplit;
    private String status;
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
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
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
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TestSummary {
        private Long totalExecutions;
        private String winningArm;
        private Double confidenceScore;
        private Boolean isStatisticallySignificant;
        private String recommendation;
    }
}
```

## File: abtest/dto/ExecuteABTestRequest.java
```java
package com.wellsfargo.workflow.abtest.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ExecuteABTestRequest {
    private String requestPayload;
    private String userId;
    private String sessionId;
    private String metadata;
}
```

## File: abtest/dto/ExecutionResultResponse.java
```java
package com.wellsfargo.workflow.abtest.dto;

import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ExecutionResultResponse {
    private String testId;
    private String selectedArmId;
    private String status;
    private Long executionTimeMs;
}
```

## File: abtest/dto/ABTestAnalyticsResponse.java
```java
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

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
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

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
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

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class TimeSeriesData {
        private String timestamp;
        private Map<String, Long> executionsByArm;
        private Map<String, Double> successRateByArm;
        private Map<String, Double> avgLatencyByArm;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
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
```

## File: abtest/exception/ABTestException.java
```java
package com.wellsfargo.workflow.abtest.exception;

public class ABTestException extends RuntimeException {
    public ABTestException(String message) {
        super(message);
    }

    public ABTestException(String message, Throwable cause) {
        super(message, cause);
    }
}
```

Copy each file to the appropriate directory in your Spring Boot project!

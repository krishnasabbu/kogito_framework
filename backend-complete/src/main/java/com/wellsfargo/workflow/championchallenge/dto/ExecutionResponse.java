package com.wellsfargo.workflow.championchallenge.dto;

import lombok.*;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ExecutionResponse {
    private String id;
    private String name;
    private String description;
    private String championWorkflowId;
    private String challengeWorkflowId;
    private String requestPayload;
    private String status;
    private LocalDateTime startedAt;
    private LocalDateTime completedAt;
    private LocalDateTime createdAt;
    private String createdBy;
    private Long totalChampionTimeMs;
    private Long totalChallengeTimeMs;
    private String winner;
    private List<NodeMetricResponse> championMetrics;
    private List<NodeMetricResponse> challengeMetrics;
}

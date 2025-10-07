package com.wellsfargo.championchallenge.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;
import com.wellsfargo.championchallenge.entity.ChampionChallengeExecutionEntity.ExecutionStatus;
import com.wellsfargo.championchallenge.entity.ChampionChallengeExecutionEntity.Winner;
import java.time.LocalDateTime;
import java.util.List;
import com.fasterxml.jackson.databind.JsonNode;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ExecutionResponse {

    private String id;
    private String name;
    private String description;
    private String championWorkflowId;
    private String challengeWorkflowId;
    private JsonNode requestPayload;
    private ExecutionStatus status;
    private LocalDateTime startedAt;
    private LocalDateTime completedAt;
    private LocalDateTime createdAt;
    private String createdBy;
    private Long totalChampionTimeMs;
    private Long totalChallengeTimeMs;
    private Winner winner;
    private ExecutionMetrics metrics;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ExecutionMetrics {
        private List<NodeMetricResponse> champion;
        private List<NodeMetricResponse> challenge;
    }
}

package com.wellsfargo.championchallenge.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;
import com.wellsfargo.championchallenge.entity.ExecutionNodeMetricEntity.Variant;
import com.wellsfargo.championchallenge.entity.ExecutionNodeMetricEntity.MetricStatus;
import com.fasterxml.jackson.databind.JsonNode;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NodeMetricResponse {

    private String id;
    private String executionId;
    private Variant variant;
    private String nodeId;
    private String nodeName;
    private String nodeType;
    private JsonNode requestData;
    private JsonNode responseData;
    private Long executionTimeMs;
    private MetricStatus status;
    private String errorMessage;
    private LocalDateTime startedAt;
    private LocalDateTime completedAt;
    private JsonNode metadata;
}

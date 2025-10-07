package com.wellsfargo.workflow.championchallenge.dto;

import lombok.*;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NodeMetricResponse {
    private String id;
    private String variant;
    private String nodeId;
    private String nodeName;
    private String nodeType;
    private String requestData;
    private String responseData;
    private Long executionTimeMs;
    private String status;
    private String errorMessage;
    private LocalDateTime startedAt;
    private LocalDateTime completedAt;
    private String metadata;
}

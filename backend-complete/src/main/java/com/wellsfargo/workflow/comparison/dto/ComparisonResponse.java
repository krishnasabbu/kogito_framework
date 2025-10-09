package com.wellsfargo.workflow.comparison.dto;

import lombok.*;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ComparisonResponse {
    private String id;
    private String name;
    private String description;
    private String workflowPair;
    private String championWorkflowId;
    private String challengeWorkflowId;
    private String status;
    private Integer totalExecutions;
    private Integer includedExecutions;
    private Integer outlierCount;
    private LocalDateTime createdAt;
    private LocalDateTime completedAt;
    private String createdBy;
}

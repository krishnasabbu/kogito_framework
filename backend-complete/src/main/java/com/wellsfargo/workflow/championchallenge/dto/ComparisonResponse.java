package com.wellsfargo.workflow.championchallenge.dto;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class ComparisonResponse {
    private String id;
    private String name;
    private String description;
    private String championWorkflowId;
    private String challengeWorkflowId;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private String createdBy;
    private Long totalExecutions;
    private Long completedExecutions;
    private Long runningExecutions;
    private Long failedExecutions;
    private LocalDateTime lastExecutionAt;
}

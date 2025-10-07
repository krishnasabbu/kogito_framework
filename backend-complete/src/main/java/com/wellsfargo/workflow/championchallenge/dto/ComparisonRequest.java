package com.wellsfargo.workflow.championchallenge.dto;

import lombok.Data;

@Data
public class ComparisonRequest {
    private String name;
    private String description;
    private String championWorkflowId;
    private String challengeWorkflowId;
}

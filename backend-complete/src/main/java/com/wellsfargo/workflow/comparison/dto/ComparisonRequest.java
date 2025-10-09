package com.wellsfargo.workflow.comparison.dto;

import lombok.*;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ComparisonRequest {
    private String name;
    private String description;
    private String championWorkflowId;
    private String challengeWorkflowId;
    private List<String> executionIds;
}

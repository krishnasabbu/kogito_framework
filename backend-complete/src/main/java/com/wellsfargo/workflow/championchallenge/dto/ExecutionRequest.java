package com.wellsfargo.workflow.championchallenge.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ExecutionRequest {
    @NotBlank
    private String name;
    private String description;
    @NotBlank
    private String championWorkflowId;
    @NotBlank
    private String challengeWorkflowId;
    private String requestPayload;
}

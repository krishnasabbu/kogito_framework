package com.wellsfargo.championchallenge.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import com.fasterxml.jackson.databind.JsonNode;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ExecutionRequest {

    @NotBlank(message = "Name is required")
    private String name;

    private String description;

    @NotBlank(message = "Champion workflow ID is required")
    private String championWorkflowId;

    @NotBlank(message = "Challenge workflow ID is required")
    private String challengeWorkflowId;

    @NotNull(message = "Request payload is required")
    private JsonNode requestPayload;
}

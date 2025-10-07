package com.wellsfargo.abtest.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import com.fasterxml.jackson.databind.JsonNode;
import jakarta.validation.constraints.NotNull;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ExecuteABTestRequest {

    @NotNull(message = "Request payload is required")
    private JsonNode requestPayload;

    private String userId;
    private String sessionId;
    private JsonNode metadata;
}

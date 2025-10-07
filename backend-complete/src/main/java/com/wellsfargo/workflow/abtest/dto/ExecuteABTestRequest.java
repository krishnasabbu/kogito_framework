package com.wellsfargo.workflow.abtest.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ExecuteABTestRequest {
    private String requestPayload;
    private String userId;
    private String sessionId;
    private String metadata;
}

package com.wellsfargo.workflow.abtest.dto;

import lombok.*;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ExecutionResultResponse {
    private String testId;
    private String executionId;
    private String selectedArmId;
    private String status;
    private Long executionTimeMs;
    private LocalDateTime timestamp;
    private String errorMessage;
    private String requestPayload;
    private String userId;
    private String sessionId;
}

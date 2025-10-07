package com.wellsfargo.workflow.abtest.dto;

import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ExecutionResultResponse {
    private String testId;
    private String selectedArmId;
    private String status;
    private Long executionTimeMs;
}

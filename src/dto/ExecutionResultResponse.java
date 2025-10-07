package com.wellsfargo.abtest.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ExecutionResultResponse {
    private String testId;
    private String selectedArmId;
    private String status;
}

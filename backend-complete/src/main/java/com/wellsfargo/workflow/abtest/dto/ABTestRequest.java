package com.wellsfargo.workflow.abtest.dto;

import jakarta.validation.constraints.*;
import lombok.*;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ABTestRequest {
    @NotBlank
    private String name;
    private String description;
    @NotBlank
    private String workflowId;
    private Integer trafficSplit = 50;
    private String hypothesis;
    private String successMetric;
    private Integer minimumSampleSize = 100;
    private Double confidenceLevel = 0.95;
    @NotNull
    @Size(min = 2)
    private List<TestArmRequest> arms;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TestArmRequest {
        @NotBlank
        private String name;
        private String description;
        @NotBlank
        private String bpmnFilePath;
        @NotNull
        private Integer trafficPercentage;
        @NotNull
        private Boolean isControl;
    }
}

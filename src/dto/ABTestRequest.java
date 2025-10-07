package com.wellsfargo.abtest.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Max;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ABTestRequest {

    @NotBlank(message = "Test name is required")
    private String name;

    private String description;

    @NotBlank(message = "Workflow ID is required")
    private String workflowId;

    @NotNull(message = "Traffic split is required")
    @Min(value = 0, message = "Traffic split must be between 0 and 100")
    @Max(value = 100, message = "Traffic split must be between 0 and 100")
    private Integer trafficSplit;

    private String hypothesis;

    private String successMetric;

    @Min(value = 1, message = "Minimum sample size must be at least 1")
    private Integer minimumSampleSize;

    @Min(value = 0, message = "Confidence level must be between 0 and 1")
    @Max(value = 1, message = "Confidence level must be between 0 and 1")
    private Double confidenceLevel;

    @NotNull(message = "At least one test arm is required")
    private List<TestArmRequest> arms;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TestArmRequest {
        @NotBlank(message = "Arm name is required")
        private String name;

        private String description;

        @NotBlank(message = "BPMN file path is required")
        private String bpmnFilePath;

        @NotNull(message = "Traffic percentage is required")
        @Min(value = 0, message = "Traffic percentage must be between 0 and 100")
        @Max(value = 100, message = "Traffic percentage must be between 0 and 100")
        private Integer trafficPercentage;

        @NotNull(message = "Control flag is required")
        private Boolean isControl;
    }
}

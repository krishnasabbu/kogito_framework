package com.wellsfargo.workflow.championchallenge.dto;

import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ComparisonResponse {
    private String id;
    private String metricName;
    private String metricCategory;
    private Double championValue;
    private Double challengeValue;
    private Double difference;
    private Double differencePercentage;
    private String winner;
    private String unit;
}

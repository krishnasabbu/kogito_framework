package com.wellsfargo.workflow.championchallenge.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.GenericGenerator;
import java.time.LocalDateTime;

@Entity
@Table(name = "execution_comparisons")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ExecutionComparisonEntity {

    @Id
    @GeneratedValue(generator = "uuid")
    @GenericGenerator(name = "uuid", strategy = "org.hibernate.id.UUIDGenerator")
    @Column(name = "id", length = 36)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "execution_id", nullable = false)
    private ChampionChallengeExecutionEntity execution;

    @Column(name = "metric_name", nullable = false)
    private String metricName;

    @Column(name = "metric_category", nullable = false, length = 100)
    private String metricCategory;

    @Column(name = "champion_value", nullable = false)
    private Double championValue;

    @Column(name = "challenge_value", nullable = false)
    private Double challengeValue;

    @Column(name = "difference", nullable = false)
    private Double difference;

    @Column(name = "difference_percentage", nullable = false)
    private Double differencePercentage;

    @Column(name = "winner", nullable = false, length = 50)
    private String winner;

    @Column(name = "unit", length = 50)
    private String unit;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) createdAt = LocalDateTime.now();
    }
}

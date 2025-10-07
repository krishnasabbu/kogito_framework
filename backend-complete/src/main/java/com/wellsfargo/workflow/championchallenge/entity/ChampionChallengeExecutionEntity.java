package com.wellsfargo.workflow.championchallenge.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.GenericGenerator;
import java.time.LocalDateTime;
import java.util.*;

@Entity
@Table(name = "champion_challenge_executions")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ChampionChallengeExecutionEntity {

    @Id
    @GeneratedValue(generator = "uuid")
    @GenericGenerator(name = "uuid", strategy = "org.hibernate.id.UUIDGenerator")
    @Column(name = "id", length = 36)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "comparison_id", nullable = false)
    private ComparisonEntity comparison;

    @Column(name = "request_payload", columnDefinition = "TEXT")
    private String requestPayload;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", length = 50)
    private ExecutionStatus status = ExecutionStatus.PENDING;

    @Column(name = "started_at")
    private LocalDateTime startedAt;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "created_by", nullable = false)
    private String createdBy;

    @Column(name = "total_champion_time_ms")
    private Long totalChampionTimeMs = 0L;

    @Column(name = "total_challenge_time_ms")
    private Long totalChallengeTimeMs = 0L;

    @Column(name = "winner", length = 50)
    private String winner;

    @OneToMany(mappedBy = "execution", cascade = CascadeType.ALL, fetch = FetchType.LAZY, orphanRemoval = true)
    private List<ExecutionNodeMetricEntity> nodeMetrics = new ArrayList<>();

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) createdAt = LocalDateTime.now();
        if (status == null) status = ExecutionStatus.PENDING;
    }

    public enum ExecutionStatus {
        PENDING, RUNNING, COMPLETED, FAILED
    }

    public void addNodeMetric(ExecutionNodeMetricEntity metric) {
        nodeMetrics.add(metric);
        metric.setExecution(this);
    }
}

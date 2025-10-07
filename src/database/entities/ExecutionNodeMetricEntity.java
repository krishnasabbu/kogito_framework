package com.wellsfargo.championchallenge.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import org.hibernate.annotations.GenericGenerator;
import java.time.LocalDateTime;
import com.fasterxml.jackson.annotation.JsonBackReference;

@Entity
@Table(name = "execution_node_metrics")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ExecutionNodeMetricEntity {

    @Id
    @GeneratedValue(generator = "UUID")
    @GenericGenerator(name = "UUID", strategy = "org.hibernate.id.UUIDGenerator")
    @Column(name = "id", updatable = false, nullable = false)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "execution_id", nullable = false)
    @JsonBackReference
    private ChampionChallengeExecutionEntity execution;

    @Column(name = "variant", nullable = false)
    @Enumerated(EnumType.STRING)
    private Variant variant;

    @Column(name = "node_id", nullable = false)
    private String nodeId;

    @Column(name = "node_name", nullable = false)
    private String nodeName;

    @Column(name = "node_type", nullable = false)
    private String nodeType;

    @Column(name = "request_data", columnDefinition = "JSONB")
    private String requestData;

    @Column(name = "response_data", columnDefinition = "JSONB")
    private String responseData;

    @Column(name = "execution_time_ms", nullable = false)
    private Long executionTimeMs;

    @Column(name = "status", nullable = false)
    @Enumerated(EnumType.STRING)
    private MetricStatus status;

    @Column(name = "error_message", columnDefinition = "TEXT")
    private String errorMessage;

    @Column(name = "started_at", nullable = false)
    private LocalDateTime startedAt;

    @Column(name = "completed_at", nullable = false)
    private LocalDateTime completedAt;

    @Column(name = "metadata", columnDefinition = "JSONB")
    private String metadata;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    public enum Variant {
        CHAMPION,
        CHALLENGE
    }

    public enum MetricStatus {
        SUCCESS,
        ERROR,
        SKIPPED
    }
}

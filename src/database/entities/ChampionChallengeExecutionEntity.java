package com.wellsfargo.championchallenge.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import org.hibernate.annotations.GenericGenerator;
import java.time.LocalDateTime;
import java.util.List;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.annotation.JsonManagedReference;

@Entity
@Table(name = "champion_challenge_executions")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ChampionChallengeExecutionEntity {

    @Id
    @GeneratedValue(generator = "UUID")
    @GenericGenerator(name = "UUID", strategy = "org.hibernate.id.UUIDGenerator")
    @Column(name = "id", updatable = false, nullable = false)
    private String id;

    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "champion_workflow_id", nullable = false)
    private String championWorkflowId;

    @Column(name = "challenge_workflow_id", nullable = false)
    private String challengeWorkflowId;

    @Column(name = "request_payload", columnDefinition = "JSONB")
    private String requestPayload;

    @Column(name = "status", nullable = false)
    @Enumerated(EnumType.STRING)
    private ExecutionStatus status;

    @Column(name = "started_at")
    private LocalDateTime startedAt;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "created_by", nullable = false)
    private String createdBy;

    @Column(name = "total_champion_time_ms")
    private Long totalChampionTimeMs;

    @Column(name = "total_challenge_time_ms")
    private Long totalChallengeTimeMs;

    @Column(name = "winner")
    @Enumerated(EnumType.STRING)
    private Winner winner;

    @OneToMany(mappedBy = "execution", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonManagedReference
    private List<ExecutionNodeMetricEntity> metrics;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        if (status == null) {
            status = ExecutionStatus.PENDING;
        }
    }

    public enum ExecutionStatus {
        PENDING,
        RUNNING,
        COMPLETED,
        FAILED
    }

    public enum Winner {
        CHAMPION,
        CHALLENGE,
        TIE
    }
}

package com.wellsfargo.abtest.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import org.hibernate.annotations.GenericGenerator;
import java.time.LocalDateTime;

@Entity
@Table(name = "ab_test_executions")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ABTestExecutionEntity {

    @Id
    @GeneratedValue(generator = "UUID")
    @GenericGenerator(name = "UUID", strategy = "org.hibernate.id.UUIDGenerator")
    @Column(name = "id", updatable = false, nullable = false)
    private String id;

    @Column(name = "ab_test_id", nullable = false)
    private String abTestId;

    @Column(name = "arm_id", nullable = false)
    private String armId;

    @Column(name = "request_payload", columnDefinition = "JSONB")
    private String requestPayload;

    @Column(name = "response_payload", columnDefinition = "JSONB")
    private String responsePayload;

    @Column(name = "execution_time_ms", nullable = false)
    private Long executionTimeMs;

    @Column(name = "status", nullable = false)
    @Enumerated(EnumType.STRING)
    private ExecutionStatus status;

    @Column(name = "error_message", columnDefinition = "TEXT")
    private String errorMessage;

    @Column(name = "user_id")
    private String userId;

    @Column(name = "session_id")
    private String sessionId;

    @Column(name = "metadata", columnDefinition = "JSONB")
    private String metadata;

    @Column(name = "started_at", nullable = false)
    private LocalDateTime startedAt;

    @Column(name = "completed_at", nullable = false)
    private LocalDateTime completedAt;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    public enum ExecutionStatus {
        SUCCESS,
        ERROR,
        TIMEOUT,
        SKIPPED
    }
}

package com.wellsfargo.abtest.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import org.hibernate.annotations.GenericGenerator;
import com.fasterxml.jackson.annotation.JsonBackReference;
import java.time.LocalDateTime;

@Entity
@Table(name = "ab_test_arms")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ABTestArmEntity {

    @Id
    @GeneratedValue(generator = "UUID")
    @GenericGenerator(name = "UUID", strategy = "org.hibernate.id.UUIDGenerator")
    @Column(name = "id", updatable = false, nullable = false)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ab_test_id", nullable = false)
    @JsonBackReference
    private ABTestEntity abTest;

    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "bpmn_file_path", nullable = false)
    private String bpmnFilePath;

    @Column(name = "traffic_percentage", nullable = false)
    private Integer trafficPercentage;

    @Column(name = "is_control", nullable = false)
    private Boolean isControl;

    @Column(name = "total_executions")
    private Long totalExecutions;

    @Column(name = "successful_executions")
    private Long successfulExecutions;

    @Column(name = "failed_executions")
    private Long failedExecutions;

    @Column(name = "avg_execution_time_ms")
    private Double avgExecutionTimeMs;

    @Column(name = "min_execution_time_ms")
    private Long minExecutionTimeMs;

    @Column(name = "max_execution_time_ms")
    private Long maxExecutionTimeMs;

    @Column(name = "total_execution_time_ms")
    private Long totalExecutionTimeMs;

    @Column(name = "success_rate")
    private Double successRate;

    @Column(name = "error_rate")
    private Double errorRate;

    @Column(name = "p50_latency")
    private Double p50Latency;

    @Column(name = "p95_latency")
    private Double p95Latency;

    @Column(name = "p99_latency")
    private Double p99Latency;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (totalExecutions == null) totalExecutions = 0L;
        if (successfulExecutions == null) successfulExecutions = 0L;
        if (failedExecutions == null) failedExecutions = 0L;
        if (totalExecutionTimeMs == null) totalExecutionTimeMs = 0L;
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
        calculateMetrics();
    }

    private void calculateMetrics() {
        if (totalExecutions > 0) {
            successRate = (successfulExecutions / (double) totalExecutions) * 100;
            errorRate = (failedExecutions / (double) totalExecutions) * 100;
            if (totalExecutionTimeMs > 0) {
                avgExecutionTimeMs = totalExecutionTimeMs / (double) totalExecutions;
            }
        }
    }
}

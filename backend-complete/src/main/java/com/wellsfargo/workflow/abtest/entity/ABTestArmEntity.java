package com.wellsfargo.workflow.abtest.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.GenericGenerator;

import java.time.LocalDateTime;

@Entity
@Table(name = "ab_test_arms")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ABTestArmEntity {

    @Id
    @GeneratedValue(generator = "uuid")
    @GenericGenerator(name = "uuid", strategy = "org.hibernate.id.UUIDGenerator")
    @Column(name = "id", length = 36)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ab_test_id", nullable = false)
    private ABTestEntity abTest;

    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "bpmn_file_path", nullable = false, length = 500)
    private String bpmnFilePath;

    @Column(name = "traffic_percentage", nullable = false)
    private Integer trafficPercentage;

    @Column(name = "is_control", nullable = false)
    private Boolean isControl = false;

    @Column(name = "total_executions")
    private Long totalExecutions = 0L;

    @Column(name = "successful_executions")
    private Long successfulExecutions = 0L;

    @Column(name = "failed_executions")
    private Long failedExecutions = 0L;

    @Column(name = "avg_execution_time_ms")
    private Double avgExecutionTimeMs = 0.0;

    @Column(name = "min_execution_time_ms")
    private Long minExecutionTimeMs = 0L;

    @Column(name = "max_execution_time_ms")
    private Long maxExecutionTimeMs = 0L;

    @Column(name = "total_execution_time_ms")
    private Long totalExecutionTimeMs = 0L;

    @Column(name = "success_rate")
    private Double successRate = 0.0;

    @Column(name = "error_rate")
    private Double errorRate = 0.0;

    @Column(name = "p50_latency")
    private Double p50Latency = 0.0;

    @Column(name = "p95_latency")
    private Double p95Latency = 0.0;

    @Column(name = "p99_latency")
    private Double p99Latency = 0.0;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        LocalDateTime now = LocalDateTime.now();
        if (createdAt == null) createdAt = now;
        if (updatedAt == null) updatedAt = now;
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
        if (totalExecutions > 0) {
            successRate = (successfulExecutions / (double) totalExecutions) * 100.0;
            errorRate = (failedExecutions / (double) totalExecutions) * 100.0;
            if (totalExecutionTimeMs > 0) {
                avgExecutionTimeMs = totalExecutionTimeMs / (double) totalExecutions;
            }
        }
    }
}

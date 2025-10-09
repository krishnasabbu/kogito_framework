package com.wellsfargo.workflow.comparison.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "comparison_master")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ComparisonMasterEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(nullable = false)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "workflow_pair", nullable = false)
    private String workflowPair;

    @Column(name = "champion_workflow_id", nullable = false)
    private String championWorkflowId;

    @Column(name = "challenge_workflow_id", nullable = false)
    private String challengeWorkflowId;

    @Column(nullable = false)
    @Builder.Default
    private String status = "PENDING";

    @Column(name = "total_executions")
    @Builder.Default
    private Integer totalExecutions = 0;

    @Column(name = "included_executions")
    @Builder.Default
    private Integer includedExecutions = 0;

    @Column(name = "outlier_count")
    @Builder.Default
    private Integer outlierCount = 0;

    @Column(name = "aggregate_metrics", columnDefinition = "jsonb")
    private String aggregateMetrics;

    @Column(name = "statistical_analysis", columnDefinition = "jsonb")
    private String statisticalAnalysis;

    @CreationTimestamp
    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    @Column(name = "created_by")
    private String createdBy;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @OneToMany(mappedBy = "comparison", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<ExecutionComparisonEntity> executionMappings = new ArrayList<>();

    public void addExecutionMapping(ExecutionComparisonEntity mapping) {
        executionMappings.add(mapping);
        mapping.setComparison(this);
    }

    public void removeExecutionMapping(ExecutionComparisonEntity mapping) {
        executionMappings.remove(mapping);
        mapping.setComparison(null);
    }
}

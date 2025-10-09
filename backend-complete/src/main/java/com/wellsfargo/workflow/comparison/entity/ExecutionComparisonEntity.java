package com.wellsfargo.workflow.comparison.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "execution_comparison_mapping")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ExecutionComparisonEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "comparison_id", nullable = false)
    private ComparisonMasterEntity comparison;

    @Column(name = "execution_id", nullable = false)
    private String executionId;

    @Column(nullable = false)
    @Builder.Default
    private Boolean included = true;

    @Column(name = "outlier_flag")
    @Builder.Default
    private Boolean outlierFlag = false;

    @Column(name = "outlier_reason")
    private String outlierReason;

    @Column(name = "outlier_score")
    private Double outlierScore;

    @Column(name = "execution_order")
    private Integer executionOrder;

    @CreationTimestamp
    @Column(name = "created_at")
    private LocalDateTime createdAt;
}

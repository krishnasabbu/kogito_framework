package com.wellsfargo.abtest.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import org.hibernate.annotations.GenericGenerator;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "ab_tests")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ABTestEntity {

    @Id
    @GeneratedValue(generator = "UUID")
    @GenericGenerator(name = "UUID", strategy = "org.hibernate.id.UUIDGenerator")
    @Column(name = "id", updatable = false, nullable = false)
    private String id;

    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "workflow_id", nullable = false)
    private String workflowId;

    @Column(name = "traffic_split", nullable = false)
    private Integer trafficSplit;

    @Column(name = "status", nullable = false)
    @Enumerated(EnumType.STRING)
    private TestStatus status;

    @Column(name = "started_at")
    private LocalDateTime startedAt;

    @Column(name = "ended_at")
    private LocalDateTime endedAt;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "created_by", nullable = false)
    private String createdBy;

    @Column(name = "hypothesis", columnDefinition = "TEXT")
    private String hypothesis;

    @Column(name = "success_metric")
    private String successMetric;

    @Column(name = "minimum_sample_size")
    private Integer minimumSampleSize;

    @Column(name = "confidence_level")
    private Double confidenceLevel;

    @OneToMany(mappedBy = "abTest", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonManagedReference
    private List<ABTestArmEntity> arms;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        if (status == null) {
            status = TestStatus.DRAFT;
        }
        if (confidenceLevel == null) {
            confidenceLevel = 0.95;
        }
    }

    public enum TestStatus {
        DRAFT,
        RUNNING,
        PAUSED,
        COMPLETED,
        ARCHIVED
    }
}

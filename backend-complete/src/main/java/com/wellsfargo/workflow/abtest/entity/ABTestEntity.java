package com.wellsfargo.workflow.abtest.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.GenericGenerator;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "ab_tests")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ABTestEntity {

    @Id
    @GeneratedValue(generator = "uuid")
    @GenericGenerator(name = "uuid", strategy = "org.hibernate.id.UUIDGenerator")
    @Column(name = "id", length = 36)
    private String id;

    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "workflow_id", nullable = false)
    private String workflowId;

    @Column(name = "traffic_split")
    private Integer trafficSplit = 50;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", length = 50)
    private TestStatus status = TestStatus.DRAFT;

    @Column(name = "started_at")
    private LocalDateTime startedAt;

    @Column(name = "ended_at")
    private LocalDateTime endedAt;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "created_by", nullable = false)
    private String createdBy;

    @Column(name = "hypothesis", columnDefinition = "TEXT")
    private String hypothesis;

    @Column(name = "success_metric")
    private String successMetric;

    @Column(name = "minimum_sample_size")
    private Integer minimumSampleSize = 100;

    @Column(name = "confidence_level")
    private Double confidenceLevel = 0.95;

    @OneToMany(mappedBy = "abTest", cascade = CascadeType.ALL, fetch = FetchType.LAZY, orphanRemoval = true)
    private List<ABTestArmEntity> arms = new ArrayList<>();

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
        if (status == null) {
            status = TestStatus.DRAFT;
        }
    }

    public enum TestStatus {
        DRAFT, RUNNING, PAUSED, COMPLETED, ARCHIVED
    }

    public void addArm(ABTestArmEntity arm) {
        arms.add(arm);
        arm.setAbTest(this);
    }
}

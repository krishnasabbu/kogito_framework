package com.wellsfargo.workflow.championchallenge.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "champion_challenge_comparisons")
public class ComparisonEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @Column(nullable = false)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "champion_workflow_id", nullable = false)
    private String championWorkflowId;

    @Column(name = "challenge_workflow_id", nullable = false)
    private String challengeWorkflowId;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "created_by")
    private String createdBy;

    @OneToMany(mappedBy = "comparison", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<ChampionChallengeExecutionEntity> executions = new ArrayList<>();

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (createdBy == null) {
            createdBy = "system";
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    // Getters and Setters
    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getChampionWorkflowId() {
        return championWorkflowId;
    }

    public void setChampionWorkflowId(String championWorkflowId) {
        this.championWorkflowId = championWorkflowId;
    }

    public String getChallengeWorkflowId() {
        return challengeWorkflowId;
    }

    public void setChallengeWorkflowId(String challengeWorkflowId) {
        this.challengeWorkflowId = challengeWorkflowId;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    public String getCreatedBy() {
        return createdBy;
    }

    public void setCreatedBy(String createdBy) {
        this.createdBy = createdBy;
    }

    public List<ChampionChallengeExecutionEntity> getExecutions() {
        return executions;
    }

    public void setExecutions(List<ChampionChallengeExecutionEntity> executions) {
        this.executions = executions;
    }
}

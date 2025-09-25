package com.flowforge.abtest.entity;

import javax.persistence.*;
import java.time.LocalDateTime;

/**
 * Hibernate Entity for AB Test Arms
 */
@Entity
@Table(name = "ab_test_arms")
public class ABTestArmEntity {
    
    @Id
    @Column(name = "id", length = 255)
    private String id;
    
    @Column(name = "test_id", length = 255, nullable = false)
    private String testId;
    
    @Column(name = "arm_key", length = 50, nullable = false)
    private String armKey;
    
    @Column(name = "arm_name", length = 500, nullable = false)
    private String armName;
    
    @Column(name = "bpmn_file", length = 1000, nullable = false)
    private String bpmnFile;
    
    @Column(name = "custom_label", length = 500)
    private String customLabel;
    
    @Column(name = "process_definition_key", length = 500)
    private String processDefinitionKey;
    
    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "test_id", insertable = false, updatable = false)
    private ABTestEntity test;
    
    // Constructors
    public ABTestArmEntity() {}
    
    public ABTestArmEntity(String id, String testId, String armKey, String armName, String bpmnFile) {
        this.id = id;
        this.testId = testId;
        this.armKey = armKey;
        this.armName = armName;
        this.bpmnFile = bpmnFile;
        this.createdAt = LocalDateTime.now();
    }
    
    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    
    public String getTestId() { return testId; }
    public void setTestId(String testId) { this.testId = testId; }
    
    public String getArmKey() { return armKey; }
    public void setArmKey(String armKey) { this.armKey = armKey; }
    
    public String getArmName() { return armName; }
    public void setArmName(String armName) { this.armName = armName; }
    
    public String getBpmnFile() { return bpmnFile; }
    public void setBpmnFile(String bpmnFile) { this.bpmnFile = bpmnFile; }
    
    public String getCustomLabel() { return customLabel; }
    public void setCustomLabel(String customLabel) { this.customLabel = customLabel; }
    
    public String getProcessDefinitionKey() { return processDefinitionKey; }
    public void setProcessDefinitionKey(String processDefinitionKey) { this.processDefinitionKey = processDefinitionKey; }
    
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    
    public ABTestEntity getTest() { return test; }
    public void setTest(ABTestEntity test) { this.test = test; }
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
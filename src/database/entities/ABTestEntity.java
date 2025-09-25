package com.flowforge.abtest.entity;

import javax.persistence.*;
import java.time.LocalDateTime;
import java.util.List;
import java.util.ArrayList;

/**
 * Hibernate Entity for AB Tests
 */
@Entity
@Table(name = "ab_tests")
public class ABTestEntity {
    
    @Id
    @Column(name = "id", length = 255)
    private String id;
    
    @Column(name = "name", length = 500, nullable = false)
    private String name;
    
    @Column(name = "description", columnDefinition = "TEXT")
    private String description;
    
    @Column(name = "spring_project_path", length = 1000, nullable = false)
    private String springProjectPath;
    
    @Column(name = "traffic_split", nullable = false)
    private Integer trafficSplit = 50;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "status", length = 50, nullable = false)
    private TestStatus status = TestStatus.DRAFT;
    
    @Column(name = "generate_listener", nullable = false)
    private Boolean generateListener = true;
    
    @Column(name = "listener_package_name", length = 500)
    private String listenerPackageName;
    
    @Column(name = "listener_class_name", length = 500)
    private String listenerClassName;
    
    @Column(name = "listener_file_path", length = 1000)
    private String listenerFilePath;
    
    @Column(name = "listener_generated", nullable = false)
    private Boolean listenerGenerated = false;
    
    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
    
    @OneToMany(mappedBy = "test", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<ABTestArmEntity> arms = new ArrayList<>();
    
    @OneToMany(mappedBy = "test", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<ExecutionLogEntity> executions = new ArrayList<>();
    
    // Constructors
    public ABTestEntity() {}
    
    public ABTestEntity(String id, String name, String springProjectPath) {
        this.id = id;
        this.name = name;
        this.springProjectPath = springProjectPath;
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }
    
    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    
    public String getSpringProjectPath() { return springProjectPath; }
    public void setSpringProjectPath(String springProjectPath) { this.springProjectPath = springProjectPath; }
    
    public Integer getTrafficSplit() { return trafficSplit; }
    public void setTrafficSplit(Integer trafficSplit) { this.trafficSplit = trafficSplit; }
    
    public TestStatus getStatus() { return status; }
    public void setStatus(TestStatus status) { this.status = status; }
    
    public Boolean getGenerateListener() { return generateListener; }
    public void setGenerateListener(Boolean generateListener) { this.generateListener = generateListener; }
    
    public String getListenerPackageName() { return listenerPackageName; }
    public void setListenerPackageName(String listenerPackageName) { this.listenerPackageName = listenerPackageName; }
    
    public String getListenerClassName() { return listenerClassName; }
    public void setListenerClassName(String listenerClassName) { this.listenerClassName = listenerClassName; }
    
    public String getListenerFilePath() { return listenerFilePath; }
    public void setListenerFilePath(String listenerFilePath) { this.listenerFilePath = listenerFilePath; }
    
    public Boolean getListenerGenerated() { return listenerGenerated; }
    public void setListenerGenerated(Boolean listenerGenerated) { this.listenerGenerated = listenerGenerated; }
    
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
    
    public List<ABTestArmEntity> getArms() { return arms; }
    public void setArms(List<ABTestArmEntity> arms) { this.arms = arms; }
    
    public List<ExecutionLogEntity> getExecutions() { return executions; }
    public void setExecutions(List<ExecutionLogEntity> executions) { this.executions = executions; }
    
    // Lifecycle callbacks
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
    
    // Enums
    public enum TestStatus {
        DRAFT, RUNNING, STOPPED, COMPLETED
    }
}
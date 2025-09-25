package com.flowforge.abtest.entity;

import javax.persistence.*;
import java.time.LocalDateTime;
import java.util.List;
import java.util.ArrayList;

/**
 * Hibernate Entity for Execution Logs
 */
@Entity
@Table(name = "execution_logs")
public class ExecutionLogEntity {
    
    @Id
    @Column(name = "id", length = 255)
    private String id;
    
    @Column(name = "test_id", length = 255, nullable = false)
    private String testId;
    
    @Column(name = "arm_key", length = 50, nullable = false)
    private String armKey;
    
    @Column(name = "arm_name", length = 500, nullable = false)
    private String armName;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "status", length = 50, nullable = false)
    private ExecutionStatus status;
    
    @Column(name = "duration", nullable = false)
    private Long duration;
    
    @Column(name = "timestamp", nullable = false)
    private LocalDateTime timestamp;
    
    @Column(name = "error_message", columnDefinition = "TEXT")
    private String errorMessage;
    
    @Column(name = "error_type", length = 200)
    private String errorType;
    
    @Column(name = "service_name", length = 500)
    private String serviceName;
    
    @Column(name = "retry_count", nullable = false)
    private Integer retryCount = 0;
    
    @Column(name = "queue_time", nullable = false)
    private Long queueTime = 0L;
    
    @Column(name = "process_instance_id", length = 255)
    private String processInstanceId;
    
    @Column(name = "request_payload", columnDefinition = "LONGTEXT")
    private String requestPayload;
    
    @Column(name = "response_payload", columnDefinition = "LONGTEXT")
    private String responsePayload;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "test_id", insertable = false, updatable = false)
    private ABTestEntity test;
    
    @OneToMany(mappedBy = "executionLog", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<ServiceStepEntity> serviceSteps = new ArrayList<>();
    
    @OneToMany(mappedBy = "executionLog", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<ActivityExecutionEntity> activityExecutions = new ArrayList<>();
    
    // Constructors
    public ExecutionLogEntity() {}
    
    public ExecutionLogEntity(String id, String testId, String armKey, String armName, 
                             ExecutionStatus status, Long duration) {
        this.id = id;
        this.testId = testId;
        this.armKey = armKey;
        this.armName = armName;
        this.status = status;
        this.duration = duration;
        this.timestamp = LocalDateTime.now();
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
    
    public ExecutionStatus getStatus() { return status; }
    public void setStatus(ExecutionStatus status) { this.status = status; }
    
    public Long getDuration() { return duration; }
    public void setDuration(Long duration) { this.duration = duration; }
    
    public LocalDateTime getTimestamp() { return timestamp; }
    public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }
    
    public String getErrorMessage() { return errorMessage; }
    public void setErrorMessage(String errorMessage) { this.errorMessage = errorMessage; }
    
    public String getErrorType() { return errorType; }
    public void setErrorType(String errorType) { this.errorType = errorType; }
    
    public String getServiceName() { return serviceName; }
    public void setServiceName(String serviceName) { this.serviceName = serviceName; }
    
    public Integer getRetryCount() { return retryCount; }
    public void setRetryCount(Integer retryCount) { this.retryCount = retryCount; }
    
    public Long getQueueTime() { return queueTime; }
    public void setQueueTime(Long queueTime) { this.queueTime = queueTime; }
    
    public String getProcessInstanceId() { return processInstanceId; }
    public void setProcessInstanceId(String processInstanceId) { this.processInstanceId = processInstanceId; }
    
    public String getRequestPayload() { return requestPayload; }
    public void setRequestPayload(String requestPayload) { this.requestPayload = requestPayload; }
    
    public String getResponsePayload() { return responsePayload; }
    public void setResponsePayload(String responsePayload) { this.responsePayload = responsePayload; }
    
    public ABTestEntity getTest() { return test; }
    public void setTest(ABTestEntity test) { this.test = test; }
    
    public List<ServiceStepEntity> getServiceSteps() { return serviceSteps; }
    public void setServiceSteps(List<ServiceStepEntity> serviceSteps) { this.serviceSteps = serviceSteps; }
    
    public List<ActivityExecutionEntity> getActivityExecutions() { return activityExecutions; }
    public void setActivityExecutions(List<ActivityExecutionEntity> activityExecutions) { this.activityExecutions = activityExecutions; }
    
    @PrePersist
    protected void onCreate() {
        timestamp = LocalDateTime.now();
    }
    
    // Enums
    public enum ExecutionStatus {
        SUCCESS, ERROR, TIMEOUT, CANCELLED
    }
}
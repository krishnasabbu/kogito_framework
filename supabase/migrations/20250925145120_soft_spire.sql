-- AB Testing Database Schema
-- This schema supports dynamic arm naming and comprehensive metrics tracking

-- Main AB Test table
CREATE TABLE ab_tests (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(500) NOT NULL,
    description TEXT,
    spring_project_path VARCHAR(1000) NOT NULL,
    traffic_split INTEGER NOT NULL DEFAULT 50,
    status VARCHAR(50) NOT NULL DEFAULT 'draft',
    generate_listener BOOLEAN NOT NULL DEFAULT true,
    listener_package_name VARCHAR(500),
    listener_class_name VARCHAR(500),
    listener_file_path VARCHAR(1000),
    listener_generated BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT chk_status CHECK (status IN ('draft', 'running', 'stopped', 'completed')),
    CONSTRAINT chk_traffic_split CHECK (traffic_split >= 0 AND traffic_split <= 100)
);

-- Test Arms table (supports dynamic number of arms)
CREATE TABLE ab_test_arms (
    id VARCHAR(255) PRIMARY KEY,
    test_id VARCHAR(255) NOT NULL,
    arm_key VARCHAR(50) NOT NULL,
    arm_name VARCHAR(500) NOT NULL,
    bpmn_file VARCHAR(1000) NOT NULL,
    custom_label VARCHAR(500),
    process_definition_key VARCHAR(500),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (test_id) REFERENCES ab_tests(id) ON DELETE CASCADE,
    UNIQUE KEY unique_arm_per_test (test_id, arm_key),
    UNIQUE KEY unique_bpmn_per_test (test_id, bpmn_file)
);

-- Execution Logs table
CREATE TABLE execution_logs (
    id VARCHAR(255) PRIMARY KEY,
    test_id VARCHAR(255) NOT NULL,
    arm_key VARCHAR(50) NOT NULL,
    arm_name VARCHAR(500) NOT NULL,
    status VARCHAR(50) NOT NULL,
    duration BIGINT NOT NULL,
    timestamp TIMESTAMP NOT NULL,
    error_message TEXT,
    error_type VARCHAR(200),
    service_name VARCHAR(500),
    retry_count INTEGER NOT NULL DEFAULT 0,
    queue_time BIGINT NOT NULL DEFAULT 0,
    process_instance_id VARCHAR(255),
    request_payload LONGTEXT,
    response_payload LONGTEXT,
    
    FOREIGN KEY (test_id) REFERENCES ab_tests(id) ON DELETE CASCADE,
    INDEX idx_test_arm (test_id, arm_key),
    INDEX idx_timestamp (timestamp),
    INDEX idx_status (status),
    INDEX idx_error_type (error_type)
);

-- Service Steps table (detailed service call tracking)
CREATE TABLE service_steps (
    id VARCHAR(255) PRIMARY KEY,
    execution_log_id VARCHAR(255) NOT NULL,
    service_name VARCHAR(500) NOT NULL,
    method VARCHAR(10) NOT NULL,
    url VARCHAR(2000) NOT NULL,
    status VARCHAR(50) NOT NULL,
    duration BIGINT NOT NULL,
    timestamp TIMESTAMP NOT NULL,
    retry_count INTEGER NOT NULL DEFAULT 0,
    error_type VARCHAR(200),
    request_payload LONGTEXT,
    response_payload LONGTEXT,
    
    FOREIGN KEY (execution_log_id) REFERENCES execution_logs(id) ON DELETE CASCADE,
    INDEX idx_execution_log (execution_log_id),
    INDEX idx_service_name (service_name),
    INDEX idx_status (status)
);

-- Activity Executions table (BPMN activity tracking)
CREATE TABLE activity_executions (
    id VARCHAR(255) PRIMARY KEY,
    execution_log_id VARCHAR(255) NOT NULL,
    activity_id VARCHAR(500) NOT NULL,
    activity_name VARCHAR(500) NOT NULL,
    status VARCHAR(50) NOT NULL,
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP,
    duration BIGINT NOT NULL DEFAULT 0,
    input_data LONGTEXT,
    output_data LONGTEXT,
    error_message TEXT,
    
    FOREIGN KEY (execution_log_id) REFERENCES execution_logs(id) ON DELETE CASCADE,
    INDEX idx_execution_log (execution_log_id),
    INDEX idx_activity_id (activity_id),
    INDEX idx_status (status),
    INDEX idx_duration (duration)
);

-- Metrics Aggregation table (for performance)
CREATE TABLE ab_test_metrics (
    id VARCHAR(255) PRIMARY KEY,
    test_id VARCHAR(255) NOT NULL,
    arm_key VARCHAR(50) NOT NULL,
    arm_name VARCHAR(500) NOT NULL,
    metric_type VARCHAR(100) NOT NULL,
    metric_name VARCHAR(200) NOT NULL,
    metric_value DECIMAL(20,6) NOT NULL,
    timestamp TIMESTAMP NOT NULL,
    aggregation_period VARCHAR(50) NOT NULL DEFAULT 'hourly',
    
    FOREIGN KEY (test_id) REFERENCES ab_tests(id) ON DELETE CASCADE,
    INDEX idx_test_arm_metric (test_id, arm_key, metric_type),
    INDEX idx_timestamp (timestamp),
    UNIQUE KEY unique_metric_per_period (test_id, arm_key, metric_type, metric_name, aggregation_period, timestamp)
);

-- SLA Tracking table
CREATE TABLE sla_tracking (
    id VARCHAR(255) PRIMARY KEY,
    test_id VARCHAR(255) NOT NULL,
    arm_key VARCHAR(50) NOT NULL,
    sla_threshold BIGINT NOT NULL,
    execution_count BIGINT NOT NULL DEFAULT 0,
    breach_count BIGINT NOT NULL DEFAULT 0,
    compliance_rate DECIMAL(5,4) NOT NULL DEFAULT 0,
    avg_response_time DECIMAL(10,2) NOT NULL DEFAULT 0,
    timestamp TIMESTAMP NOT NULL,
    
    FOREIGN KEY (test_id) REFERENCES ab_tests(id) ON DELETE CASCADE,
    INDEX idx_test_arm (test_id, arm_key),
    INDEX idx_timestamp (timestamp)
);

-- Indexes for performance
CREATE INDEX idx_execution_logs_test_timestamp ON execution_logs(test_id, timestamp DESC);
CREATE INDEX idx_execution_logs_arm_status ON execution_logs(test_id, arm_key, status);
CREATE INDEX idx_service_steps_service_timestamp ON service_steps(service_name, timestamp DESC);
CREATE INDEX idx_activity_executions_activity_duration ON activity_executions(activity_id, duration);

-- Views for common queries
CREATE VIEW v_test_summary AS
SELECT 
    t.id,
    t.name,
    t.status,
    t.traffic_split,
    COUNT(DISTINCT a.arm_key) as arm_count,
    COUNT(el.id) as total_executions,
    AVG(el.duration) as avg_duration,
    SUM(CASE WHEN el.status = 'success' THEN 1 ELSE 0 END) / COUNT(el.id) as overall_success_rate
FROM ab_tests t
LEFT JOIN ab_test_arms a ON t.id = a.test_id
LEFT JOIN execution_logs el ON t.id = el.test_id
GROUP BY t.id, t.name, t.status, t.traffic_split;

CREATE VIEW v_arm_performance AS
SELECT 
    el.test_id,
    el.arm_key,
    el.arm_name,
    COUNT(*) as execution_count,
    AVG(el.duration) as avg_duration,
    MIN(el.duration) as min_duration,
    MAX(el.duration) as max_duration,
    SUM(CASE WHEN el.status = 'success' THEN 1 ELSE 0 END) / COUNT(*) as success_rate,
    SUM(CASE WHEN el.status = 'error' THEN 1 ELSE 0 END) / COUNT(*) as error_rate,
    SUM(el.retry_count) as total_retries,
    AVG(el.queue_time) as avg_queue_time
FROM execution_logs el
GROUP BY el.test_id, el.arm_key, el.arm_name;
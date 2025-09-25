/* =============================== */
/* AB Test Database Schema */
/* =============================== */

-- AB Tests Table
CREATE TABLE ab_tests (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    spring_project_path VARCHAR(500) NOT NULL,
    traffic_split INT NOT NULL,
    status VARCHAR(50) NOT NULL,
    generate_listener BOOLEAN DEFAULT FALSE,
    listener_package_name VARCHAR(255),
    listener_class_name VARCHAR(255),
    listener_file_path VARCHAR(500),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- AB Test Arms
CREATE TABLE ab_test_arms (
    id VARCHAR(50) PRIMARY KEY,
    test_id VARCHAR(50) NOT NULL REFERENCES ab_tests(id) ON DELETE CASCADE,
    arm_key VARCHAR(10) NOT NULL,
    arm_name VARCHAR(255) NOT NULL,
    bpmn_file VARCHAR(255) NOT NULL,
    custom_label VARCHAR(255),
    process_definition_key VARCHAR(255)
);

-- Project Scans
CREATE TABLE project_scans (
    id VARCHAR(50) PRIMARY KEY,
    project_path VARCHAR(500) NOT NULL,
    resources_path VARCHAR(500) NOT NULL,
    processes_path VARCHAR(500),
    created_at TIMESTAMP DEFAULT NOW()
);

-- BPMN Files
CREATE TABLE project_bpmn_files (
    id VARCHAR(50) PRIMARY KEY,
    scan_id VARCHAR(50) NOT NULL REFERENCES project_scans(id) ON DELETE CASCADE,
    path VARCHAR(500) NOT NULL,
    filename VARCHAR(255) NOT NULL,
    friendly_name VARCHAR(255),
    process_definition_key VARCHAR(255)
);

-- Execution Metrics
CREATE TABLE execution_metrics (
    id VARCHAR(50) PRIMARY KEY,
    test_id VARCHAR(50) NOT NULL REFERENCES ab_tests(id) ON DELETE CASCADE,
    arm_key VARCHAR(10) NOT NULL,
    runs INT NOT NULL,
    success_rate DOUBLE PRECISION NOT NULL,
    error_rate DOUBLE PRECISION NOT NULL,
    avg_duration DOUBLE PRECISION,
    min_duration DOUBLE PRECISION,
    max_duration DOUBLE PRECISION,
    total_duration BIGINT,
    retry_count INT,
    queue_time DOUBLE PRECISION,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Time Series Metrics
CREATE TABLE time_series_metrics (
    id VARCHAR(50) PRIMARY KEY,
    test_id VARCHAR(50) NOT NULL REFERENCES ab_tests(id) ON DELETE CASCADE,
    timestamp TIMESTAMP NOT NULL,
    arm_key VARCHAR(10) NOT NULL,
    requests INT,
    success INT,
    errors INT,
    avg_duration DOUBLE PRECISION
);

-- Service Execution Metrics
CREATE TABLE service_execution_metrics (
    id VARCHAR(50) PRIMARY KEY,
    test_id VARCHAR(50) NOT NULL REFERENCES ab_tests(id) ON DELETE CASCADE,
    service_name VARCHAR(255) NOT NULL,
    arm_key VARCHAR(10) NOT NULL,
    execution_count INT NOT NULL
);

-- Activity Performance Metrics
CREATE TABLE activity_performance_metrics (
    id VARCHAR(50) PRIMARY KEY,
    test_id VARCHAR(50) NOT NULL REFERENCES ab_tests(id) ON DELETE CASCADE,
    activity_id VARCHAR(255) NOT NULL,
    activity_name VARCHAR(255) NOT NULL,
    arm_key VARCHAR(10) NOT NULL,
    avg_duration DOUBLE PRECISION,
    error_rate DOUBLE PRECISION,
    execution_count INT
);

-- Execution Logs
CREATE TABLE execution_logs (
    id VARCHAR(50) PRIMARY KEY,
    test_id VARCHAR(50) NOT NULL REFERENCES ab_tests(id) ON DELETE CASCADE,
    arm_key VARCHAR(10) NOT NULL,
    arm_name VARCHAR(255) NOT NULL,
    status VARCHAR(50) NOT NULL,
    duration INT,
    timestamp TIMESTAMP DEFAULT NOW(),
    error_type VARCHAR(255),
    error_message TEXT,
    service_name VARCHAR(255),
    retry_count INT,
    queue_time DOUBLE PRECISION,
    process_instance_id VARCHAR(255)
);

-- Service Steps
CREATE TABLE service_steps (
    id VARCHAR(50) PRIMARY KEY,
    log_id VARCHAR(50) NOT NULL REFERENCES execution_logs(id) ON DELETE CASCADE,
    service_name VARCHAR(255) NOT NULL,
    method VARCHAR(10) NOT NULL,
    url VARCHAR(500) NOT NULL,
    status VARCHAR(50) NOT NULL,
    duration INT,
    timestamp TIMESTAMP DEFAULT NOW(),
    retry_count INT,
    request_payload JSONB,
    response_payload JSONB,
    error_type VARCHAR(255)
);

-- Activity Executions
CREATE TABLE activity_executions (
    id VARCHAR(50) PRIMARY KEY,
    log_id VARCHAR(50) NOT NULL REFERENCES execution_logs(id) ON DELETE CASCADE,
    activity_id VARCHAR(255) NOT NULL,
    activity_name VARCHAR(255) NOT NULL,
    status VARCHAR(50) NOT NULL,
    start_time TIMESTAMP,
    end_time TIMESTAMP,
    duration INT,
    input_data JSONB,
    output_data JSONB
);

-- A/B Testing Tables
CREATE TABLE IF NOT EXISTS ab_tests (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    workflow_id VARCHAR(255) NOT NULL,
    traffic_split INT DEFAULT 50,
    status VARCHAR(50) DEFAULT 'DRAFT',
    started_at TIMESTAMP,
    ended_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(255) NOT NULL,
    hypothesis TEXT,
    success_metric VARCHAR(255),
    minimum_sample_size INT DEFAULT 100,
    confidence_level DOUBLE DEFAULT 0.95
);

CREATE TABLE IF NOT EXISTS ab_test_arms (
    id VARCHAR(36) PRIMARY KEY,
    ab_test_id VARCHAR(36) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    bpmn_file_path VARCHAR(500) NOT NULL,
    traffic_percentage INT NOT NULL,
    is_control BOOLEAN DEFAULT FALSE,
    total_executions BIGINT DEFAULT 0,
    successful_executions BIGINT DEFAULT 0,
    failed_executions BIGINT DEFAULT 0,
    avg_execution_time_ms DOUBLE DEFAULT 0.0,
    min_execution_time_ms BIGINT DEFAULT 0,
    max_execution_time_ms BIGINT DEFAULT 0,
    total_execution_time_ms BIGINT DEFAULT 0,
    success_rate DOUBLE DEFAULT 0.0,
    error_rate DOUBLE DEFAULT 0.0,
    p50_latency DOUBLE DEFAULT 0.0,
    p95_latency DOUBLE DEFAULT 0.0,
    p99_latency DOUBLE DEFAULT 0.0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (ab_test_id) REFERENCES ab_tests(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS ab_test_executions (
    id VARCHAR(36) PRIMARY KEY,
    ab_test_id VARCHAR(36) NOT NULL,
    arm_id VARCHAR(36) NOT NULL,
    request_payload TEXT,
    response_payload TEXT,
    execution_time_ms BIGINT NOT NULL,
    status VARCHAR(50) NOT NULL,
    error_message TEXT,
    user_id VARCHAR(255),
    session_id VARCHAR(255),
    metadata TEXT,
    started_at TIMESTAMP NOT NULL,
    completed_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (ab_test_id) REFERENCES ab_tests(id) ON DELETE CASCADE,
    FOREIGN KEY (arm_id) REFERENCES ab_test_arms(id) ON DELETE CASCADE
);

-- Champion vs Challenge Tables
CREATE TABLE IF NOT EXISTS champion_challenge_executions (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    champion_workflow_id VARCHAR(255) NOT NULL,
    challenge_workflow_id VARCHAR(255) NOT NULL,
    request_payload TEXT,
    status VARCHAR(50) DEFAULT 'PENDING',
    started_at TIMESTAMP,
    completed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(255) NOT NULL,
    total_champion_time_ms BIGINT DEFAULT 0,
    total_challenge_time_ms BIGINT DEFAULT 0,
    winner VARCHAR(50)
);

CREATE TABLE IF NOT EXISTS execution_node_metrics (
    id VARCHAR(36) PRIMARY KEY,
    execution_id VARCHAR(36) NOT NULL,
    variant VARCHAR(50) NOT NULL,
    node_id VARCHAR(255) NOT NULL,
    node_name VARCHAR(255) NOT NULL,
    node_type VARCHAR(100) NOT NULL,
    request_data TEXT,
    response_data TEXT,
    execution_time_ms BIGINT NOT NULL,
    status VARCHAR(50) NOT NULL,
    error_message TEXT,
    started_at TIMESTAMP NOT NULL,
    completed_at TIMESTAMP NOT NULL,
    metadata TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (execution_id) REFERENCES champion_challenge_executions(id) ON DELETE CASCADE
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_ab_tests_status ON ab_tests(status);
CREATE INDEX IF NOT EXISTS idx_ab_test_arms_test_id ON ab_test_arms(ab_test_id);
CREATE INDEX IF NOT EXISTS idx_ab_test_executions_test_id ON ab_test_executions(ab_test_id);
CREATE INDEX IF NOT EXISTS idx_cc_executions_status ON champion_challenge_executions(status);
CREATE INDEX IF NOT EXISTS idx_node_metrics_execution_id ON execution_node_metrics(execution_id);

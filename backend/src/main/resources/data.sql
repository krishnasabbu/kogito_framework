-- ============================================
-- Sample Data for Testing
-- ============================================

-- This file intentionally left empty
-- Data will be generated through API calls
-- or you can add sample data here for development

-- Example A/B Test (commented out - uncomment to use)
/*
INSERT INTO ab_tests (id, name, description, workflow_id, traffic_split, status, created_by, minimum_sample_size)
VALUES ('test-001', 'Payment Flow Test', 'Testing new payment gateway', 'payment-workflow', 50, 'DRAFT', 'system', 1000);

INSERT INTO ab_test_arms (id, ab_test_id, name, bpmn_file_path, traffic_percentage, is_control)
VALUES
    ('arm-001', 'test-001', 'Control', '/workflows/payment-v1.bpmn', 50, TRUE),
    ('arm-002', 'test-001', 'Variant A', '/workflows/payment-v2.bpmn', 50, FALSE);
*/

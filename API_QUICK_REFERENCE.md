# 🚀 API Quick Reference

## Backend: http://localhost:8989

## A/B Testing APIs

### List All Tests
```bash
curl http://localhost:8989/api/v1/ab-tests
```

### Create Test
```bash
curl -X POST http://localhost:8989/api/v1/ab-tests \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My Test",
    "description": "Testing workflows",
    "workflowId": "test-workflow",
    "trafficSplit": 50,
    "hypothesis": "New flow is better",
    "successMetric": "execution_time",
    "minimumSampleSize": 100,
    "confidenceLevel": 0.95,
    "arms": [
      {
        "name": "Control",
        "description": "Current version",
        "bpmnFilePath": "/workflows/v1.bpmn",
        "trafficPercentage": 50,
        "isControl": true
      },
      {
        "name": "Variant",
        "description": "New version",
        "bpmnFilePath": "/workflows/v2.bpmn",
        "trafficPercentage": 50,
        "isControl": false
      }
    ]
  }'
```

### Get Test Details
```bash
curl http://localhost:8989/api/v1/ab-tests/{testId}
```

### Start Test
```bash
curl -X POST http://localhost:8989/api/v1/ab-tests/{testId}/start
```

### Stop Test
```bash
curl -X POST http://localhost:8989/api/v1/ab-tests/{testId}/stop
```

### Execute Test Request
```bash
curl -X POST http://localhost:8989/api/v1/ab-tests/{testId}/execute \
  -H "Content-Type: application/json" \
  -d '{
    "requestPayload": "{}",
    "userId": "user123",
    "sessionId": "session456"
  }'
```

### Get Analytics
```bash
curl http://localhost:8989/api/v1/ab-tests/{testId}/analytics
```

---

## Champion vs Challenge APIs

### List All Executions
```bash
curl http://localhost:8989/api/v2/champion-challenge/executions
```

### Create Execution (Auto-Runs Both Workflows)
```bash
curl -X POST http://localhost:8989/api/v2/champion-challenge/executions \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Performance Comparison",
    "description": "Testing v1 vs v2",
    "championWorkflowId": "workflow-v1",
    "challengeWorkflowId": "workflow-v2"
  }'
```

### Get Execution Details
```bash
curl http://localhost:8989/api/v2/champion-challenge/executions/{executionId}
```

### Get Complete Analytics
```bash
curl http://localhost:8989/api/v2/champion-challenge/executions/{executionId}/analytics
```

---

## Response Examples

### A/B Test Response
```json
{
  "id": "test-123",
  "name": "My Test",
  "workflowId": "test-workflow",
  "status": "RUNNING",
  "arms": [
    {
      "id": "arm-1",
      "name": "Control",
      "totalExecutions": 150,
      "successRate": 95.5,
      "avgExecutionTimeMs": 1250.5,
      "p50Latency": 1100,
      "p95Latency": 1800,
      "p99Latency": 2100
    }
  ]
}
```

### Champion/Challenge Response
```json
{
  "id": "exec-456",
  "name": "Performance Comparison",
  "status": "COMPLETED",
  "totalChampionTimeMs": 3500,
  "totalChallengeTimeMs": 2800,
  "winner": "CHALLENGE",
  "championMetrics": [
    {
      "nodeId": "start",
      "nodeName": "StartEvent",
      "executionTimeMs": 500,
      "status": "SUCCESS"
    }
  ],
  "challengeMetrics": [...]
}
```

### Analytics Response
```json
{
  "summaryCards": {
    "championTime": 3500,
    "challengeTime": 2800,
    "winner": "CHALLENGE",
    "improvement": 20.0
  },
  "executionTimeData": [...],
  "detailedStatistics": {
    "championSuccessRate": 100.0,
    "challengeSuccessRate": 100.0
  }
}
```

---

## H2 Console Access

**URL:** http://localhost:8989/h2-console

**Credentials:**
- JDBC URL: `jdbc:h2:mem:workflowdb`
- Username: `sa`
- Password: (empty)

**Query Examples:**
```sql
-- View all A/B tests
SELECT * FROM ab_tests;

-- View all executions
SELECT * FROM champion_challenge_executions;

-- View node metrics
SELECT * FROM execution_node_metrics;

-- View comparisons
SELECT * FROM execution_comparisons;
```

---

## Frontend URLs

- **Dev Server:** http://localhost:5173
- **A/B Testing:** http://localhost:5173/#/ab-tests
- **Champion/Challenge:** http://localhost:5173/#/champion-challenge

Everything is ready! Just start both servers and test! 🚀

# LangGraph API Implementation Guide

## Quick Start

This guide shows how to use the LangGraph API-based workflow execution system for Champion vs Challenger and A/B Testing.

---

## Setup

### Environment Variables

Add to your `.env` file:

```bash
# LangGraph API Configuration
VITE_LANGGRAPH_API_URL=http://localhost:8000
VITE_LANGGRAPH_API_KEY=your_api_key_here
```

### Check API Health

```typescript
import { langGraphApiService } from './services/langGraphApiService';

const healthy = await langGraphApiService.isHealthy();
console.log('LangGraph API is healthy:', healthy);
```

---

## Creating LangGraph Flows

### Option 1: Flow Builder UI

1. Navigate to LangGraph Flow Builder
2. Enter flow name and description
3. Add nodes (API calls, LLM calls, functions)
4. Configure each node's endpoint and parameters
5. Connect nodes in sequence
6. Click "Create Flow"

### Option 2: Programmatic Creation

```typescript
import { langGraphApiService } from './services/langGraphApiService';

const flow = await langGraphApiService.createFlow({
  name: 'Customer Validation Flow',
  description: 'Validates customer data through multiple checks',
  nodes: [
    {
      id: 'validate-input',
      type: 'function',
      name: 'Validate Input',
      config: {
        function_name: 'validateCustomerInput'
      }
    },
    {
      id: 'check-credit',
      type: 'api',
      name: 'Check Credit Score',
      config: {
        endpoint: 'https://api.credit.com/check',
        method: 'POST',
        headers: {
          'Authorization': 'Bearer ${API_KEY}'
        }
      },
      input_mapping: {
        'customer_id': '$.customerId'
      },
      output_mapping: {
        'credit_score': '$.score'
      }
    },
    {
      id: 'risk-assessment',
      type: 'llm',
      name: 'Risk Assessment',
      config: {
        model: 'gpt-4',
        prompt: 'Assess risk for customer with credit score: ${credit_score}',
        temperature: 0.3
      }
    }
  ],
  edges: [
    { id: 'e1', from: 'validate-input', to: 'check-credit' },
    { id: 'e2', from: 'check-credit', to: 'risk-assessment' }
  ],
  config: {
    timeout: 60000,
    retries: 3,
    streaming: true
  }
});

console.log('Created flow:', flow.id);
```

---

## Champion vs Challenger with LangGraph

### 1. Create Two Flow Versions

```typescript
// Create Champion Flow
const championFlow = await langGraphApiService.createFlow({
  name: 'Payment Processing - Champion',
  description: 'Current production payment flow',
  nodes: [
    /* ... existing flow nodes ... */
  ]
});

// Create Challenger Flow (improved version)
const challengerFlow = await langGraphApiService.createFlow({
  name: 'Payment Processing - Challenger',
  description: 'Optimized payment flow with caching',
  nodes: [
    /* ... optimized flow nodes ... */
  ]
});
```

### 2. Execute Comparison

```typescript
import { executionOrchestrator } from './services/executionOrchestrator';

const result = await executionOrchestrator.executeComparison({
  name: 'Payment Flow Comparison Q4',
  description: 'Testing new caching strategy',
  championFlow: {
    mode: 'langgraph',
    langgraph_flow_id: championFlow.id
  },
  challengeFlow: {
    mode: 'langgraph',
    langgraph_flow_id: challengerFlow.id
  },
  requestPayload: {
    customerId: '12345',
    amount: 1000,
    currency: 'USD'
  }
});

console.log('Champion time:', result.championResult.totalTimeMs);
console.log('Challenger time:', result.challengeResult.totalTimeMs);
console.log('Winner:', result.championResult.totalTimeMs < result.challengeResult.totalTimeMs ? 'Champion' : 'Challenger');
```

### 3. View Results in UI

The existing Champion vs Challenger dashboard automatically works with LangGraph flows!

```typescript
// In your component
const { executions } = useChampionChallengeStore();

// Execution includes both BPMN and LangGraph results
executions.forEach(exec => {
  console.log('Execution mode:', exec.executionMode); // 'langgraph'
  console.log('Champion metrics:', exec.metrics.champion);
  console.log('Challenger metrics:', exec.metrics.challenge);
});
```

---

## A/B Testing with LangGraph

### 1. Create Flow Versions

```typescript
// Create base flow
const baseFlow = await langGraphApiService.createFlow({
  name: 'Checkout Flow',
  /* ... */
});

// Create variant A (version 1.0)
const versionA = await langGraphApiService.createVersion(baseFlow.id, '1.0');

// Update flow for variant B
await langGraphApiService.updateFlow(baseFlow.id, {
  nodes: [/* modified nodes */]
});

// Create variant B (version 2.0)
const versionB = await langGraphApiService.createVersion(baseFlow.id, '2.0');
```

### 2. Configure Traffic Split

```typescript
interface ABTestConfig {
  name: string;
  baseFlowId: string;
  variants: [
    { id: 'A', flowVersionId: versionA.id, percentage: 50 },
    { id: 'B', flowVersionId: versionB.id, percentage: 50 }
  ]
}

// Execute with random variant selection
const selectVariant = () => {
  return Math.random() < 0.5 ? 'A' : 'B';
};

const variant = selectVariant();
const versionId = variant === 'A' ? versionA.id : versionB.id;

const result = await langGraphApiService.executeFlow({
  flow_id: baseFlow.id,
  version: versionId,
  input: requestPayload
});
```

### 3. Collect Metrics

```typescript
// Store results for each variant
const results = {
  variantA: [],
  variantB: []
};

// Run 100 tests
for (let i = 0; i < 100; i++) {
  const variant = selectVariant();
  const result = await langGraphApiService.executeFlow({
    flow_id: baseFlow.id,
    version: variant === 'A' ? versionA.id : versionB.id,
    input: generateTestInput()
  });

  if (variant === 'A') {
    results.variantA.push(result.metrics.total_time_ms);
  } else {
    results.variantB.push(result.metrics.total_time_ms);
  }
}

// Calculate statistics
const avgA = results.variantA.reduce((a, b) => a + b, 0) / results.variantA.length;
const avgB = results.variantB.reduce((a, b) => a + b, 0) / results.variantB.length;

console.log('Variant A avg:', avgA);
console.log('Variant B avg:', avgB);
console.log('Winner:', avgA < avgB ? 'A' : 'B');
```

---

## Hybrid Mode (BPMN + LangGraph)

Run both BPMN and LangGraph side-by-side to validate results:

```typescript
const result = await executionOrchestrator.executeComparison({
  name: 'Hybrid Validation Test',
  description: 'Comparing BPMN and LangGraph implementations',
  championFlow: {
    mode: 'hybrid',
    bpmn_workflow_id: 'existing-bpmn-file',
    langgraph_flow_id: 'new-langgraph-flow'
  },
  challengeFlow: {
    mode: 'langgraph',
    langgraph_flow_id: 'optimized-flow'
  },
  requestPayload: testData
});

// Check console for comparison logs
// "Hybrid Execution Comparison: timeDiffMs: 45, timePercentDiff: 5.2%"
```

---

## Streaming Execution

Real-time updates as the flow executes:

```typescript
await langGraphApiService.streamExecution(
  {
    flow_id: flowId,
    input: requestPayload,
    config: { streaming: true }
  },
  (event) => {
    switch (event.type) {
      case 'node_start':
        console.log('Starting node:', event.data.node_name);
        break;

      case 'node_complete':
        console.log('Completed node:', event.data.node_name, 'in', event.data.execution_time_ms, 'ms');
        break;

      case 'node_error':
        console.error('Node error:', event.data.error);
        break;

      case 'flow_complete':
        console.log('Flow completed:', event.data);
        break;
    }
  }
);
```

---

## Error Handling & Retries

### Automatic Retries

```typescript
// Execute with automatic retries (up to 3 attempts)
const result = await langGraphApiService.executeWithRetry(
  {
    flow_id: flowId,
    input: requestPayload
  },
  3 // max retries
);
```

### Node-Level Retry Configuration

```typescript
const flow = await langGraphApiService.createFlow({
  name: 'Resilient Flow',
  nodes: [
    {
      id: 'api-call',
      type: 'api',
      name: 'External API Call',
      config: {
        endpoint: 'https://api.example.com/data',
        method: 'GET'
      },
      retry_config: {
        max_attempts: 5,
        backoff_ms: 1000,
        backoff_multiplier: 2
      }
    }
  ]
});
```

### Error Handling

```typescript
try {
  const result = await langGraphApiService.executeFlow({
    flow_id: flowId,
    input: requestPayload
  });

  if (result.status === 'failed') {
    console.error('Flow failed:', result.error);
    // Handle failure
  }
} catch (error) {
  console.error('Execution error:', error);
  // Handle exception
}
```

---

## Waiting for Completion

For long-running flows:

```typescript
// Start execution
const execution = await langGraphApiService.executeFlow({
  flow_id: flowId,
  input: requestPayload
});

if (execution.status === 'running') {
  // Wait for completion (polls every 1 second, timeout after 5 minutes)
  const result = await langGraphApiService.waitForCompletion(
    execution.execution_id,
    1000, // poll interval
    300000 // timeout
  );

  console.log('Final result:', result);
}
```

---

## Querying Flows

### List All Flows

```typescript
const flows = await langGraphApiService.listFlows();

flows.forEach(flow => {
  console.log(`${flow.name} (${flow.id})`);
  console.log(`  Nodes: ${flow.nodes.length}`);
  console.log(`  Created: ${flow.created_at}`);
});
```

### Get Flow Details

```typescript
const flow = await langGraphApiService.getFlow(flowId);

console.log('Flow configuration:');
console.log('  Timeout:', flow.config?.timeout);
console.log('  Retries:', flow.config?.retries);
console.log('  Nodes:', flow.nodes.map(n => n.name));
```

### List Flow Versions

```typescript
const versions = await langGraphApiService.listVersions(flowId);

versions.forEach(v => {
  console.log(`Version ${v.version}: ${v.status}`);
});
```

---

## Best Practices

### 1. Flow Design

✅ **Do**:
- Keep flows focused on a single business process
- Use descriptive node names
- Add input/output mappings for clarity
- Configure appropriate timeouts

❌ **Don't**:
- Create overly complex flows (split into multiple flows)
- Use generic node names like "Node 1"
- Forget error handling

### 2. Node Configuration

✅ **Do**:
- Configure retries for external API calls
- Use appropriate timeouts per node
- Map inputs/outputs explicitly
- Add metadata for debugging

❌ **Don't**:
- Hardcode credentials (use environment variables)
- Skip input validation
- Ignore error responses

### 3. Testing

✅ **Do**:
- Test flows with sample data before production
- Use hybrid mode to validate migrations
- Monitor execution metrics
- Test edge cases and error scenarios

❌ **Don't**:
- Deploy untested flows to production
- Assume LangGraph results match BPMN exactly
- Skip performance validation

### 4. Versioning

✅ **Do**:
- Create versions for A/B testing
- Use semantic versioning (1.0, 1.1, 2.0)
- Document changes between versions
- Keep deprecated versions for rollback

❌ **Don't**:
- Delete versions still in use
- Make breaking changes without new version
- Reuse version numbers

---

## Migration Checklist

Migrating from BPMN to LangGraph:

- [ ] Create LangGraph flow equivalent to BPMN
- [ ] Test flow with sample data
- [ ] Run hybrid mode comparison
- [ ] Validate performance (< 10% difference)
- [ ] Check node count matches
- [ ] Verify output format is correct
- [ ] Update UI to use new flow
- [ ] Monitor production traffic
- [ ] Collect metrics for 1 week
- [ ] Deprecate BPMN flow

---

## Troubleshooting

### Flow Execution Fails

**Check**:
1. API health: `langGraphApiService.isHealthy()`
2. Flow exists: `langGraphApiService.getFlow(flowId)`
3. Input format is correct
4. Node endpoints are reachable
5. API key is valid

### Results Don't Match BPMN

**Debug**:
1. Run hybrid mode to compare
2. Check node count
3. Verify input mapping
4. Review node configurations
5. Check timeout settings

### Performance Issues

**Optimize**:
1. Reduce node count
2. Use parallel execution where possible
3. Add caching layers
4. Optimize API call timeouts
5. Use streaming for long flows

---

## API Reference

### Core Methods

```typescript
// Flow Management
createFlow(flow: Omit<LangGraphFlow, 'id'>) => Promise<LangGraphFlow>
getFlow(flowId: string) => Promise<LangGraphFlow>
listFlows() => Promise<LangGraphFlow[]>
updateFlow(flowId: string, updates: Partial<LangGraphFlow>) => Promise<LangGraphFlow>
deleteFlow(flowId: string) => Promise<void>

// Execution
executeFlow(request: ExecutionRequest) => Promise<ExecutionResponse>
getExecution(executionId: string) => Promise<ExecutionResponse>
streamExecution(request: ExecutionRequest, onEvent: (event: StreamEvent) => void) => Promise<void>
executeWithRetry(request: ExecutionRequest, maxRetries: number) => Promise<ExecutionResponse>
waitForCompletion(executionId: string, pollMs: number, timeoutMs: number) => Promise<ExecutionResponse>

// Versioning
createVersion(flowId: string, version: string) => Promise<FlowVersion>
listVersions(flowId: string) => Promise<FlowVersion[]>
getVersion(flowId: string, version: string) => Promise<FlowVersion>
setActiveVersion(flowId: string, version: string) => Promise<void>

// Orchestration
executeComparison(request: ComparisonExecutionRequest) => Promise<ComparisonExecutionResult>
executeSingle(flowId: string, input: any, mode: 'langgraph' | 'bpmn') => Promise<NormalizedExecutionResult>
```

---

## Examples Repository

Check `/examples` folder for:
- Sample flows
- Integration patterns
- Test data generators
- Migration scripts

---

## Support

- **Documentation**: `/docs/langgraph`
- **API Status**: Check `isHealthy()` method
- **Slack**: #langgraph-support
- **Issues**: Create GitHub issue with "langgraph" label

---

## Next Steps

1. **Create your first flow** using the Flow Builder UI
2. **Test execution** with sample data
3. **Migrate one Champion vs Challenger** comparison
4. **Monitor results** in the analytics dashboard
5. **Scale to more flows** as confidence grows

**Happy Flow Building!** 🚀

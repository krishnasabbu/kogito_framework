# BPMN to LangGraph API Migration Plan

## Executive Summary

**Objective**: Migrate A/B Testing and Champion vs Challenger systems from BPMN file-based workflow execution to LangGraph API-based flow execution.

**Scope**:
- A/B Testing workflow execution
- Champion vs Challenger comparison system
- Maintain all existing functionality and analytics

**Timeline**: Phased migration with backward compatibility

---

## Current State Analysis

### BPMN-Based Architecture

**Current Flow**:
```
User → BPMN File Selection → BPMN Parser → Workflow Execution → Results
```

**Components**:
1. BPMN file upload/selection
2. BPMN XML parsing
3. Node-by-node execution
4. Metric collection per node
5. Champion vs Challenger comparison
6. Analytics dashboard

**Data Model**:
- `champion_challenge_executions` table stores execution results
- `execution_node_metrics` table stores per-node metrics
- BPMN files define workflow structure
- Request/Response captured per node

---

## Target State: LangGraph API Architecture

### LangGraph-Based Architecture

**New Flow**:
```
User → LangGraph Flow Config → LangGraph API Call → Flow Execution → Results
```

**LangGraph API Features**:
- **Flow Builder**: Define flows programmatically via API
- **Node Configuration**: Each node is a function/API call
- **State Management**: LangGraph handles state passing
- **Conditional Logic**: Support for routing and conditions
- **Streaming**: Real-time execution updates
- **Versioning**: Multiple flow versions for A/B testing

---

## Migration Strategy

### Phase 1: Foundation (Week 1)

**Goals**:
- Create LangGraph API integration layer
- No impact on existing BPMN functionality

**Deliverables**:
1. LangGraph API service (`langGraphApiService.ts`)
2. Type definitions for LangGraph flows
3. API client with authentication
4. Basic flow execution capability

**Tasks**:
- [ ] Create LangGraph API client
- [ ] Define flow configuration types
- [ ] Implement flow execution endpoint
- [ ] Add error handling and retries
- [ ] Create unit tests

### Phase 2: Parallel Execution (Week 2)

**Goals**:
- Run BPMN and LangGraph side-by-side
- Validate LangGraph results match BPMN

**Deliverables**:
1. Dual execution mode
2. Result comparison utilities
3. Migration validation dashboard

**Tasks**:
- [ ] Add "execution mode" flag to database
- [ ] Implement parallel execution
- [ ] Create result diff tool
- [ ] Add validation metrics
- [ ] Create migration dashboard

### Phase 3: Champion vs Challenger Migration (Week 3)

**Goals**:
- Migrate Champion vs Challenger to LangGraph API
- Maintain all comparison features

**Deliverables**:
1. LangGraph-based Champion execution
2. LangGraph-based Challenger execution
3. Updated comparison logic
4. Backward compatible UI

**Tasks**:
- [ ] Update execution service
- [ ] Migrate metric collection
- [ ] Update comparison algorithm
- [ ] Test with existing data
- [ ] Update documentation

### Phase 4: A/B Testing Migration (Week 4)

**Goals**:
- Migrate A/B Testing to LangGraph API
- Support traffic splitting at API level

**Deliverables**:
1. LangGraph-based A/B test execution
2. Traffic routing logic
3. Updated analytics
4. Testing framework

**Tasks**:
- [ ] Update A/B test service
- [ ] Implement traffic routing
- [ ] Migrate analytics calculations
- [ ] Test statistical significance
- [ ] Update UI components

### Phase 5: Deprecation (Week 5)

**Goals**:
- Remove BPMN dependencies
- Clean up legacy code

**Deliverables**:
1. BPMN code removal
2. Updated documentation
3. Migration guide for users

**Tasks**:
- [ ] Mark BPMN code as deprecated
- [ ] Remove BPMN file upload UI
- [ ] Clean up unused dependencies
- [ ] Update user documentation
- [ ] Create migration guide

---

## Technical Implementation

### 1. LangGraph API Integration

#### API Endpoints Required

**Flow Management**:
```typescript
POST   /api/langgraph/flows          // Create flow
GET    /api/langgraph/flows/:id      // Get flow definition
PUT    /api/langgraph/flows/:id      // Update flow
DELETE /api/langgraph/flows/:id      // Delete flow
```

**Flow Execution**:
```typescript
POST   /api/langgraph/execute        // Execute flow
GET    /api/langgraph/executions/:id // Get execution status
POST   /api/langgraph/stream         // Stream execution
```

**Flow Versions** (for A/B Testing):
```typescript
POST   /api/langgraph/flows/:id/versions    // Create version
GET    /api/langgraph/flows/:id/versions    // List versions
```

#### Flow Configuration Format

```typescript
interface LangGraphFlow {
  id: string;
  name: string;
  description: string;
  nodes: LangGraphNode[];
  edges: LangGraphEdge[];
  state_schema: Record<string, any>;
  config: FlowConfig;
}

interface LangGraphNode {
  id: string;
  type: 'function' | 'api' | 'llm' | 'conditional';
  name: string;
  config: {
    endpoint?: string;
    method?: string;
    headers?: Record<string, string>;
    function?: string;
    model?: string;
    prompt?: string;
  };
  input_mapping: Record<string, string>;
  output_mapping: Record<string, string>;
}

interface LangGraphEdge {
  from: string;
  to: string;
  condition?: string;
}

interface FlowConfig {
  timeout?: number;
  retries?: number;
  streaming?: boolean;
  checkpoint?: boolean;
}
```

#### Execution Request Format

```typescript
interface ExecutionRequest {
  flow_id: string;
  version?: string;
  input: Record<string, any>;
  config?: {
    streaming?: boolean;
    checkpoint?: boolean;
    metadata?: Record<string, any>;
  };
}

interface ExecutionResponse {
  execution_id: string;
  flow_id: string;
  status: 'running' | 'completed' | 'failed';
  output?: Record<string, any>;
  metrics: ExecutionMetrics;
  node_results: NodeResult[];
}

interface NodeResult {
  node_id: string;
  node_name: string;
  status: 'success' | 'error';
  execution_time_ms: number;
  input: any;
  output: any;
  error?: string;
}
```

### 2. Database Schema Updates

```sql
-- Add execution mode column
ALTER TABLE champion_challenge_executions
ADD COLUMN execution_mode VARCHAR(20) DEFAULT 'bpmn'
CHECK (execution_mode IN ('bpmn', 'langgraph', 'hybrid'));

-- Add LangGraph flow reference
ALTER TABLE champion_challenge_executions
ADD COLUMN langgraph_flow_id VARCHAR(255),
ADD COLUMN langgraph_execution_id VARCHAR(255);

-- Create LangGraph flow catalog
CREATE TABLE langgraph_flows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  flow_definition JSONB NOT NULL,
  version VARCHAR(50),
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE langgraph_flows ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view flows"
  ON langgraph_flows FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create flows"
  ON langgraph_flows FOR INSERT
  TO authenticated
  WITH CHECK (true);
```

### 3. Service Layer Architecture

```
┌─────────────────────────────────────────┐
│         UI Layer                        │
│  (ChampionChallengeApp, ABTestApp)      │
└─────────────────┬───────────────────────┘
                  │
┌─────────────────▼───────────────────────┐
│      Execution Orchestrator             │
│  (Detects mode, routes to correct impl) │
└─────────┬───────────────┬───────────────┘
          │               │
┌─────────▼──────┐  ┌────▼──────────────┐
│ BPMN Executor  │  │ LangGraph Executor│
│ (Legacy)       │  │ (New)             │
└────────┬───────┘  └─────┬─────────────┘
         │                │
         └────────┬───────┘
                  │
         ┌────────▼─────────┐
         │ Result Normalizer│
         │ (Common format)  │
         └──────────────────┘
```

### 4. Backward Compatibility Strategy

**Dual Mode Execution**:
```typescript
interface ExecutionStrategy {
  mode: 'bpmn' | 'langgraph' | 'hybrid';

  execute(config: ExecutionConfig): Promise<ExecutionResult>;
}

class HybridExecutionStrategy implements ExecutionStrategy {
  async execute(config: ExecutionConfig): Promise<ExecutionResult> {
    // Execute both BPMN and LangGraph
    const [bpmnResult, langGraphResult] = await Promise.all([
      this.bpmnExecutor.execute(config),
      this.langGraphExecutor.execute(config)
    ]);

    // Compare results
    const diff = this.compareResults(bpmnResult, langGraphResult);

    // Log differences
    if (diff.hasDifferences) {
      this.logger.warn('Execution differences detected', diff);
    }

    // Return LangGraph result (new behavior)
    return langGraphResult;
  }
}
```

---

## Champion vs Challenger Migration

### Current BPMN Flow
```
1. User selects 2 BPMN files (Champion, Challenger)
2. System parses both BPMN files
3. Executes both workflows with same input
4. Collects metrics per node
5. Compares results
6. Shows analytics
```

### New LangGraph Flow
```
1. User selects/creates 2 LangGraph flows (Champion, Challenger)
2. System loads flow definitions from API
3. Executes both flows via LangGraph API with same input
4. Collects metrics from API response
5. Compares results (same logic)
6. Shows analytics (same UI)
```

### Migration Steps

**Step 1: Create LangGraph Flow Selector**
```typescript
// Replace BPMN file selector with flow selector
interface FlowSelector {
  type: 'bpmn' | 'langgraph';
  bpmnFile?: File;
  langGraphFlowId?: string;
}
```

**Step 2: Update Execution Service**
```typescript
class ChampionChallengeExecutor {
  async executeComparison(
    championFlow: FlowSelector,
    challengerFlow: FlowSelector,
    input: any
  ): Promise<ComparisonResult> {
    // Execute champion
    const championResult = await this.executeFlow(championFlow, input);

    // Execute challenger
    const challengerResult = await this.executeFlow(challengerFlow, input);

    // Compare (existing logic works)
    return this.compare(championResult, challengerResult);
  }

  private async executeFlow(
    flow: FlowSelector,
    input: any
  ): Promise<ExecutionResult> {
    if (flow.type === 'bpmn') {
      return this.bpmnExecutor.execute(flow.bpmnFile, input);
    } else {
      return this.langGraphExecutor.execute(flow.langGraphFlowId, input);
    }
  }
}
```

**Step 3: Normalize Results**
```typescript
// Both BPMN and LangGraph return this format
interface NormalizedExecutionResult {
  executionId: string;
  totalTimeMs: number;
  status: 'success' | 'failed';
  nodeMetrics: NodeMetric[];
  output: any;
}

// Converter for LangGraph API response
class LangGraphResultNormalizer {
  normalize(apiResponse: ExecutionResponse): NormalizedExecutionResult {
    return {
      executionId: apiResponse.execution_id,
      totalTimeMs: apiResponse.metrics.total_time_ms,
      status: apiResponse.status === 'completed' ? 'success' : 'failed',
      nodeMetrics: apiResponse.node_results.map(this.convertNodeResult),
      output: apiResponse.output
    };
  }
}
```

---

## A/B Testing Migration

### Current BPMN A/B Test
```
1. User creates A/B test with 2+ BPMN variants
2. System splits traffic (e.g., 50/50)
3. Each request randomly routed to a variant
4. Metrics collected per variant
5. Statistical analysis determines winner
```

### New LangGraph A/B Test
```
1. User creates A/B test with 2+ LangGraph flow versions
2. System configures traffic split at API level
3. LangGraph API routes traffic based on config
4. Metrics collected from API response
5. Statistical analysis (same logic)
```

### Migration Steps

**Step 1: LangGraph Flow Versioning**
```typescript
interface ABTestConfig {
  name: string;
  baseFlowId: string;
  variants: ABTestVariant[];
  trafficSplit: Record<string, number>; // variant_id -> percentage
}

interface ABTestVariant {
  id: string;
  name: string;
  flowVersionId: string;
  description: string;
}
```

**Step 2: Traffic Routing**
```typescript
class ABTestRouter {
  selectVariant(testConfig: ABTestConfig): string {
    const rand = Math.random() * 100;
    let cumulative = 0;

    for (const [variantId, percentage] of Object.entries(testConfig.trafficSplit)) {
      cumulative += percentage;
      if (rand <= cumulative) {
        return variantId;
      }
    }

    return testConfig.variants[0].id;
  }

  async executeVariant(
    variant: ABTestVariant,
    input: any
  ): Promise<ExecutionResult> {
    return this.langGraphExecutor.executeVersion(
      variant.flowVersionId,
      input
    );
  }
}
```

---

## Testing Strategy

### Unit Tests
```typescript
describe('LangGraphApiService', () => {
  test('should create flow via API', async () => {
    const flow = await langGraphApi.createFlow(flowConfig);
    expect(flow.id).toBeDefined();
  });

  test('should execute flow and return results', async () => {
    const result = await langGraphApi.execute(flowId, input);
    expect(result.status).toBe('completed');
  });
});

describe('ResultNormalizer', () => {
  test('should convert LangGraph response to normalized format', () => {
    const normalized = normalizer.normalize(langGraphResponse);
    expect(normalized.nodeMetrics).toHaveLength(5);
  });
});
```

### Integration Tests
```typescript
describe('Champion vs Challenger (LangGraph)', () => {
  test('should execute both flows and compare results', async () => {
    const result = await executor.executeComparison(
      { type: 'langgraph', langGraphFlowId: 'flow-1' },
      { type: 'langgraph', langGraphFlowId: 'flow-2' },
      testInput
    );

    expect(result.championMetrics).toBeDefined();
    expect(result.challengerMetrics).toBeDefined();
  });
});
```

### Migration Validation
```typescript
describe('Hybrid Execution', () => {
  test('BPMN and LangGraph should produce equivalent results', async () => {
    const bpmnResult = await bpmnExecutor.execute(bpmnFile, input);
    const langGraphResult = await langGraphExecutor.execute(flowId, input);

    expect(bpmnResult.totalTimeMs).toBeCloseTo(langGraphResult.totalTimeMs, -2);
    expect(bpmnResult.nodeMetrics.length).toBe(langGraphResult.nodeMetrics.length);
  });
});
```

---

## Risk Mitigation

### Risks & Mitigation

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| LangGraph API downtime | High | Medium | Implement retry logic, circuit breaker, fallback to BPMN |
| Performance degradation | Medium | Low | Benchmark both systems, optimize API calls |
| Result inconsistencies | High | Medium | Run hybrid mode, validate results match |
| User confusion | Low | High | Clear UI indicators, gradual rollout |
| Data loss | High | Low | Database backups, dual writes during migration |

### Rollback Plan

**Phase 1-2**: Easy rollback via feature flag
**Phase 3-4**: Database supports both modes, can revert to BPMN
**Phase 5**: Create backup before removal, maintain BPMN code in git

---

## Success Metrics

### Technical Metrics
- ✅ 100% feature parity with BPMN system
- ✅ < 10% performance variance
- ✅ 99.9% API uptime
- ✅ < 5% result discrepancies during hybrid mode
- ✅ Zero data loss

### User Metrics
- ✅ Same or better user experience
- ✅ No increase in support tickets
- ✅ Faster flow creation time
- ✅ More flexible configuration options

### Business Metrics
- ✅ Reduced maintenance overhead
- ✅ Faster iteration on A/B tests
- ✅ Better scalability
- ✅ Improved observability

---

## Documentation Requirements

### User Documentation
1. **Migration Guide**: How to convert BPMN to LangGraph
2. **Flow Builder Tutorial**: Creating LangGraph flows via API
3. **A/B Testing Guide**: Setting up tests with LangGraph
4. **Troubleshooting**: Common issues and solutions

### Technical Documentation
1. **API Reference**: All LangGraph API endpoints
2. **Architecture Diagrams**: System before/after migration
3. **Code Examples**: Integration patterns
4. **Performance Benchmarks**: Comparison data

---

## Timeline Summary

| Week | Phase | Key Deliverables |
|------|-------|-----------------|
| 1 | Foundation | LangGraph API service, Types, Client |
| 2 | Parallel Execution | Hybrid mode, Validation dashboard |
| 3 | Champion/Challenger | Migrated comparison system |
| 4 | A/B Testing | Migrated A/B test system |
| 5 | Deprecation | BPMN removal, Documentation |

**Total Duration**: 5 weeks
**Effort**: 2-3 engineers
**Risk Level**: Medium

---

## Next Steps

### Immediate Actions (This Sprint)
1. Review and approve migration plan
2. Set up LangGraph API access/credentials
3. Create feature flag for migration phases
4. Set up monitoring for API calls
5. Begin Phase 1 implementation

### Dependencies
- LangGraph API access and documentation
- API authentication credentials
- Test environment setup
- Stakeholder sign-off

### Open Questions
1. What is the LangGraph API endpoint URL?
2. Authentication mechanism (API key, OAuth)?
3. Rate limits and quotas?
4. Support SLA for API issues?
5. Cost implications of API usage?

---

## Conclusion

This migration from BPMN to LangGraph API will modernize the workflow execution system while maintaining all existing functionality. The phased approach with hybrid execution ensures a safe migration with minimal risk. The new API-based architecture provides better flexibility, scalability, and maintainability for future enhancements.

**Recommendation**: Proceed with Phase 1 implementation and validate approach before committing to full migration.

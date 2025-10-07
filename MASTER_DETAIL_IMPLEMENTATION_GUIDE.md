# Champion Challenge Master-Detail Implementation Guide

## 🎯 New Architecture

### Current (Single Level)
```
Execution (contains everything)
  - name, description
  - champion_workflow_id, challenge_workflow_id
  - request_payload, status, metrics
```

### New (Master-Detail)
```
Comparison (Master) - Definition of what to compare
  - id, name, description
  - champion_workflow_id, challenge_workflow_id

Execution (Detail) - Multiple test runs under comparison
  - id, comparison_id (FK)
  - request_payload, status, timing, metrics
```

## 📊 Database Schema

### Master Table: `champion_challenge_comparisons`
```sql
CREATE TABLE champion_challenge_comparisons (
  id uuid PRIMARY KEY,
  name text NOT NULL,
  description text,
  champion_workflow_id text NOT NULL,
  challenge_workflow_id text NOT NULL,
  created_at timestamptz,
  updated_at timestamptz,
  created_by uuid
);
```

### Detail Table: `champion_challenge_executions` (Updated)
```sql
ALTER TABLE champion_challenge_executions
  ADD COLUMN comparison_id uuid REFERENCES champion_challenge_comparisons(id);

-- Remove workflow IDs from executions (now in comparison)
-- Keep execution-specific data: request_payload, status, timing, metrics
```

## 🔧 Backend Updates Needed

### 1. Entities

**ComparisonEntity.java** ✅ Created
```java
@Entity
@Table(name = "champion_challenge_comparisons")
public class ComparisonEntity {
    @Id private UUID id;
    private String name;
    private String description;
    private String championWorkflowId;
    private String challengeWorkflowId;

    @OneToMany(mappedBy = "comparison")
    private List<ChampionChallengeExecutionEntity> executions;
}
```

**ChampionChallengeExecutionEntity.java** ✅ Updated
```java
@Entity
@Table(name = "champion_challenge_executions")
public class ChampionChallengeExecutionEntity {
    @Id private String id;

    @ManyToOne
    @JoinColumn(name = "comparison_id", nullable = false)
    private ComparisonEntity comparison;

    // Remove: championWorkflowId, challengeWorkflowId, name, description
    // Keep: requestPayload, status, timing, metrics
}
```

### 2. DTOs

**ComparisonRequest.java** ✅ Created
```java
{
    "name": "Payment Flow v1 vs v2",
    "description": "Testing new payment processing",
    "championWorkflowId": "payment-v1",
    "challengeWorkflowId": "payment-v2"
}
```

**ComparisonResponse.java** ✅ Created
```java
{
    "id": "uuid",
    "name": "Payment Flow v1 vs v2",
    "championWorkflowId": "payment-v1",
    "challengeWorkflowId": "payment-v2",
    "totalExecutions": 5,
    "completedExecutions": 4,
    "runningExecutions": 1,
    "lastExecutionAt": "2025-10-07T10:30:00"
}
```

**ExecutionRequest.java** (Update)
```java
{
    "comparisonId": "uuid",  // Changed from workflow IDs
    "requestPayload": {...}  // Only execution-specific data
}
```

### 3. Repositories

**ComparisonRepository.java** ✅ Created
```java
public interface ComparisonRepository extends JpaRepository<ComparisonEntity, UUID> {
    List<ComparisonEntity> findAllByOrderByCreatedAtDesc();
}
```

**ChampionChallengeExecutionRepository.java** (Update)
```java
public interface ChampionChallengeExecutionRepository
    extends JpaRepository<ChampionChallengeExecutionEntity, String> {

    List<ChampionChallengeExecutionEntity> findByComparisonIdOrderByCreatedAtDesc(UUID comparisonId);
}
```

### 4. Service Layer

**ChampionChallengeService.java** (Update)
```java
// NEW: Comparison management
public ComparisonResponse createComparison(ComparisonRequest request, String userId);
public List<ComparisonResponse> listComparisons();
public ComparisonResponse getComparison(UUID id);
public void deleteComparison(UUID id);

// UPDATED: Execution management (now under comparison)
public ExecutionResponse executeComparison(UUID comparisonId, String requestPayload, String userId);
public List<ExecutionResponse> listExecutions(UUID comparisonId);
public ExecutionResponse getExecution(String executionId);
```

### 5. Controller

**ChampionChallengeController.java** (Update)

```java
// Comparison endpoints
POST   /api/v1/champion-challenge/comparisons
GET    /api/v1/champion-challenge/comparisons
GET    /api/v1/champion-challenge/comparisons/{id}
DELETE /api/v1/champion-challenge/comparisons/{id}

// Execution endpoints (under comparison)
POST   /api/v1/champion-challenge/comparisons/{id}/execute
GET    /api/v1/champion-challenge/comparisons/{id}/executions
GET    /api/v1/champion-challenge/executions/{id}
```

## 🎨 Frontend Updates Needed

### 1. Types

**src/types/championChallenge.ts** (Update)
```typescript
// NEW: Master
export interface ChampionChallengeComparison {
  id: string;
  name: string;
  description?: string;
  championWorkflowId: string;
  challengeWorkflowId: string;
  createdAt: Date;
  updatedAt: Date;
  totalExecutions: number;
  completedExecutions: number;
  lastExecutionAt?: Date;
}

// UPDATED: Detail (remove workflow IDs)
export interface ChampionChallengeExecution {
  id: string;
  comparisonId: string;  // NEW: FK to comparison
  requestPayload: any;
  status: 'running' | 'completed' | 'failed';
  startedAt: Date;
  completedAt?: Date;
  metrics: {
    champion: NodeMetric[];
    challenge: NodeMetric[];
  };
}
```

### 2. API Service

**src/services/championChallengeApiService.ts** (Update)
```typescript
// Comparison endpoints
createComparison(request: ComparisonRequest): Promise<ComparisonResponse>
listComparisons(): Promise<ComparisonResponse[]>
getComparison(id: string): Promise<ComparisonResponse>
deleteComparison(id: string): Promise<void>

// Execution endpoints
executeComparison(comparisonId: string, requestPayload: any): Promise<ExecutionResponse>
listExecutions(comparisonId: string): Promise<ExecutionResponse[]>
getExecution(executionId: string): Promise<ExecutionResponse>
```

### 3. Service Layer

**src/services/championChallengeService.ts** (Update)
```typescript
class ChampionChallengeService {
  // Comparison operations
  async createComparison(...): Promise<ChampionChallengeComparison>
  async listComparisons(): Promise<ChampionChallengeComparison[]>

  // Execution operations (under comparison)
  async executeComparison(comparisonId: string, payload: any): Promise<ChampionChallengeExecution>
  async listExecutions(comparisonId: string): Promise<ChampionChallengeExecution[]>
}
```

### 4. Store

**src/stores/championChallengeStore.ts** (Update)
```typescript
interface ChampionChallengeStore {
  comparisons: ChampionChallengeComparison[];
  currentComparison: ChampionChallengeComparison | null;
  executions: ChampionChallengeExecution[];

  // Comparison actions
  setComparisons: (comparisons: ChampionChallengeComparison[]) => void;
  setCurrentComparison: (comparison: ChampionChallengeComparison | null) => void;

  // Execution actions
  setExecutions: (executions: ChampionChallengeExecution[]) => void;
  addExecution: (execution: ChampionChallengeExecution) => void;
}
```

### 5. UI Components

**New Flow**:
```
ChampionChallengeApp (Main)
  ↓
ComparisonList (Show all comparisons)
  - Click "New Comparison" → ComparisonCreator
  - Click comparison → ExecutionListView
  ↓
ExecutionListView (Show executions for a comparison)
  - Show comparison details (champion vs challenge workflows)
  - Click "Run Test" → ExecutionCreator
  - Click execution → ComparisonDashboard
  ↓
ComparisonDashboard (Show execution results)
  - Display metrics for that specific execution
```

**Components to Create/Update**:
1. `ComparisonCreator.tsx` - Create new comparison definition
2. `ComparisonList.tsx` - List all comparisons
3. `ExecutionListView.tsx` - List executions for a comparison
4. `ExecutionCreator.tsx` - Run new test for a comparison (simpler now)
5. `ChampionChallengeApp.tsx` - Update navigation flow

## 📝 Implementation Steps

### Phase 1: Database ✅
- [x] Create migration for master-detail tables
- [x] Test migration on Supabase

### Phase 2: Backend 🔄
- [x] Create ComparisonEntity
- [x] Update ChampionChallengeExecutionEntity
- [x] Create ComparisonRequest/Response DTOs
- [x] Create ComparisonRepository
- [ ] Update ChampionChallengeService
- [ ] Update ChampionChallengeController
- [ ] Test backend endpoints

### Phase 3: Frontend
- [ ] Update types
- [ ] Update API service
- [ ] Update service layer
- [ ] Update store
- [ ] Create/update UI components
- [ ] Test complete flow

### Phase 4: Testing
- [ ] Test creating comparison
- [ ] Test running multiple executions
- [ ] Test viewing execution history
- [ ] Test with/without backend
- [ ] Build verification

## 🎯 User Flow Example

**Old Way**:
1. User creates "Payment v1 vs v2 Test"
2. Executes once, gets results
3. To test again, creates new "Payment v1 vs v2 Test #2"

**New Way**:
1. User creates comparison: "Payment v1 vs v2" (one time)
2. Runs Test #1 with payload A → Gets results
3. Runs Test #2 with payload B → Gets results
4. Runs Test #3 with different data → Gets results
5. Views history of all tests under same comparison

## ✅ Benefits

- **Reusability**: Define comparison once, execute many times
- **History**: Track all test runs for a comparison
- **Organization**: Group related tests together
- **Analysis**: Compare results across multiple test runs
- **Flexibility**: Test same workflows with different payloads

---

**This guide provides the complete blueprint for implementing the master-detail architecture.**

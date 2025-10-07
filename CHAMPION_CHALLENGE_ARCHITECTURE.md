# Champion vs Challenge System Architecture

## Executive Summary

A production-grade enterprise system for executing and comparing BPMN workflow variants (Champion vs Challenge) with real-time metrics collection, comprehensive filtering, and side-by-side visualization using Wells Fargo branding standards.

---

## Architecture Overview

### Technology Stack

**Frontend**
- React 18 + TypeScript
- React Flow for visual workflow rendering
- Zustand for state management
- TailwindCSS with Wells Fargo color scheme
- Supabase JS Client for real-time data

**Backend**
- Spring Boot 3.x REST API
- PostgreSQL (Supabase) with Row Level Security
- Async execution with CompletableFuture
- JWT-based authentication

**Database**
- Supabase PostgreSQL
- JSONB columns for flexible data storage
- GIN indexes for JSON path filtering
- Comprehensive RLS policies

---

## Database Schema

### Tables

#### 1. `champion_challenge_executions`
Main execution tracking table
- Primary identifier and metadata
- Workflow references (champion/challenge)
- Request payload (JSONB)
- Status tracking (PENDING → RUNNING → COMPLETED/FAILED)
- Performance metrics (total times, winner)
- Audit fields (created_by, timestamps)

#### 2. `execution_node_metrics`
Detailed node-level metrics
- Execution context (execution_id, variant, sequence)
- Node information (id, name, type)
- Request/response data (JSONB)
- Performance metrics (execution_time_ms, memory, CPU)
- Status and error tracking
- Metadata for extensibility

#### 3. `execution_comparisons`
Aggregated comparison metrics
- Metric categorization (PERFORMANCE, QUALITY, RESOURCE)
- Champion vs Challenge values
- Difference calculations (absolute, percentage)
- Winner determination
- Unit tracking

#### 4. `execution_filters`
Saved filter configurations
- Named filter presets
- Complete filter configuration (JSONB)
- User association

### Indexes

**Performance Indexes:**
- `idx_executions_status` - Fast status filtering
- `idx_executions_created_at` - Chronological sorting
- `idx_node_metrics_execution_id` - Metrics lookup
- `idx_node_metrics_sequence` - Ordered retrieval

**JSON Indexes:**
- `idx_node_metrics_request_data` (GIN) - JSON path filtering
- `idx_node_metrics_response_data` (GIN) - Response filtering
- `idx_executions_payload` (GIN) - Payload search

---

## Spring Boot Backend

### Controller Layer

**ChampionChallengeController.java**

Endpoints:
```
POST   /api/v1/champion-challenge/executions
GET    /api/v1/champion-challenge/executions
GET    /api/v1/champion-challenge/executions/{id}
GET    /api/v1/champion-challenge/executions/{id}/metrics
GET    /api/v1/champion-challenge/executions/{id}/comparison
POST   /api/v1/champion-challenge/executions/{id}/filters
GET    /api/v1/champion-challenge/executions/{id}/filters
POST   /api/v1/champion-challenge/executions/{id}/filters/{filterId}/apply
DELETE /api/v1/champion-challenge/executions/{id}
GET    /api/v1/champion-challenge/workflows
GET    /api/v1/champion-challenge/executions/{id}/export
POST   /api/v1/champion-challenge/executions/{id}/retry
```

Features:
- Swagger/OpenAPI documentation
- JWT authentication integration
- Pagination support
- Comprehensive error handling
- Request validation

### Service Layer

**ChampionChallengeService.java**

Core Functions:
- `createAndExecute()` - Async execution orchestration
- `executeWorkflows()` - Parallel workflow execution
- `saveMetrics()` - Batch metrics persistence
- `calculateAndSaveComparisons()` - Aggregation logic
- `listExecutions()` - Paginated listing with filters
- `getExecutionDetails()` - Complete execution retrieval
- `getNodeMetrics()` - Filtered metrics retrieval
- `exportExecution()` - Data export functionality

Execution Flow:
```
1. Create execution record (status: PENDING)
2. Trigger async execution
3. Update status to RUNNING
4. Execute champion and challenge in parallel (CompletableFuture)
5. Collect node-level metrics
6. Save metrics to database
7. Calculate comparison metrics
8. Determine winner
9. Update status to COMPLETED
```

---

## Frontend Architecture

### Component Hierarchy

```
ChampionChallengeApp
├── ExecutionList
│   └── ExecutionCard (Wells Fargo branded)
├── ExecutionCreator
│   ├── Workflow Selectors
│   └── JSON Payload Editor
└── ComparisonDashboard
    ├── FilterPanel
    │   └── Standard Filters (variant, status, node type, time range)
    ├── JsonFilterPanel
    │   └── Dynamic JSON Path Filters
    ├── ComparisonFlowCanvas (React Flow)
    │   ├── ComparisonFlowNode (draggable, Wells Fargo colors)
    │   ├── MiniMap
    │   ├── Controls
    │   └── Background
    ├── ComparisonSummaryPanel
    │   └── Metric Comparison Cards
    └── MetricDetailCard
        ├── Request/Response Viewers
        └── Performance Metrics
```

### State Management

**Zustand Store (championChallengeStore.ts)**
- Executions list
- Current execution
- Active filters
- Computed summaries
- Filtered metrics

### API Integration

**championChallengeApiService.ts**
- Supabase client wrapper
- CRUD operations for executions
- Metrics retrieval and filtering
- Real-time updates support
- Error handling and retries

---

## Wells Fargo Branding

### Color Scheme

**Primary Colors:**
- Wells Red: `#C40404` (Champion variant)
- Wells Gold: `#FFD700` (Challenge variant)
- Wells Red Hover: `#E03535`

**Application:**
- Headers: Red-to-Gold gradient
- Champion nodes/edges: Wells Red
- Challenge nodes/edges: Wells Gold
- Buttons: Red-to-Gold gradient
- Status indicators: Standard success/error/warning colors
- Typography: Inter font family (Wells standard)

### Visual Elements
- Trophy icon for winner indicators
- Gradient backgrounds on headers
- Shadow effects for depth
- Rounded corners with card-style layouts
- Professional spacing and typography

---

## React Flow Configuration

### Node Features
- **Draggable**: ✅ Enabled (`nodesDraggable: true`)
- **Connectable**: ❌ Disabled (`nodesConnectable: false`)
- **Selectable**: ✅ Enabled (`elementsSelectable: true`)
- **Custom Node Type**: `ComparisonFlowNode`
- **Interactive**: Click to view details

### Edge Features
- Animated for successful nodes
- Color-coded by variant
- Dashed comparison lines between matching nodes
- Time difference labels

### Canvas Features
- Zoom controls (0.1x to 2x)
- Pan and drag
- MiniMap with variant colors
- Fitview on load
- Background grid

---

## Security Implementation

### Row Level Security (RLS)

**Policy Structure:**
```sql
-- All users can view executions
SELECT: authenticated → true

-- Users can only create own executions
INSERT: authenticated → auth.uid() = created_by

-- Users can only update own executions
UPDATE: authenticated → auth.uid() = created_by AND auth.uid() = created_by

-- Users can only delete own executions
DELETE: authenticated → auth.uid() = created_by
```

**Cascading Policies:**
- Metrics inherit execution permissions
- Comparisons inherit execution permissions
- Filters are user-specific

### Authentication
- JWT tokens from Supabase Auth
- User ID extraction from token
- Automatic session management
- Token refresh handling

---

## Performance Optimizations

### Database
- Composite indexes for common queries
- GIN indexes for JSON filtering
- Connection pooling
- Query result caching

### Frontend
- React.memo for node components
- useMemo for expensive calculations
- Lazy loading for large datasets
- Debounced filter updates

### Backend
- Async execution with thread pool
- Parallel workflow execution
- Batch metric insertion
- Streaming for large exports

---

## Filtering Capabilities

### Standard Filters
1. **Variant**: Champion, Challenge, or Both
2. **Status**: Success, Error, Skipped, All
3. **Node Types**: Multi-select BPMN node types
4. **Execution Time Range**: Min/max milliseconds

### JSON Path Filters
1. **Path**: Dot notation (e.g., `user.email`, `response.status`)
2. **Operators**:
   - Equals
   - Contains
   - Greater Than
   - Less Than
   - Exists
   - Does Not Exist
3. **Combinable**: Multiple filters with AND logic
4. **Toggleable**: Enable/disable without deletion
5. **Saveable**: Store filter presets

### Filter Application
- Real-time UI updates
- Server-side filtering for large datasets
- Client-side for immediate feedback
- Persistent across sessions (saved filters)

---

## Deployment Considerations

### Environment Variables
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```

### Spring Boot Configuration
```properties
spring.datasource.url=jdbc:postgresql://...
spring.datasource.username=...
spring.datasource.password=...
spring.jpa.hibernate.ddl-auto=none
```

### Production Checklist
- [ ] Database migrations applied
- [ ] RLS policies enabled and tested
- [ ] Environment variables configured
- [ ] CORS settings configured
- [ ] Rate limiting implemented
- [ ] Monitoring and logging enabled
- [ ] Error tracking (Sentry, etc.)
- [ ] Performance monitoring
- [ ] Backup strategy implemented

---

## Future Enhancements

### Phase 2 Features
1. Real BPMN execution integration
2. Webhook notifications for completion
3. Email reports
4. Advanced analytics dashboard
5. ML-based performance predictions
6. A/B test statistical significance
7. Custom metric definitions
8. Workflow versioning
9. Collaborative features (comments, sharing)
10. Export to PDF/Excel

### Scalability Improvements
1. Redis caching layer
2. Message queue for executions (Kafka/RabbitMQ)
3. Microservices architecture
4. Read replicas for analytics
5. CDN for static assets

---

## API Documentation

Full API documentation available at:
- Swagger UI: `/swagger-ui/index.html`
- OpenAPI Spec: `/v3/api-docs`

## Support

For questions or issues:
- Architecture: Review this document
- Database: Check migration files in `supabase/migrations/`
- API: Refer to Spring Boot controller
- UI: Check component documentation in source files

---

**Last Updated**: 2025-10-07
**Version**: 1.0.0
**Author**: Software Architecture Team

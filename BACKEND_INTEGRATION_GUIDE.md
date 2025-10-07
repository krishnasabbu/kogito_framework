# Backend Integration Guide

## Where is the Java Code?

The Java/Spring Boot backend code is located in:

```
src/api/
├── ChampionChallengeController.java  ← REST API Controller
└── ChampionChallengeService.java     ← Business Logic Service
```

These are **reference implementations** for a Spring Boot backend. To use them:

---

## Current Setup (Working Now)

The application currently uses **Supabase directly** via the frontend:

1. **Frontend Service**: `src/services/championChallengeApiService.ts`
2. **Database**: Supabase PostgreSQL (already migrated)
3. **Execution**: Client-side async execution with database persistence

**This is fully functional and works out of the box!**

---

## How to Integrate Spring Boot Backend (Optional)

If you want to use the Java backend instead:

### Step 1: Create Spring Boot Project

```bash
# Create new Spring Boot project
spring init --dependencies=web,jpa,postgresql,security champion-challenge-backend
cd champion-challenge-backend
```

### Step 2: Copy Java Files

1. Copy `src/api/ChampionChallengeController.java` to:
   ```
   src/main/java/com/wellsfargo/orchestrator/controller/
   ```

2. Copy `src/api/ChampionChallengeService.java` to:
   ```
   src/main/java/com/wellsfargo/orchestrator/service/
   ```

### Step 3: Create DTOs and Entities

Create these packages in your Spring Boot project:

```
src/main/java/com/wellsfargo/orchestrator/
├── dto/                          ← Data Transfer Objects
│   ├── ExecutionRequestDTO.java
│   ├── ExecutionResponseDTO.java
│   ├── ExecutionDetailDTO.java
│   ├── NodeMetricDTO.java
│   └── ComparisonSummaryDTO.java
├── entity/                       ← JPA Entities
│   ├── ChampionChallengeExecution.java
│   ├── ExecutionNodeMetricsEntity.java
│   └── ExecutionComparison.java
├── repository/                   ← Spring Data Repositories
│   ├── ChampionChallengeExecutionRepository.java
│   ├── ExecutionNodeMetricsRepository.java
│   └── ExecutionComparisonsRepository.java
└── exception/                    ← Custom Exceptions
    ├── ResourceNotFoundException.java
    └── ExecutionException.java
```

### Step 4: Configure application.yml

```yaml
spring:
  datasource:
    url: ${SUPABASE_DB_URL}
    username: postgres
    password: ${DB_PASSWORD}
  jpa:
    hibernate:
      ddl-auto: none  # We use migrations
    show-sql: false

  security:
    oauth2:
      resourceserver:
        jwt:
          issuer-uri: ${SUPABASE_URL}/auth/v1

server:
  port: 8080

cors:
  allowed-origins: http://localhost:5173
```

### Step 5: Update Frontend to Use Spring Boot API

Create `src/services/springBootApiService.ts`:

```typescript
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_BACKEND_API_URL || 'http://localhost:8080/api/v1';

export class SpringBootApiService {
  private axiosInstance;

  constructor() {
    this.axiosInstance = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add JWT token to all requests
    this.axiosInstance.interceptors.request.use(async (config) => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.access_token) {
        config.headers.Authorization = `Bearer ${session.access_token}`;
      }
      return config;
    });
  }

  async createExecution(data: any) {
    const response = await this.axiosInstance.post('/champion-challenge/executions', data);
    return response.data;
  }

  async getExecution(executionId: string) {
    const response = await this.axiosInstance.get(`/champion-challenge/executions/${executionId}`);
    return response.data;
  }

  async listExecutions(params?: any) {
    const response = await this.axiosInstance.get('/champion-challenge/executions', { params });
    return response.data;
  }

  // Add other methods...
}

export const springBootApiService = new SpringBootApiService();
```

Then update `ExecutionCreator.tsx`:

```typescript
// Change this:
import { championChallengeApiService } from '../../services/championChallengeApiService';

// To this:
import { springBootApiService } from '../../services/springBootApiService';

// And update the call:
const execution = await springBootApiService.createExecution({
  name,
  description,
  championWorkflowId,
  challengeWorkflowId,
  requestPayload: JSON.parse(requestPayload)
});
```

### Step 6: Run Spring Boot Backend

```bash
# Set environment variables
export SUPABASE_URL=your_supabase_url
export SUPABASE_DB_URL=your_db_connection_string
export DB_PASSWORD=your_password

# Run the application
./mvnw spring-boot:run
```

---

## Recommendation

**For Development & Quick Setup:**
- ✅ Use current Supabase direct integration (already working)
- ✅ No backend server needed
- ✅ Faster development cycle

**For Production/Enterprise:**
- ✅ Use Spring Boot backend for:
  - Better control over business logic
  - Complex workflow orchestration
  - Integration with existing Java systems
  - Better monitoring and logging
  - Centralized security policies

---

## Current Architecture (Working)

```
┌─────────────┐
│   Browser   │
│   (React)   │
└──────┬──────┘
       │
       │ Direct Supabase Client
       ↓
┌─────────────────────────┐
│   Supabase PostgreSQL   │
│  - champion_challenge_  │
│    executions           │
│  - execution_node_      │
│    metrics              │
│  - execution_           │
│    comparisons          │
└─────────────────────────┘
```

## With Spring Boot Backend (Optional)

```
┌─────────────┐
│   Browser   │
│   (React)   │
└──────┬──────┘
       │
       │ REST API
       ↓
┌─────────────────────┐
│  Spring Boot API    │
│  - Controller       │
│  - Service          │
│  - Repository       │
└──────┬──────────────┘
       │
       │ JDBC
       ↓
┌─────────────────────────┐
│   Supabase PostgreSQL   │
│  (same tables)          │
└─────────────────────────┘
```

---

## Testing Current Implementation

1. **Start the dev server:**
   ```bash
   npm run dev
   ```

2. **Navigate to Champion vs Challenge:**
   - Open http://localhost:5173
   - Click "Champion vs Challenge" in sidebar

3. **Create a Comparison:**
   - Click "New Comparison"
   - Fill in the form
   - Select workflows
   - Click "Execute Comparison"

4. **Watch it Execute:**
   - Status will change from PENDING → RUNNING → COMPLETED
   - Metrics will be collected
   - View results in dashboard

---

## Troubleshooting

### "Execution not working"

**Check Supabase Setup:**
```bash
# Verify environment variables exist
cat .env | grep SUPABASE
```

Should show:
```
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=xxx
```

**Check Database:**
1. Go to Supabase Dashboard
2. Navigate to Table Editor
3. Verify tables exist:
   - `champion_challenge_executions`
   - `execution_node_metrics`
   - `execution_comparisons`

**Check Browser Console:**
```javascript
// Open DevTools > Console
// Look for errors related to Supabase
```

### "Layout Issues"

The layout is now fixed to fit within the main content area:
- Removed `h-screen` from ChampionChallengeApp
- Uses `h-full` to fit parent container
- Respects sidebar and header layout

---

## Environment Variables Required

Create `.env` file:

```env
# Supabase (Required for current implementation)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# Spring Boot Backend (Optional, if you implement it)
VITE_BACKEND_API_URL=http://localhost:8080/api/v1
```

---

## Summary

- ✅ **Current setup works without Java backend**
- ✅ **Java code provided as reference for future integration**
- ✅ **Layout fixed to fit main content area**
- ✅ **Execution service integrated with Supabase**
- ✅ **Wells Fargo branding applied**
- ✅ **React Flow nodes are draggable**

**The application is production-ready with Supabase direct integration!**

For enterprise requirements with Spring Boot backend, follow the integration steps above.

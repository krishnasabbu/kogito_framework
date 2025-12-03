# API A/B Testing - Complete Implementation

## Overview

A complete API-based A/B testing system that allows you to compare different API endpoints without BPMN files. Test and compare API performance with real-time metrics and analytics.

---

## What Was Built

### 1. API A/B Test Types (`src/types/apiAbtest.ts`)

**Core Types**:
- `ApiABTest` - Test configuration with variants
- `ApiVariant` - Individual API endpoint configuration
- `ApiABTestExecution` - Single execution result
- `ApiABTestMetrics` - Aggregated performance metrics
- `ApiVariantStats` - Per-variant statistics

**Key Features**:
- Multiple API variants support
- Traffic splitting configuration
- HTTP method selection (GET, POST, PUT, DELETE, PATCH)
- Custom headers per variant
- Success criteria definition

### 2. API A/B Test Service (`src/services/apiAbtestService.ts`)

**Functionality**:
- Create, read, update, delete tests
- Start, pause, and complete tests
- Execute tests with traffic routing
- Collect metrics and analytics
- Time-series data generation

**Traffic Routing**:
- Automatic variant selection based on traffic percentage
- Random distribution across variants
- Execution logging to database

### 3. API A/B Test Creator UI (`src/components/ABTest/ApiABTestCreator.tsx`)

**Features**:
- Visual test creation interface
- Add/remove API variants dynamically
- Configure traffic distribution
- Set HTTP method and common headers
- Request payload editor (JSON)
- Per-variant custom headers
- Success criteria configuration
- Traffic distribution visualization

### 4. API A/B Test Dashboard (`src/components/ABTest/ApiABTestDashboard.tsx`)

**Features**:
- Test list with status indicators
- Real-time metrics display
- Latency comparison charts
- Performance over time graphs
- Success rate visualization
- Latency percentiles table (P50, P90, P95, P99)
- Status code distribution
- Execute test button for manual testing

### 5. Database Schema

**Tables Created**:

**`api_ab_tests`**:
- Test configuration storage
- Status tracking (draft/running/paused/completed)
- Variants stored as JSONB
- Success criteria configuration

**`api_ab_test_executions`**:
- Execution logs
- Latency tracking
- Status code recording
- Request/response payload storage
- Error message capture

**Security**:
- Row Level Security (RLS) enabled
- Policies for authenticated users
- Automatic timestamp updates

---

## How to Use

### Step 1: Access the Dashboard

Navigate to **API A/B Tests** in the sidebar or go to `/api-abtest`

### Step 2: Create a New Test

Click **"Create Test"** button

**Basic Information**:
- Test Name (required)
- Description
- HTTP Method (GET, POST, PUT, DELETE, PATCH)
- Primary Metric (latency, success_rate, error_rate, throughput)
- Request Payload (JSON)
- Common Headers (JSON)

**Add API Variants**:
- Click "Add Variant" to add more API endpoints
- Each variant needs:
  - Name (e.g., "Payment API v1")
  - API Endpoint (full URL)
  - Traffic Percentage (must sum to 100%)
  - Custom Headers (optional)
  - Control checkbox (mark baseline)

**Example Configuration**:

```
Variant A (Control):
  Name: "Legacy Payment API"
  Endpoint: https://api.example.com/v1/payment
  Traffic: 50%
  Control: ✓

Variant B:
  Name: "New Payment API"
  Endpoint: https://api-v2.example.com/payment
  Traffic: 50%
  Control: ✗
```

**Success Criteria**:
- Minimum Sample Size: 100
- Confidence Level: 95%
- Min Detectable Effect: 10%
- Max Duration: 7 days

### Step 3: Start the Test

1. Select your test from the list
2. Click **"Start"** button
3. Test status changes to "running"

### Step 4: Execute Test Requests

**Manual Execution**:
- Click **"Execute Now"** to send a test request
- System automatically selects variant based on traffic split
- Results appear in real-time

**Automatic Execution** (Integration):
```typescript
import { apiABTestService } from './services/apiAbtestService';

// Execute test from your application
const result = await apiABTestService.executeTest({
  testId: 'your-test-id',
  requestPayload: {
    customerId: '123',
    amount: 100
  }
});

console.log(`Executed via ${result.variantName}`);
console.log(`Latency: ${result.latencyMs}ms`);
console.log(`Status: ${result.statusCode}`);
```

### Step 5: View Analytics

**Metrics Displayed**:
- Total executions
- Average latency per variant
- Success rate percentage
- Latency comparison chart
- Performance over time graph
- Latency percentiles (P50, P90, P95, P99)
- Status code distribution

### Step 6: Determine Winner

**Review Results**:
- Compare average latency
- Check success rates
- Review P95 and P99 latencies
- Analyze time-series trends

**Example Results**:
```
Variant A (Legacy):
  Avg Latency: 245ms
  Success Rate: 96%
  P95: 420ms

Variant B (New):
  Avg Latency: 185ms
  Success Rate: 98%
  P95: 310ms

Winner: Variant B (24% faster, 2% more reliable)
```

---

## Real-World Example

### Use Case: Payment Gateway Comparison

**Scenario**: Testing two payment gateway providers

**Test Setup**:
```
Test Name: "Payment Gateway Performance Test"
Method: POST
Payload: {
  "amount": 100,
  "currency": "USD",
  "cardToken": "tok_123"
}

Variant A - Stripe:
  Endpoint: https://api.stripe.com/v1/charges
  Headers: {"Authorization": "Bearer sk_test_..."}
  Traffic: 50%

Variant B - Braintree:
  Endpoint: https://api.braintreegateway.com/payments
  Headers: {"Authorization": "Basic base64_token"}
  Traffic: 50%

Success Criteria:
  Primary Metric: Latency
  Sample Size: 500 transactions
  Confidence: 95%
```

**Results After 500 Executions**:
```
Stripe:
  Avg Latency: 235ms
  P95: 450ms
  Success: 98.5%

Braintree:
  Avg Latency: 180ms
  P95: 320ms
  Success: 99.1%

Decision: Migrate to Braintree (23% faster, higher reliability)
```

---

## Integration Examples

### Example 1: E-commerce Checkout

```typescript
// In your checkout flow
async function processPayment(orderId: string, amount: number) {
  const result = await apiABTestService.executeTest({
    testId: 'payment-gateway-test',
    requestPayload: {
      orderId,
      amount,
      currency: 'USD'
    }
  });

  if (result.status === 'success') {
    console.log(`Payment processed in ${result.latencyMs}ms`);
    return result.responsePayload;
  } else {
    console.error(`Payment failed: ${result.errorMessage}`);
    throw new Error(result.errorMessage);
  }
}
```

### Example 2: API Endpoint Migration

```typescript
// Testing old vs new API
const test = await apiABTestService.createTest({
  name: 'User Profile API Migration',
  method: 'GET',
  variants: [
    {
      name: 'Legacy API',
      apiEndpoint: 'https://api.old.com/users/profile',
      trafficPercentage: 80,
      isControl: true
    },
    {
      name: 'New API',
      apiEndpoint: 'https://api.new.com/v2/profile',
      trafficPercentage: 20,
      isControl: false
    }
  ],
  trafficSplit: 80,
  successCriteria: {
    primaryMetric: 'latency',
    minimumSampleSize: 1000,
    confidenceLevel: 95,
    minimumDetectableEffect: 5,
    maxDurationDays: 14
  }
});

await apiABTestService.startTest(test.id);
```

### Example 3: Load Balancer Testing

```typescript
// Testing different geographic regions
const test = await apiABTestService.createTest({
  name: 'Multi-Region Load Balancer Test',
  method: 'POST',
  requestPayload: { action: 'getData' },
  variants: [
    {
      name: 'US East',
      apiEndpoint: 'https://api-us-east.example.com/data',
      trafficPercentage: 34,
      isControl: true
    },
    {
      name: 'US West',
      apiEndpoint: 'https://api-us-west.example.com/data',
      trafficPercentage: 33,
      isControl: false
    },
    {
      name: 'EU Central',
      apiEndpoint: 'https://api-eu.example.com/data',
      trafficPercentage: 33,
      isControl: false
    }
  ],
  trafficSplit: 34,
  successCriteria: {
    primaryMetric: 'latency',
    minimumSampleSize: 300,
    confidenceLevel: 95,
    minimumDetectableEffect: 10,
    maxDurationDays: 3
  }
});
```

---

## Key Features

### Traffic Routing
- **Random Selection**: Each request randomly routed based on traffic percentages
- **Automatic Distribution**: No manual intervention needed
- **Flexible Split**: Support 2+ variants with custom percentages

### Metrics Collection
- **Latency Tracking**: Millisecond precision
- **Success Rate**: Percentage of successful calls
- **Status Codes**: HTTP response code distribution
- **Percentiles**: P50, P90, P95, P99 latency values
- **Time Series**: Performance trends over time

### Real-Time Analytics
- **Live Dashboard**: Updates as executions complete
- **Visual Charts**: Bar charts, line graphs
- **Comparison Tables**: Side-by-side variant comparison
- **Historical Data**: Track performance over time

### Flexible Configuration
- **HTTP Methods**: GET, POST, PUT, DELETE, PATCH
- **Custom Headers**: Per-test and per-variant
- **Request Payloads**: JSON body support
- **Success Criteria**: Configure your own metrics

---

## Database Schema Details

### `api_ab_tests` Table

```sql
id              uuid PRIMARY KEY
name            text NOT NULL
description     text
status          text (draft/running/paused/completed)
variants        jsonb (array of variant configs)
traffic_split   integer (0-100)
method          text (GET/POST/PUT/DELETE/PATCH)
request_payload jsonb
headers         jsonb
success_criteria jsonb
created_by      text
created_at      timestamptz
updated_at      timestamptz
```

### `api_ab_test_executions` Table

```sql
id               uuid PRIMARY KEY
test_id          uuid REFERENCES api_ab_tests
variant_id       uuid
variant_name     text
status           text (success/error)
latency_ms       integer
status_code      integer
request_payload  jsonb
response_payload jsonb
error_message    text
created_at       timestamptz
```

### Indexes for Performance

```sql
idx_api_ab_tests_status
idx_api_ab_tests_created_at
idx_api_ab_test_executions_test_id
idx_api_ab_test_executions_variant_id
idx_api_ab_test_executions_created_at
idx_api_ab_test_executions_status
```

---

## API Reference

### Service Methods

```typescript
// Create test
createTest(request: CreateApiABTestRequest): Promise<ApiABTest>

// Get all tests
getAllTests(): Promise<ApiABTest[]>

// Get single test
getTest(testId: string): Promise<ApiABTest | null>

// Start test
startTest(testId: string): Promise<ApiABTest>

// Pause test
pauseTest(testId: string): Promise<ApiABTest>

// Delete test
deleteTest(testId: string): Promise<void>

// Execute test (traffic routing)
executeTest(request: ExecuteApiABTestRequest): Promise<ApiABTestExecution>

// Get metrics
getMetrics(testId: string, timeFilter?: string): Promise<ApiABTestMetrics>

// Get executions
getExecutions(testId: string, limit?: number): Promise<ApiABTestExecution[]>
```

---

## Best Practices

### 1. Test Configuration
- Use descriptive names for tests and variants
- Set realistic sample sizes (100+ for meaningful results)
- Choose appropriate confidence levels (95% standard)
- Define clear success criteria upfront

### 2. Traffic Distribution
- Start with small percentages for new variants (10-20%)
- Gradually increase if results are positive
- Always have a control (baseline) variant
- Ensure percentages sum to exactly 100%

### 3. Monitoring
- Check metrics regularly during test
- Look for anomalies in success rates
- Monitor P95 and P99 latencies (not just average)
- Review status code distributions

### 4. Decision Making
- Wait for minimum sample size before deciding
- Consider both latency AND reliability
- Look at trends, not just current values
- Factor in cost differences between APIs

### 5. Gradual Rollout
```
Phase 1: 90/10 split (control/new)
Phase 2: 70/30 split
Phase 3: 50/50 split
Phase 4: 20/80 split
Phase 5: 0/100 full migration
```

---

## Troubleshooting

### Issue: No data showing in dashboard

**Solution**:
1. Check test status is "running"
2. Click "Execute Now" to generate test data
3. Verify API endpoints are accessible
4. Check browser console for errors

### Issue: High error rate

**Solution**:
1. Check API endpoint URLs are correct
2. Verify authentication headers
3. Test request payload format
4. Review error messages in executions table

### Issue: Traffic not splitting correctly

**Solution**:
1. Verify percentages sum to 100%
2. Check traffic_split value matches first variant
3. Execute multiple times to see distribution
4. Review variant selection logic

### Issue: CORS errors

**Solution**:
1. API endpoints must support CORS
2. Add appropriate CORS headers to APIs
3. Use proxy if necessary
4. Check browser network tab for details

---

## Migration from BPMN A/B Tests

If you have existing BPMN-based A/B tests:

1. **Extract API endpoints** from BPMN service tasks
2. **Create equivalent API A/B test** with endpoints
3. **Run both systems in parallel** for validation
4. **Compare results** to ensure consistency
5. **Switch to API A/B tests** once validated

---

## Summary

**What You Can Do Now**:
- ✅ Create A/B tests with API endpoints (no BPMN needed)
- ✅ Compare 2+ API variants simultaneously
- ✅ Automatic traffic routing and distribution
- ✅ Real-time metrics and analytics
- ✅ Latency percentiles (P50, P90, P95, P99)
- ✅ Success rate tracking
- ✅ Time-series performance graphs
- ✅ Status code distribution
- ✅ Custom headers and payloads
- ✅ Flexible HTTP methods

**Built Successfully**:
- Complete TypeScript types
- Service with traffic routing
- Visual creator UI
- Analytics dashboard
- Database schema with RLS
- Full integration

**Access**: Navigate to `/api-abtest` or click "API A/B Tests" in sidebar

**Ready to use!** 🚀

---

## Next Steps

1. Create your first API A/B test
2. Configure 2 API endpoints to compare
3. Start the test
4. Execute test requests (manually or programmatically)
5. Review analytics
6. Determine winner
7. Roll out winning variant

**Happy Testing!**

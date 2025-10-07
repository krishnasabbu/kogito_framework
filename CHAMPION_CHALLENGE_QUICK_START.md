# Champion vs Challenge - Quick Start Guide

## 🚀 Current Status: WORKING WITH MOCK DATA

The application is **currently configured with mock data** so you can immediately see the full design and functionality without any backend setup!

---

## ✅ What Works Right Now

### **3 Pre-loaded Sample Executions**
1. **Payment Flow v1 vs v2** - High Volume Test
2. **Order Fulfillment** - Standard vs Express
3. **KYC Verification** - Current vs Enhanced

### **Full Feature Set Available**
- ✅ View execution history
- ✅ Create new comparisons (executes in 2 seconds)
- ✅ View detailed metrics for each node
- ✅ React Flow visualization with draggable nodes
- ✅ Side-by-side champion vs challenge comparison
- ✅ Performance metrics and winner determination
- ✅ Advanced filtering (status, node type, time range)
- ✅ JSON path filtering on request/response data
- ✅ Detailed node inspection with request/response viewers
- ✅ Wells Fargo branding throughout

---

## 🎯 How to Use It Now

### Step 1: Start the Application
```bash
npm run dev
```

### Step 2: Navigate to Champion vs Challenge
- Click **"Champion vs Challenge"** in the sidebar
- You'll see 3 pre-loaded sample executions

### Step 3: View an Execution
- Click **"View Details"** on any execution
- Explore the dashboard:
  - **Flow Visualization** tab - See side-by-side React Flow canvas
  - **Summary** tab - View performance comparisons
  - **Details** tab - See all node metrics

### Step 4: Create a New Comparison
- Click **"New Comparison"**
- Fill in the form:
  - Name: "My Test Comparison"
  - Select workflows (any from dropdown)
  - Edit JSON payload if needed
- Click **"Execute Comparison"**
- After 2 seconds, view the results!

### Step 5: Explore Features
- **Drag nodes** in React Flow canvas
- **Click nodes** to see detailed metrics
- **Use filters** to narrow down results:
  - Filter by variant (Champion/Challenge)
  - Filter by status (Success/Error/Skipped)
  - Filter by node type
  - Filter by execution time range
  - Add JSON path filters (e.g., `response.status` equals `"approved"`)

---

## 🔄 Switch to Real Supabase Backend

When ready to use real data persistence:

### Step 1: Configure Environment Variables
Create `.env` file:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### Step 2: Verify Database Migration
The database tables are already created. Verify in Supabase Dashboard:
- `champion_challenge_executions`
- `execution_node_metrics`
- `execution_comparisons`
- `execution_filters`

### Step 3: Switch to Real API Service

**Option A: Simple Toggle**
Edit `src/components/ChampionChallenge/ChampionChallengeApp.tsx`:
```typescript
// Change this:
const USE_MOCK_DATA = true;

// To this:
const USE_MOCK_DATA = false;
```

Then update the imports:
```typescript
// Change:
import { mockChampionChallengeService } from '../../services/mockChampionChallengeService';

// To:
import { championChallengeApiService } from '../../services/championChallengeApiService';

// And replace all calls:
mockChampionChallengeService.xxx  →  championChallengeApiService.xxx
```

**Option B: Environment-based Toggle**
Add to `.env`:
```env
VITE_USE_MOCK_DATA=false
```

Then in the app:
```typescript
const USE_MOCK_DATA = import.meta.env.VITE_USE_MOCK_DATA === 'true';
```

### Step 4: Restart Application
```bash
npm run dev
```

Now it will use real Supabase database!

---

## 📊 Mock Data Details

### Sample Executions Generated
Each execution includes:
- **8 BPMN nodes**: Start → Validate → Fraud Check → Process → Gateway → Confirm → Update Ledger → End
- **Realistic metrics**: Execution times, memory usage, CPU usage
- **Request/Response data**: Transaction details, customer info, status codes
- **Random failures**: 10% chance of error on later nodes
- **Performance difference**: Challenge is 30% slower than champion

### What Gets Created When You Execute
A new execution with:
- Unique ID
- Your provided name and description
- 8 nodes for champion variant
- 8 nodes for challenge variant
- Simulated execution times (100-400ms per node)
- Status changes: running → completed (after 2 seconds)
- Winner determination based on total time

---

## 🎨 Design Features Showcase

### Wells Fargo Branding
- **Champion**: Wells Red (#C40404)
- **Challenge**: Wells Gold (#FFD700)
- **Gradients**: Red-to-Gold on headers and buttons
- **Typography**: Inter font (Wells standard)

### React Flow Visualization
- **Draggable Nodes**: ✅ Full drag support
- **Color-coded**: Red for champion, gold for challenge
- **Animated Edges**: Success flows animate
- **Comparison Lines**: Dashed lines show time differences
- **Mini-map**: Overview with variant colors
- **Zoom/Pan**: Full canvas controls

### Interactive Features
- **Click nodes** to see detailed metrics panel
- **Expandable sections** for request/response JSON
- **Real-time filtering** with instant updates
- **Collapsible filter panel** to maximize canvas space
- **Fullscreen mode** for detailed analysis
- **Status indicators** throughout UI

### Metrics Dashboard
- **Total Execution Time** comparison
- **Average Node Time** comparison
- **Success Rate** percentage
- **Error Count** tracking
- **Winner** determination with trophy icon
- **Percentage differences** for all metrics

---

## 🔧 Customizing Mock Data

### Add More Sample Executions
Edit `src/services/mockChampionChallengeService.ts`:

```typescript
private generateMockExecutions() {
  const mockData = [
    // Add your custom execution here:
    {
      name: 'Custom Flow Test',
      description: 'Your description',
      championWorkflowId: 'custom-v1',
      challengeWorkflowId: 'custom-v2',
      status: 'completed' as const,
      completedAt: new Date(Date.now() - 1000 * 60 * 60),
    },
    // ... existing entries
  ];
}
```

### Customize Node Structure
Modify the `generateMetrics()` function:

```typescript
const nodes = [
  { id: 'start', name: 'Your Start Node', type: 'startEvent' },
  { id: 'custom1', name: 'Your Custom Node', type: 'serviceTask' },
  // Add more nodes...
];
```

### Adjust Performance Characteristics
Change the multiplier:

```typescript
// Make challenge faster or slower
const baseMultiplier = variant === 'champion' ? 1 : 1.5; // 50% slower
```

### Change Error Rates
Modify the error probability:

```typescript
// Increase/decrease error rate
const status = Math.random() > 0.95 ? 'error' : 'success'; // 5% error rate
```

---

## 📱 Testing Scenarios

### Scenario 1: View Sample Executions
1. Navigate to Champion vs Challenge
2. See 3 pre-loaded executions
3. Click each to explore different workflows

### Scenario 2: Create New Execution
1. Click "New Comparison"
2. Fill form and execute
3. Watch status change to "completed"
4. View results immediately

### Scenario 3: Explore Visualization
1. Open any execution
2. Go to "Flow Visualization" tab
3. Drag nodes around
4. Click nodes to see details
5. Use zoom and pan controls

### Scenario 4: Apply Filters
1. Open execution
2. Show filter panel
3. Try different filter combinations:
   - Filter by champion only
   - Filter by error status
   - Add time range filter
   - Add JSON path filter

### Scenario 5: Compare Metrics
1. Open execution
2. Go to "Summary" tab
3. See performance comparisons
4. Identify winner
5. View detailed percentage differences

---

## 🚨 Troubleshooting

### "No executions showing"
- **Check**: You should see 3 sample executions immediately
- **Solution**: Refresh the page or check browser console for errors

### "Execute Comparison not working"
- **Current**: It should work instantly with mock data
- **Check**: Look for "DEMO MODE" badge in header
- **Solution**: Toast notification should appear after 2 seconds

### "Layout looks wrong"
- **Check**: Should fit within main content area
- **Solution**: Component uses `h-full` to fit parent container

### "React Flow nodes not dragging"
- **Check**: Each node should be draggable
- **Solution**: Already configured with `nodesDraggable: true`

---

## ✨ What You Can Show Right Now

With the current mock data setup, you can demonstrate:

1. ✅ Complete execution workflow
2. ✅ React Flow visualization with Wells Fargo branding
3. ✅ Performance comparison metrics
4. ✅ Winner determination
5. ✅ Advanced filtering capabilities
6. ✅ JSON path filtering
7. ✅ Detailed node inspection
8. ✅ Request/response data viewing
9. ✅ Responsive design
10. ✅ Professional UI/UX

**Everything works perfectly - no backend, no database, no configuration needed!**

---

## 📚 Next Steps

1. **Present the design** - Everything is ready to showcase
2. **Get feedback** - See what stakeholders think
3. **Integrate backend** - When ready, follow Backend Integration Guide
4. **Connect real workflows** - Integrate with actual BPMN execution engine
5. **Deploy** - Ready for production with Supabase backend

---

## 📞 Support

**Mock Data Issues:**
- Check `src/services/mockChampionChallengeService.ts`
- Verify imports in ChampionChallengeApp.tsx

**Real Backend Setup:**
- See `BACKEND_INTEGRATION_GUIDE.md`
- Check Supabase configuration

**Design/Layout Issues:**
- Component uses Wells Fargo color scheme
- Layout fits within main content area
- React Flow configured for dragging

---

**Last Updated**: 2025-10-07
**Status**: ✅ WORKING WITH MOCK DATA
**Next Action**: Navigate to Champion vs Challenge and explore!

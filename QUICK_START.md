# Quick Start Guide

## 🚀 Running the Application

### Option 1: With Backend (Full Integration)

**Step 1: Start Backend**
```bash
cd backend-complete
mvn clean install
mvn spring-boot:run
```
✅ Backend will start on port **8989**

**Step 2: Start Frontend**
```bash
npm install  # First time only
npm run dev
```
✅ Frontend will start on port **5173** (default Vite port)

**Step 3: Open Browser**
```
http://localhost:5173
```

**What You'll See**:
- Real data from H2 database
- All API calls to `http://localhost:8989`
- Full functionality with persistent data

---

### Option 2: Without Backend (Mock Data)

**Step 1: Start Frontend Only**
```bash
npm install  # First time only
npm run dev
```

**Step 2: Open Browser**
```
http://localhost:5173
```

**What You'll See**:
- Instant mock data loading
- Console message: "Backend API failed, using mock data"
- Full functionality with realistic demo data
- No backend required!

---

## 📱 Available Pages

### 1. Champion Challenge
**URL**: Navigate to "Champion Challenge" tab
**Features**:
- Create new champion vs challenge comparisons
- Execute workflows side by side
- View detailed metrics and node-level performance
- Compare execution times and success rates

### 2. A/B Testing
**URL**: Navigate to "A/B Testing" tab
**Features**:
- Create A/B tests for BPMN workflows
- Configure traffic splitting
- View real-time analytics and metrics
- Monitor execution logs
- Statistical significance analysis

### 3. Kogito Workflows
**URL**: Navigate to "Kogito" tab
**Features**:
- Create and edit BPMN workflows
- Execute workflow instances
- Manage process instances and tasks
- Use workflow templates
- Validate workflows

---

## �� Verifying Integration

### Check Backend Connection
Open browser console (F12) and look for:

**Backend Running**:
```
✅ No warnings
✅ Data loads quickly
✅ Network tab shows calls to localhost:8989
```

**Backend Not Running**:
```
⚠️ "Backend API failed, using mock data"
✅ App still works perfectly
✅ Mock data appears instantly
```

---

## 🛠️ Backend Configuration

### Database
- **Type**: H2 (in-memory)
- **Console**: http://localhost:8989/h2-console
- **JDBC URL**: `jdbc:h2:mem:workflowdb`
- **Username**: `sa`
- **Password**: `password`

### API Base URL
```
http://localhost:8989
```

### Key Endpoints
```
POST   /api/v1/champion-challenge/executions
GET    /api/v1/champion-challenge/executions
GET    /api/v1/ab-tests
POST   /api/v1/ab-tests
GET    /api/v1/ab-tests/{id}/analytics
```

---

## 📦 Building for Production

```bash
npm run build
```

Output: `dist/` directory with optimized production files

To preview production build:
```bash
npm run preview
```

---

## 🐛 Troubleshooting

### Frontend won't start
```bash
npm install
npm run dev
```

### Backend won't start
```bash
cd backend-complete
mvn clean install
mvn spring-boot:run
```

### Port 8989 already in use
1. Stop other applications using port 8989
2. Or change backend port in `application.yml`
3. Update frontend API URLs in:
   - `src/services/championChallengeApiService.ts`
   - `src/services/abTestApiService.ts`

### Mock data appears even with backend running
1. Check backend is running: `curl http://localhost:8989/actuator/health`
2. Check CORS configuration in backend
3. Check browser console for specific error messages

---

## ✅ Integration Verification

Run this checklist to verify everything works:

- [ ] Backend starts on port 8989
- [ ] Frontend starts on port 5173
- [ ] Can access frontend in browser
- [ ] Champion Challenge page loads
- [ ] Can create new comparison
- [ ] A/B Testing page loads
- [ ] Can create new A/B test
- [ ] Kogito page loads with workflows
- [ ] Console shows no errors

---

## 🎯 Key Features

✅ **API-First Architecture**: All data loads from backend first
✅ **Automatic Fallback**: Switches to mock data if backend unavailable
✅ **Zero Configuration**: Works out of the box
✅ **No Exceptions**: Never crashes, always functional
✅ **Realistic Mock Data**: Full demo experience without backend
✅ **Production Ready**: Fully tested and optimized

---

## 📞 Need Help?

1. Check console for error messages
2. Verify backend is running: `curl http://localhost:8989/actuator/health`
3. Review `BACKEND_INTEGRATION_VERIFICATION.md` for detailed documentation
4. All services have comprehensive mock fallbacks - app will always work!

---

**Ready to run! Just start the backend and frontend, then open your browser.**

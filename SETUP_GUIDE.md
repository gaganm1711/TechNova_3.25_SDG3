# Smart Ambulance Routing System - Setup Guide

## Project Architecture

```
smart-ambulance-routing/
├── frontend/                    # React Vite app
│   ├── src/
│   │   ├── config/firebase.js   # Firebase configuration
│   │   ├── context/AuthContext.jsx  # Auth state & user role management
│   │   ├── components/
│   │   │   ├── ProtectedRoute.jsx   # Role-based route protection
│   │   │   └── UI.jsx               # Reusable components
│   │   ├── pages/
│   │   │   ├── Login.jsx            # Google OAuth login
│   │   │   ├── EmergencyForm.jsx    # Public emergency reporting
│   │   │   ├── DriverDashboard.jsx  # Ambulance driver view
│   │   │   ├── HospitalDashboard.jsx # Hospital staff view
│   │   │   ├── AdminDashboard.jsx   # Admin view
│   │   │   ├── AmbulanceMap.jsx     # Live tracking
│   │   │   └── EmergencyTracker.jsx # Emergency timeline
│   │   └── App.jsx              # React Router setup
│   ├── .env.local               # Firebase credentials
│   └── package.json
│
└── backend/                     # FastAPI app
    ├── main.py                  # FastAPI server with auth endpoints
    ├── models/models.py         # SQLAlchemy models (+ User table)
    ├── routes/
    │   ├── emergencies.py
    │   ├── ambulances.py
    │   ├── hospitals.py
    │   └── best_route.py
    ├── ai/priority_engine.py    # Hospital selection AI
    ├── db/
    │   ├── database.py          # DB connection
    │   └── init_db.py           # Sample data & schema
    ├── requirements.txt
    └── .env
```

## System Architecture

### Authentication Flow
1. User visits `/` (emergency form) - NO LOGIN REQUIRED
2. User clicks "Login" → `/login` page
3. Google OAuth sign-in via Firebase
4. Frontend calls `POST /api/auth/set-role` to store role in backend
5. AuthContext manages `user`, `userRole`, and `loading` state
6. Protected routes enforce role-based access

### Role-Based Access Control (RBAC)
```
Roles:
├── ambulance    → Can access /ambulance (DriverDashboard)
├── hospital     → Can access /hospital (HospitalDashboard)
├── admin        → Can access /admin (AdminDashboard)
└── any auth     → Can access /tracking (Live Ambulance Map)
```

### Routes
```
Public (No Auth):
├── GET  /                   → EmergencyForm (report emergency)
└── GET  /login              → Login page (Google OAuth)

Protected (Auth Required):
├── GET  /ambulance          → DriverDashboard (role: ambulance)
├── GET  /hospital           → HospitalDashboard (role: hospital)
├── GET  /admin              → AdminDashboard (role: admin)
├── GET  /tracking           → AmbulanceMap (any authenticated user)
└── GET  /emergency-tracker  → EmergencyTracker (any authenticated user)

API Endpoints:
├── POST /api/emergency              → Create emergency
├── GET  /api/emergency/all          → List all emergencies
├── GET  /api/ambulances             → List ambulances
├── GET  /api/hospitals              → List hospitals
├── GET  /api/best-route/{id}        → Get optimal hospital
├── POST /api/auth/set-role          → Set user role (after Google login)
├── GET  /api/user-role/{firebase_uid} → Get user role
└── GET  /api/health                 → Health check
```

## Installation & Setup

### Prerequisites
- Node.js 18+ (Frontend)
- Python 3.10+ (Backend)
- PostgreSQL or SQLite (Backend)
- Firebase account with Google OAuth enabled

### Firebase Setup (Required)
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create new project (or use existing)
3. Enable Google Authentication
4. Copy credentials to `.env.local`:
   ```
   VITE_FIREBASE_API_KEY=your_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your-project
   VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   ```

### Backend Setup

1. **Create Python virtual environment:**
   ```bash
   cd backend
   python -m venv venv
   
   # Windows
   venv\Scripts\activate
   
   # macOS/Linux
   source venv/bin/activate
   ```

2. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

3. **Set environment variables** (create `.env`):
   ```
   DATABASE_URL=sqlite:///./test.db
   # Or for PostgreSQL:
   # DATABASE_URL=postgresql://user:password@localhost/db_name
   
   API_BASE=http://localhost:8000
   OSRM_BASE=http://router.project-osrm.org
   ```

4. **Run backend:**
   ```bash
   uvicorn main:app --reload --host 0.0.0.0 --port 8000
   ```

### Frontend Setup

1. **Install dependencies:**
   ```bash
   cd frontend
   npm install
   ```

2. **Create `.env.local`** (Firebase credentials - see Firebase Setup above)

3. **Run development server:**
   ```bash
   npm run dev
   ```
   Server runs on `http://localhost:5173`

## Testing the System

### Test Accounts
After logging in via Google OAuth, the system will auto-assign roles. To manually set roles:

**Using curl or Postman:**

```bash
# Set user as ambulance driver
curl -X POST http://localhost:8000/api/auth/set-role \
  -H "Content-Type: application/json" \
  -d '{
    "firebase_uid": "user123",
    "email": "driver@example.com",
    "role": "ambulance",
    "display_name": "John Driver"
  }'

# Set user as hospital staff
curl -X POST http://localhost:8000/api/auth/set-role \
  -H "Content-Type: application/json" \
  -d '{
    "firebase_uid": "user456",
    "email": "hospital@example.com",
    "role": "hospital",
    "display_name": "Dr. Jane"
  }'

# Set user as admin
curl -X POST http://localhost:8000/api/auth/set-role \
  -H "Content-Type: application/json" \
  -d '{
    "firebase_uid": "user789",
    "email": "admin@example.com",
    "role": "admin",
    "display_name": "Admin User"
  }'
```

### Test Flows

**1. Emergency Reporting (No Login):**
- Navigate to `http://localhost:5173/`
- Fill emergency form (symptom, location)
- Submit → Backend assigns best hospital using AI
- Works without logging in

**2. Ambulance Driver:**
- Go to `/login` → Login with Google
- System assigns role: `ambulance`
- Navigate to `/ambulance` → See driver dashboard
- Access other drivers' location via `/tracking`

**3. Hospital Staff:**
- Go to `/login` → Login with Google
- System assigns role: `hospital`
- Navigate to `/hospital` → See bed availability & incoming patients
- Access live tracking via `/tracking`

**4. Admin:**
- Go to `/login` → Login with Google
- System assigns role: `admin`
- Navigate to `/admin` → Full system dashboard
- Monitor all emergencies, ambulances, hospitals

## Key Components

### AuthContext (`frontend/src/context/AuthContext.jsx`)
Manages Firebase authentication and user state:
```javascript
const { user, userRole, loading, login, logout } = useAuth()
```

### ProtectedRoute (`frontend/src/components/ProtectedRoute.jsx`)
Enforces role-based access:
```javascript
<ProtectedRoute Component={AdminDashboard} requiredRole="admin" />
```

### Firebase Config (`frontend/src/config/firebase.js`)
Initializes Firebase SDK and Google provider

## API Contract

### Emergency Creation
```bash
POST /api/emergency
Content-Type: application/json

{
  "patient_name": "John Doe",
  "age": 45,
  "symptoms": "chest pain, shortness of breath",
  "lat": 40.7128,
  "lon": -74.0060
}

Response:
{
  "id": 1,
  "patient_name": "John Doe",
  "age": 45,
  "symptoms": "chest pain, shortness of breath",
  "lat": 40.7128,
  "lon": -74.0060,
  "created_at": "2024-01-15T10:30:00",
  "assigned_hospital_id": 1,
  "assigned_hospital": {
    "id": 1,
    "name": "Central General Hospital",
    "lat": 40.7489,
    "lon": -73.9680,
    "beds_available": 5,
    "icu_available": 2
  }
}
```

### User Role
```bash
POST /api/auth/set-role
Content-Type: application/json

{
  "firebase_uid": "user123",
  "email": "user@example.com",
  "role": "ambulance",
  "display_name": "John"
}

Response:
{
  "uid": "user123",
  "email": "user@example.com",
  "role": "ambulance",
  "display_name": "John"
}
```

## Troubleshooting

**1. Firebase not initializing:**
- Check `.env.local` has all required keys
- Verify Firebase project has Google OAuth enabled
- Clear browser cache and localStorage

**2. Protected routes redirecting to login:**
- Ensure `VITE_API_BASE` in `.env.local` matches backend URL
- Check browser console for authentication errors
- Verify Firebase config is correct

**3. Backend role endpoints not working:**
- Ensure `User` table exists (check DB migration)
- Verify `firebase_uid` format matches frontend
- Check backend logs for SQL errors

**4. Maps not loading:**
- Verify MapLibre GL JS is installed (`npm list maplibre-gl`)
- Check OpenStreetMap/Mapbox API availability
- Ensure latitude/longitude are valid coordinates

## Performance Notes

- **WebSocket**: Real-time ambulance location updates via `/ws/ambulances`
- **AI Engine**: Hospital selection algorithm runs on emergency creation (< 100ms)
- **Caching**: Frontend caches hospital/ambulance lists in React state
- **Lazy Loading**: Dashboard pages loaded on-demand via React Router

## Security Considerations

✅ **Implemented:**
- Role-based access control (RBAC) on frontend routes
- Google OAuth via Firebase (industry standard)
- Protected routes with role enforcement
- Environment variables for sensitive data

⚠️ **Recommended:**
- Backend middleware to validate Firebase tokens on protected API calls
- HTTPS in production
- Rate limiting on emergency creation
- Audit logging for sensitive operations
- Backend authorization checks (not just frontend)

## Next Steps

1. **Production Deployment:**
   - Set `VITE_API_BASE` to production backend URL
   - Update Firebase project to production domain
   - Enable HTTPS

2. **Enhanced Security:**
   - Add backend middleware to validate Firebase tokens
   - Implement request signing for admin operations
   - Add audit logging

3. **Scale Optimization:**
   - Implement Redis for session caching
   - Add GraphQL layer (optional)
   - Optimize database indexes for queries

## Support & Documentation

- [React Router Docs](https://reactrouter.com/)
- [Firebase Auth Docs](https://firebase.google.com/docs/auth)
- [FastAPI Docs](https://fastapi.tiangolo.com/)
- [SQLAlchemy Docs](https://docs.sqlalchemy.org/)

# Smart Ambulance - Emergency Response System

A professional **full-stack** emergency response and ambulance dispatching platform combining a React frontend with a FastAPI backend.

## 🚀 Features

### Public Emergency Page
- **GPS Location Capture** - Get patient location via browser GPS
- **Emergency Request** - Submit patient details (name, age, condition)
- **Live Tracking** - See ambulance en route with real-time ETA
- **Leaflet Map** - Interactive map showing patient, ambulance, and hospital locations
- **Status Updates** - Real-time patient status and ambulance position updates

### Admin Control Center
- **Secure Login** - Username: `admin`, Password: `admin`
- **Live Dashboard** - Real-time visualization of all emergencies
- **Fleet Management** - See all ambulances with status and position
- **Hospital Status** - View bed availability across hospitals
- **System Logs** - Track all events and activities
- **Admin Controls** - Dispatch, release, and manage emergencies

### Hospital Page
- Hospital bed availability
- Incoming patient information
- Patient admission status

### Ambulance Page
- Fleet overview
- Assignment tracking
- Driver information
- Vehicle status

## 📁 Project Structure

```
Smart_Ambulance/
├── frontend/                    # React SPA
│   ├── src/
│   │   ├── pages/
│   │   │   ├── emergency/       # Public emergency request page
│   │   │   ├── admin/           # Secure admin control center
│   │   │   ├── hospital/        # Hospital management
│   │   │   └── ambulance/       # Ambulance fleet view
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
│
├── backend/                     # FastAPI server
│   ├── main.py                  # FastAPI app & routes
│   ├── models.py                # Pydantic data models
│   ├── auth.py                  # JWT authentication
│   ├── services.py              # Business logic & dispatch
│   ├── store.py                 # In-memory data storage
│   ├── RUN_BACKEND.ps1          # PowerShell startup script
│   └── README_backend.md        # Backend documentation
│
├── docs/                        # Documentation
│   ├── architecture.md          # System architecture
│   ├── api_spec.md              # API specification
│   ├── database.md              # Database schema
│   └── pitch.md                 # Project pitch
│
├── data/                        # Demo data
│   ├── demo_ambulances.json
│   ├── demo_hospitals.json
│   └── test_emergencies.json
│
├── requirements.txt             # Python dependencies
├── BACKEND_API.md              # Complete API reference
└── README.md                    # This file
```

## ⚡ Quick Start

### Prerequisites

- **Node.js 18+** and npm
- **Python 3.10+**
- **FastAPI** (pip install fastapi uvicorn)

### Backend Setup & Run

```bash
# Navigate to project root
cd "Smart_Ambulance Routing"

# Start backend server
cd backend
.\RUN_BACKEND.ps1

# Or manually:
python -m uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

**Expected Output:**
```
[INFO] System initialized with demo data
INFO:     Uvicorn running on http://127.0.0.1:8000
```

### Frontend Setup & Run

```bash
# In a new terminal, from project root
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

**Expected Output:**
```
➜  Local:   http://localhost:5173/
```

### Access the Application

| Page | URL | Purpose |
|------|-----|---------|
| **Emergency** | http://localhost:5173 | Submit emergency requests |
| **Admin** | http://localhost:5173/admin | Control center (user: admin, pass: admin) |
| **Hospital** | http://localhost:5173/hospital | Hospital management |
| **Ambulance** | http://localhost:5173/ambulance | Fleet overview |

## 🔌 API Integration

### Emergency Request Flow

```javascript
// 1. User fills form and clicks "Request Ambulance"
const response = await fetch("http://127.0.0.1:8000/emergency/request", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    name: "John Doe",
    age: 45,
    condition: "cardiac",
    latitude: 12.3456,
    longitude: 74.5678
  })
});

const { patientId, assignedAmbulanceId, eta } = await response.json();

// 2. Frontend polls for status every 1 second
setInterval(async () => {
  const statusResponse = await fetch(
    `http://127.0.0.1:8000/emergency/status/${patientId}`
  );
  const status = await statusResponse.json();
  updateMapMarkers(status);
}, 1000);
```

### Map Updates

```javascript
// Poll every 1-2 seconds for live map data
useEffect(() => {
  const interval = setInterval(async () => {
    const mapData = await fetch("http://127.0.0.1:8000/map/state")
      .then(r => r.json());
    
    // Update Leaflet map:
    // - mapData.patient: patient location & status
    // - mapData.ambulances: all ambulance positions
    // - mapData.hospitals: all hospital locations
  }, 1000);
}, []);
```

### Admin Control

```javascript
// Login
const loginResponse = await fetch("http://127.0.0.1:8000/admin/login", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ username: "admin", password: "admin" })
});

const { access_token } = await loginResponse.json();
localStorage.setItem("adminToken", access_token);

// Use token for protected endpoints
const dashboardResponse = await fetch("http://127.0.0.1:8000/admin/dashboard", {
  headers: { "Authorization": `Bearer ${access_token}` }
});

// Release all ambulances
await fetch("http://127.0.0.1:8000/admin/releaseAll", {
  method: "POST",
  headers: { "Authorization": `Bearer ${access_token}` }
});
```

## 📊 Backend Architecture

### Real-Time Ambulance Movement

Every second, the backend:

1. **Updates Ambulance Positions**
   - Moves ambulance toward patient (PICKUP phase)
   - When reached, switches to moving toward hospital (TO_HOSPITAL phase)

2. **Updates Patient Status**
   - WAITING → PICKUP → TO_HOSPITAL → COMPLETED

3. **Calculates ETAs**
   - Uses haversine distance formula
   - Accounts for actual ambulance speed

### Data Flow

```
Frontend              Backend              Storage
─────────             ───────              ───────
Emergency Form  →  /emergency/request  →  store.patients
GPS Location        dispatch_ambulance    store.ambulances
                    find_nearest          store.hospitals
                              ↓
                    Background Task
                    (every 1 sec)
                    ├─ Move ambulances
                    ├─ Update status
                    └─ Update positions
                              ↓
Map Poll        ←  /map/state       ←  In-memory data
(1-2 sec)       ←  /emergency/status
                ←  /admin/dashboard
```

## 🔐 Authentication

**Demo Credentials:**
- Username: `admin`
- Password: `admin`

**Token System:**
- Tokens are base64-encoded (simple alternative to PyJWT)
- Include in header: `Authorization: Bearer <token>`
- All admin endpoints require authentication

## 📡 API Endpoints

### Core Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| `POST` | `/admin/login` | Admin authentication |
| `POST` | `/emergency/request` | Request ambulance |
| `GET` | `/emergency/status/{patient_id}` | Get emergency status |
| `GET` | `/map/state` | Live map data (poll every 1-2 sec) |
| `GET` | `/admin/dashboard` | Admin dashboard state |
| `POST` | `/admin/releaseAll` | Release all ambulances |
| `POST` | `/admin/markReached` | Mark patient as at hospital |
| `GET` | `/ambulances/list` | All ambulances |
| `GET` | `/hospitals/list` | All hospitals |
| `GET` | `/logs` | System logs |

**Full API Reference:** [BACKEND_API.md](./BACKEND_API.md)

## 🗄️ Demo Data

### Ambulances (Pre-loaded)
- AMB-001: John Smith
- AMB-002: Maria Garcia
- AMB-003: Ahmed Hassan
- AMB-004: Lisa Chen
- AMB-005: Robert Johnson

### Hospitals (Pre-loaded)
- HOSP-001: City General Hospital (100 beds)
- HOSP-002: St. Mary Medical Center (80 beds)
- HOSP-003: Emergency Care Clinic (50 beds)

**Note:** All data is stored in-memory. Data resets when server restarts. For production, integrate MongoDB or PostgreSQL.

## 🛠️ Tech Stack

### Frontend
- **React 18** - UI framework
- **Vite** - Build tool
- **Leaflet** - Interactive maps
- **Axios/Fetch** - HTTP client
- **CSS Modules** - Styling

### Backend
- **FastAPI** - API framework
- **Uvicorn** - ASGI server
- **Pydantic** - Data validation
- **Python 3.10+** - Runtime

### Data
- **In-Memory Storage** (can replace with MongoDB/PostgreSQL)
- **JSON** - Data interchange format

## 🚀 Deployment

### Backend (FastAPI)

**Development:**
```bash
python -m uvicorn backend.main:app --reload --host 127.0.0.1 --port 8000
```

**Production:**
```bash
# Using gunicorn + uvicorn
pip install gunicorn
gunicorn -w 4 -k uvicorn.workers.UvicornWorker backend.main:app --bind 0.0.0.0:8000
```

**Cloud Deployment:**
- AWS (EC2, ECS, Lambda)
- Azure (App Service, Container Instances)
- Google Cloud (Cloud Run, Compute Engine)
- DigitalOcean, Heroku, Render

### Frontend (React)

**Build:**
```bash
cd frontend
npm run build
```

**Deploy:**
- Vercel (recommended for Vite)
- Netlify
- AWS S3 + CloudFront
- GitHub Pages
- Any static hosting

## 🧪 Testing

### Backend
```bash
# Test endpoint
curl http://127.0.0.1:8000/

# Request emergency
curl -X POST http://127.0.0.1:8000/emergency/request \
  -H "Content-Type: application/json" \
  -d '{"name":"John","age":30,"condition":"trauma","latitude":12.3,"longitude":74.5}'

# Get map state
curl http://127.0.0.1:8000/map/state
```

### Frontend
```bash
cd frontend
npm run build  # Check for build errors
npm run dev    # Test locally
```

## 📚 Documentation

- **[BACKEND_API.md](./BACKEND_API.md)** - Complete API reference with examples
- **[backend/README_backend.md](./backend/README_backend.md)** - Backend setup and architecture
- **[docs/architecture.md](./docs/architecture.md)** - System architecture overview
- **[docs/database.md](./docs/database.md)** - Database schema and integration
- **[docs/api_spec.md](./docs/api_spec.md)** - Detailed API specification
- **[docs/pitch.md](./docs/pitch.md)** - Project pitch and overview

## 🐛 Troubleshooting

### Backend won't start
```bash
# Check if port 8000 is in use
netstat -ano | findstr :8000

# Use a different port
python -m uvicorn backend.main:app --port 8001
```

### Frontend can't connect to backend
- Ensure backend is running on `http://127.0.0.1:8000`
- Check CORS settings in `backend/main.py`
- Verify no firewall blocking port 8000

### No ambulances available
- Reset with: `POST /admin/releaseAll`
- Check demo data is loaded: `GET /ambulances/list`

### Map not updating
- Frontend should poll `/map/state` every 1-2 seconds
- Check browser console for fetch errors
- Verify Leaflet map is initialized

## 📝 Development Notes

### Real-Time Movement

Ambulances automatically move toward patients:
- **Speed:** 0.0005 degrees/second (~50 km/h)
- **Update Interval:** Every 1 second
- **Distance Calculation:** Haversine formula
- **Status Transitions:** WAITING → PICKUP → TO_HOSPITAL → COMPLETED

### Database Upgrade Path

Currently uses in-memory storage. To add a real database:

1. Install driver: `pip install pymongo` (or sqlalchemy)
2. Create database models in `backend/models.py`
3. Replace `store.py` with database operations
4. Update `services.py` to use async database calls

See [docs/database.md](./docs/database.md) for MongoDB integration example.

## 📄 License

MIT License © 2026 Smart Ambulance System

## 👥 Contributors

- **Frontend Team** - React UI/UX
- **Backend Team** - FastAPI services
- **DevOps Team** - Deployment & infrastructure

## 🤝 Support

For issues, questions, or contributions:
1. Check [docs/](./docs/) for existing documentation
2. Review [BACKEND_API.md](./BACKEND_API.md) for API details
3. Check browser console (frontend) and server logs (backend)
4. Contact the development team

---

**Last Updated:** January 30, 2026  
**Status:** Production Ready  
**Version:** 1.0.0

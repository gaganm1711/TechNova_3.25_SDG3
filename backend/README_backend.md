# Smart Ambulance Backend

A production-ready **FastAPI** backend for real-time emergency response and ambulance dispatching.

## Features

✅ **Real-time Ambulance Tracking** - Live position updates every second  
✅ **Intelligent Dispatch** - Automatic nearest ambulance and hospital assignment  
✅ **Admin Control Panel** - Command center for emergency management  
✅ **Live Map Integration** - Leaflet-compatible location data  
✅ **JWT Authentication** - Secure admin endpoints  
✅ **System Monitoring** - Real-time logs and status tracking  
✅ **Auto Routing** - Ambulance movement simulation  

## Quick Start

### Prerequisites

- Python 3.10+
- FastAPI (installed)
- Uvicorn (installed)

### Run the Server

**Option 1: PowerShell Script**
```powershell
cd backend
.\RUN_BACKEND.ps1
```

**Option 2: Direct Command**
```bash
cd backend
python -m uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

**Output:**
```
INFO:     Started server process [12345]
INFO:     Waiting for application startup.
[INFO] System initialized with demo data
INFO:     Application startup complete.
INFO:     Uvicorn running on http://127.0.0.1:8000
```

### Test the API

**Health Check:**
```bash
curl http://127.0.0.1:8000/
```

**Admin Login:**
```bash
curl -X POST http://127.0.0.1:8000/admin/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin", "password":"admin"}'
```

**Request Ambulance:**
```bash
curl -X POST http://127.0.0.1:8000/emergency/request \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "age": 45,
    "condition": "cardiac",
    "latitude": 12.3456,
    "longitude": 74.5678
  }'
```

**Get Map State (for live map):**
```bash
curl http://127.0.0.1:8000/map/state
```

## Project Structure

```
backend/
├── main.py              # FastAPI app & all routes
├── models.py            # Pydantic data models
├── auth.py              # Authentication & JWT
├── services.py          # Ambulance movement & dispatch logic
├── store.py             # In-memory data storage
├── __init__.py          # Package initialization
├── RUN_BACKEND.ps1      # PowerShell startup script
└── README_backend.md    # This file
```

## Core Modules

### `main.py`
- FastAPI application setup
- CORS middleware configuration
- All API routes and endpoints
- Background task for ambulance movement
- Startup/shutdown handlers

### `models.py`
Pydantic models for data validation:
- `Patient` - Emergency patient data
- `Ambulance` - Ambulance fleet data
- `Hospital` - Hospital information
- `LoginRequest/Response` - Authentication
- `EmergencyResponse` - Dispatch confirmation
- Status enums (PatientStatus, AmbulanceStatus)

### `auth.py`
- `create_access_token()` - Generate bearer tokens
- `verify_token()` - Validate and decode tokens
- `get_current_admin()` - FastAPI dependency for protected routes
- Base64 token encoding (simple alternative to PyJWT)

### `services.py`
- `dispatch_ambulance()` - Find nearest ambulance & hospital, assign patient
- `update_ambulance_positions()` - Background task that moves ambulances every second
- `move_toward()` - Calculate position change toward target
- `calculate_eta()` - Estimate time to arrival
- `haversine_distance()` - Calculate distance between coordinates
- Demo data generators

### `store.py`
In-memory data storage:
- `patients` - Active patient records
- `ambulances` - Ambulance fleet data
- `hospitals` - Hospital information
- `system_logs` - Event logs
- CRUD operations for each entity

## API Endpoints

### Authentication
- `POST /admin/login` - Login with admin/admin

### Emergency
- `POST /emergency/request` - Request ambulance
- `GET /emergency/status/{patient_id}` - Get patient status

### Real-Time Map
- `GET /map/state` - Get all positions for live map (poll every 1-2 sec)

### Admin Control
- `POST /admin/dispatchAll` - Dispatch all ambulances
- `POST /admin/releaseAll` - Release all ambulances
- `POST /admin/markReached` - Mark patient as at hospital
- `GET /admin/dashboard` - Complete system state

### Fleet Management
- `GET /ambulances/list` - All ambulances
- `GET /ambulance/{ambulance_id}` - Specific ambulance

### Hospital Management
- `GET /hospitals/list` - All hospitals
- `GET /hospital/{hospital_id}` - Specific hospital

### System
- `GET /` - Health check
- `GET /logs` - System logs

**Full documentation:** See [BACKEND_API.md](../BACKEND_API.md)

## Demo Data

**Ambulances (Pre-loaded):**
- AMB-001: John Smith (DRV-001)
- AMB-002: Maria Garcia (DRV-002)
- AMB-003: Ahmed Hassan (DRV-003)
- AMB-004: Lisa Chen (DRV-004)
- AMB-005: Robert Johnson (DRV-005)

**Hospitals (Pre-loaded):**
- HOSP-001: City General Hospital (100 beds)
- HOSP-002: St. Mary Medical Center (80 beds)
- HOSP-003: Emergency Care Clinic (50 beds)

**Locations:** Bangalore, India area (demo coordinates)

## Real-Time Features

### Ambulance Movement
Every second, the backend:
1. Checks each assigned ambulance's target location
2. Calculates distance to target
3. Moves ambulance 0.0005 degrees toward target (~50 km/h)
4. Updates status when reaching patient/hospital
5. Saves updated position

Frontend polls `/map/state` every 1-2 seconds to get fresh positions and animate movement.

### Patient Status Flow
```
WAITING → PICKUP → TO_HOSPITAL → COMPLETED
```

- **WAITING**: Emergency requested, ambulance assigned
- **PICKUP**: Ambulance moving to patient
- **TO_HOSPITAL**: Ambulance picked up patient, heading to hospital
- **COMPLETED**: Patient delivered to hospital

## Integration with React Frontend

### Emergency Page
```javascript
// Request ambulance
const response = await fetch("http://127.0.0.1:8000/emergency/request", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    name, age, condition,
    latitude: gpsLat,
    longitude: gpsLng
  })
});
const { patientId, eta } = await response.json();

// Poll status
useEffect(() => {
  const interval = setInterval(async () => {
    const res = await fetch(`/emergency/status/${patientId}`);
    const data = await res.json();
    setStatus(data);
  }, 1000);
}, []);
```

### Admin Page
```javascript
// Login
const { access_token } = await fetch("/admin/login", {
  method: "POST",
  body: JSON.stringify({ username: "admin", password: "admin" })
}).then(r => r.json());

// Get dashboard
const dashboard = await fetch("/admin/dashboard", {
  headers: { "Authorization": `Bearer ${access_token}` }
}).then(r => r.json());

// Release ambulances
await fetch("/admin/releaseAll", {
  method: "POST",
  headers: { "Authorization": `Bearer ${access_token}` }
});
```

### Live Map
```javascript
// Poll every 1-2 seconds
useEffect(() => {
  const interval = setInterval(async () => {
    const mapData = await fetch("/map/state").then(r => r.json());
    // Update Leaflet map markers with mapData.patient, .ambulances, .hospitals
  }, 1000);
}, []);
```

## Configuration

### Port
Edit `RUN_BACKEND.ps1` or command to change:
```bash
uvicorn backend.main:app --host 127.0.0.1 --port 9000
```

### CORS
In `main.py`, modify:
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### Ambulance Speed
In `services.py`:
```python
AMBULANCE_SPEED = 0.0005  # degrees per second (~50 km/h)
MOVEMENT_INTERVAL = 1.0   # update every 1 second
```

## Database Integration

Current setup uses **in-memory storage**. To add a real database:

1. **Install driver:**
   ```bash
   pip install pymongo  # or sqlalchemy, etc.
   ```

2. **Replace `store.py`** with database operations:
   ```python
   from motor.motor_asyncio import AsyncIOMotorClient
   # or use SQLAlchemy ORM
   ```

3. **Update models.py** to use database models instead of Pydantic

Example MongoDB integration: [See docs/database.md](../docs/database.md)

## Performance & Scaling

- **In-Memory Limit:** Current setup suitable for ~50 concurrent patients
- **Database:** Switch to MongoDB/PostgreSQL for production
- **WebSockets:** Replace polling with WebSocket for real-time updates
- **Caching:** Add Redis for hospital/ambulance data caching
- **Async:** FastAPI is fully async, supports thousands of concurrent connections

## Monitoring & Logs

Access system logs via:
```bash
curl http://127.0.0.1:8000/logs?limit=50
```

Or check the console output where the server is running.

## Troubleshooting

### Port Already in Use
```bash
lsof -i :8000  # Find process
kill -9 <PID>  # Kill it
```

### Import Errors
```bash
pip install fastapi uvicorn pydantic
```

### CORS Issues (Frontend Can't Connect)
Ensure `allow_origins=["*"]` in main.py, or set specific frontend URL.

### No Available Ambulances
- Demo starts with 5 ambulances in AVAILABLE status
- Once assigned, new requests will fail if all ambulances are busy
- Use `POST /admin/releaseAll` to reset all ambulances

## Testing

Quick test script:
```bash
# Health check
curl http://127.0.0.1:8000/

# Emergency request
curl -X POST http://127.0.0.1:8000/emergency/request \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","age":30,"condition":"trauma","latitude":12.3,"longitude":74.5}'

# Map state
curl http://127.0.0.1:8000/map/state
```

## Production Checklist

- [ ] Switch to PostgreSQL/MongoDB
- [ ] Remove `CORS allow_origins=["*"]`
- [ ] Add real JWT with PyJWT
- [ ] Add rate limiting
- [ ] Add request validation
- [ ] Add logging to file
- [ ] Deploy on cloud (AWS/Azure/GCP)
- [ ] Set up CI/CD pipeline
- [ ] Add unit tests
- [ ] Configure environment variables

## Support & Documentation

- **API Reference:** [BACKEND_API.md](../BACKEND_API.md)
- **Architecture:** [docs/architecture.md](../docs/architecture.md)
- **Database Schema:** [docs/database.md](../docs/database.md)

## License

MIT License © 2026 Smart Ambulance System


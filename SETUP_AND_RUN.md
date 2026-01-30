# Smart Ambulance Routing System — Setup & Run Guide

## ✅ Project Status
✨ **FULL-STACK PRODUCTION-READY APPLICATION**

Frontend: ✅ React + Vite + Tailwind CSS (Enhanced UI)
Backend: ✅ FastAPI + SQLAlchemy + PostgreSQL
Real-time: ✅ WebSockets for live ambulance tracking
AI Engine: ✅ Rule-based hospital selection
Maps: ✅ MapLibre GL JS + OpenStreetMap

---

## 🚀 Quick Start (Windows PowerShell)

### Step 1: Backend Setup

```powershell
# Navigate to project root
Set-Location -Path 'e:\CIH3.0\smart-ambulance-routing'

# Create Python virtual environment
python -m venv .venv

# Activate venv
.\.venv\Scripts\Activate

# Install dependencies
python -m pip install -r backend/requirements.txt

# Start FastAPI server (will run on port 8000)
uvicorn backend.main:app --reload --host 0.0.0.0 --port 8000
```

**Expected output:**
```
INFO:     Uvicorn running on http://0.0.0.0:8000
INFO:     Application startup complete
```

### Step 2: Frontend Setup (in NEW PowerShell terminal)

```powershell
# Navigate to frontend
Set-Location -Path 'e:\CIH3.0\smart-ambulance-routing\frontend'

# Install Node dependencies
npm install

# Start Vite dev server (will run on port 5173)
npm run dev
```

**Expected output:**
```
  VITE v5.4.21  ready in 224 ms

  ➜  Local:   http://localhost:5173/
```

### Step 3: Open Application

Visit: **http://localhost:5173/**

---

## 📋 API Endpoints

### Emergency Management
- `POST /emergency` — Create new emergency request
- `GET /emergency/all` — List all emergencies

### Hospital Tracking
- `GET /hospitals` — List all hospitals with capacity

### Ambulance Management
- `GET /ambulances` — List all ambulances and status

### Route Optimization
- `GET /best-route/{emergency_id}` — Get optimal hospital & ETA

### Real-Time Updates
- `WS /ws/ambulances` — WebSocket for live ambulance location updates

---

## 🎨 Frontend Features

### 🆘 Emergency Request Page
- Patient name, age, symptom selection
- GPS location picker with validation
- Real-time hospital assignment
- ETA calculation in minutes
- Hospital capacity display (beds, ICU)
- Loading & error states with animations

### 🗺️ Live Tracking Page
- Interactive map with hospital (🏥) and ambulance (🚑) markers
- Color-coded ambulance status (blue=idle, yellow=enroute, red=busy)
- Click markers for detailed information
- Live WebSocket updates every 5 seconds
- Responsive full-screen map

### 📊 Admin Dashboard
- 4 stat cards: ambulances, hospitals, emergencies, system status
- Emergency table with filters (all/pending/assigned)
- Hospital capacity gauge with progress bars
- Ambulance fleet status list
- Auto-refresh every 5 seconds
- Live status indicators

---

## 🤖 AI Engine

Located in: `backend/ai/priority_engine.py`

### Algorithm
1. **Severity Scoring**: Maps symptoms to urgency (1-10 scale)
2. **Distance Factor**: Calculates travel time via Haversine formula
3. **Capacity Optimization**: Prefers hospitals with available ICU/beds
4. **Critical Case Handling**: Doubles penalty for high-severity cases with no ICU

### Severity Levels
- 10: Cardiac, Unconscious
- 9: Stroke
- 8: Severe bleeding, Breathing difficulty
- 5: Unknown/Other
- 2-3: Minor (fever, fracture)

---

## 🗄️ Database Schema

### patients table
- id, name, age

### ambulances table
- id, identifier, lat, lon, status (idle/enroute/busy)

### hospitals table
- id, name, lat, lon, beds_total, beds_available, icu_beds, icu_available

### emergencies table
- id, patient_name, age, symptoms, lat, lon, created_at, assigned_hospital_id

---

## 🌍 Map Integration

**Technology**: MapLibre GL JS + OpenStreetMap

### Markers
- 🏥 Red markers for hospitals
- 🚑 Blue/Yellow/Red markers for ambulances (status-based)
- Custom popup with hospital beds & ICU info

### Interactions
- Click any marker to see details
- Auto-center on first ambulance/hospital
- Responsive zoom & pan

---

## 🔌 Real-Time Features

**WebSocket Connection**: `ws://localhost:8000/ws/ambulances`

Ambulance location updates flow:
1. Frontend connects to WebSocket
2. Backend broadcasts ambulance position changes
3. Map updates live without page refresh
4. Admin dashboard reflects changes in real-time

---

## 📦 Dependencies

### Frontend
- react@18.2.0
- vite@5.0.0
- maplibre-gl@2.4.0
- tailwindcss@4.0.0

### Backend
- fastapi@0.100.0
- uvicorn@0.22.0
- sqlalchemy@2.0.20
- psycopg2-binary@2.9.6
- requests@2.31.0

---

## 🔧 Environment Variables

### Frontend (`.env`)
```
VITE_API_BASE=http://localhost:8000
VITE_API_WS=ws://localhost:8000
```

### Backend (`.env`)
```
DATABASE_URL=postgresql://user:password@localhost:5432/smart_ambulance
OSRM_URL=http://localhost:5000
```

**Default**: Uses SQLite for quick prototyping

---

## 📱 UI Enhancements

✨ **Modern Design System**
- Gradient backgrounds (blue → indigo)
- Rounded shadows with border accents
- Color-coded status badges
- Smooth animations & transitions
- Responsive grid layout
- Accessible form controls

🎭 **Interactive Elements**
- Animated emergency form cards
- Pulsing map markers for live tracking
- Success/error notification toasts
- Loading states with spinners
- Progress bars for hospital capacity
- Severity color indicators

🎯 **User Experience**
- Tab-based navigation for different views
- Real-time validation & feedback
- Location permission handling
- Countdown timers for alerts
- Sortable/filterable data tables
- Mobile-responsive design

---

## 🧪 Testing the System

### 1. Submit Emergency
1. Go to "Emergency Request" tab
2. Enter patient name: "John Doe"
3. Enter age: 45
4. Select symptom: "Cardiac" (high severity)
5. Click "Use GPS" to set location
6. Click "SUBMIT EMERGENCY"
7. See assigned hospital and ETA

### 2. View Live Map
1. Go to "Live Tracking" tab
2. See hospitals (red) and ambulances (colored by status)
3. Click markers for details
4. Watch real-time updates via WebSocket

### 3. Monitor Admin Dashboard
1. Go to "Admin Dashboard" tab
2. View stat cards with live counts
3. Filter emergencies by status
4. Check hospital capacity gauges
5. Review ambulance fleet status

---

## 🚀 Production Deployment

### Database
```bash
# Use Supabase (PostgreSQL)
# 1. Create Supabase project
# 2. Set DATABASE_URL in .env
# 3. Run migrations
python backend/db/init_db.py
```

### Frontend
```bash
# Build optimized bundle
npm run build

# Output: dist/ folder
# Deploy to Netlify, Vercel, or any static host
```

### Backend
```bash
# Deploy with Gunicorn
gunicorn backend.main:app -w 4 -b 0.0.0.0:8000

# Or use Docker
docker build -t smart-ambulance-backend .
docker run -p 8000:8000 smart-ambulance-backend
```

---

## 📖 API Examples

### Create Emergency
```bash
curl -X POST http://localhost:8000/emergency \
  -H "Content-Type: application/json" \
  -d '{
    "patient_name": "John Doe",
    "age": 45,
    "symptoms": "cardiac",
    "lat": 40.7128,
    "lon": -74.0060
  }'
```

### Get Best Route
```bash
curl http://localhost:8000/best-route/1
```

### List Hospitals
```bash
curl http://localhost:8000/hospitals
```

---

## ⚠️ Troubleshooting

**Frontend won't start**
```bash
cd frontend
rm -r node_modules package-lock.json
npm install
npm run dev
```

**Backend database errors**
```bash
cd backend
python db/init_db.py  # Reinitialize
uvicorn main:app --reload
```

**Map not loading**
- Check internet connection (needs to fetch OpenStreetMap tiles)
- Verify `VITE_API_BASE` and `VITE_API_WS` in frontend/.env

**WebSocket connection fails**
- Ensure backend is running on port 8000
- Check `VITE_API_WS` environment variable

---

## 📞 Support

For issues or questions:
1. Check the troubleshooting section above
2. Verify all services are running (backend on 8000, frontend on 5173)
3. Check browser console for JS errors
4. Check backend logs for API errors

---

**Version**: 1.0  
**Last Updated**: January 30, 2026  
**Status**: ✅ Production Ready  

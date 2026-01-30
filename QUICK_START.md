# Quick Start Guide - Smart Ambulance Routing System

## ✅ System is Fully Running!

### 📍 Access the Application

**Frontend Application (Web UI)**
- **URL**: http://localhost:5174
- **Status**: ✅ Running
- **Open in Browser**: http://localhost:5174

**Backend API Server**
- **URL**: http://127.0.0.1:8002
- **Status**: ✅ Running
- **Swagger Docs**: http://127.0.0.1:8002/docs

---

## 🚀 Testing the System (5-minute test)

### Test 1: Admin Dashboard (2 minutes)
1. Go to http://localhost:5174/admin
2. Login with:
   - Username: `admin`
   - Password: `admin`
3. You should see:
   - ✅ Real ambulance data (10 ambulances)
   - ✅ Patient information (if exists)
   - ✅ Live map with markers
   - ✅ System logs
   - ✅ Action buttons (Dispatch, Release, etc.)

### Test 2: Emergency Request (2 minutes)
1. Go to http://localhost:5174 (Emergency page)
2. Fill in patient details:
   - Full Name: Your name
   - Age: 30
   - Condition: Cardiac
3. Click "Get My Location" (allow browser permission)
4. Click "Request Ambulance" or "SOS"
5. You should see:
   - ✅ Patient location marked on map (red circle)
   - ✅ Ambulance moving toward you (blue circle)
   - ✅ Hospital location (green circle)
   - ✅ Live ETA countdown
   - ✅ Patient status updates

### Test 3: Real-time Updates (1 minute)
1. Stay on either page for 30 seconds
2. Observe:
   - ✅ Map updates every 1-2 seconds
   - ✅ Ambulance position changes smoothly
   - ✅ ETA counts down
   - ✅ Status messages update
   - ✅ System logs record actions

---

## 🛠️ Restart Instructions

### If Frontend Stops
```powershell
cd "c:\CIH\Smart_Ambulance Routing\frontend"
npm run dev
```
Then access: http://localhost:5174

### If Backend Stops
```powershell
cd "c:\CIH\Smart_Ambulance Routing"
& ".venv/Scripts/python.exe" -m uvicorn backend.main:app --host 0.0.0.0 --port 8002
```
Then access: http://127.0.0.1:8002

---

## 📋 Feature Checklist

### ✅ Backend Features
- [x] FastAPI server running on port 8002
- [x] 25+ REST API endpoints
- [x] Admin authentication (Base64 tokens)
- [x] Real-time ambulance dispatch
- [x] Hospital auto-assignment
- [x] ETA calculation using Haversine formula
- [x] Live ambulance movement simulation
- [x] System logging
- [x] CORS enabled for React frontend
- [x] Demo data with 10 ambulances, 5 hospitals

### ✅ Frontend Features
- [x] React app running on port 5174
- [x] Admin login page with authentication
- [x] Emergency request page with GPS location
- [x] Real-time map with Leaflet
- [x] Live ambulance tracking
- [x] Hospital visualization
- [x] ETA display
- [x] System logs viewer
- [x] Admin dashboard
- [x] Action buttons (Dispatch, Release, Mark Reached)
- [x] Real-time data polling (1-2s)
- [x] Error handling with user feedback
- [x] Token-based authentication
- [x] Responsive UI design

### ✅ Integration Features
- [x] Centralized API service layer
- [x] Automatic auth header injection
- [x] Token management in localStorage
- [x] Error handling with status codes
- [x] Real-time updates via polling
- [x] Live map marker updates
- [x] Multi-page routing with React Router
- [x] Component state management
- [x] Async/await API calls

---

## 🔐 Credentials

**Admin Panel**
- Username: `admin`
- Password: `admin`

---

## 📊 Available Data

### Ambulances (10 total)
- IDs: MH-31 A102, MH-31 B221, MH-31 C884, ..., MH-31 K445
- All distributed across Nagpur
- Status: AVAILABLE, DISPATCHED, ASSIGNED, ARRIVED

### Hospitals (5 total)
1. AIIMS Nagpur
2. Disha Hospital
3. Fortis Hospital  
4. Apollo Hospitals
5. Lifeline Hospital

All with bed availability data (General, ICU, Emergency)

---

## 🔗 Important URLs

| URL | Purpose |
|-----|---------|
| http://localhost:5174 | Emergency Request |
| http://localhost:5174/admin | Admin Dashboard |
| http://127.0.0.1:8002 | API Server |
| http://127.0.0.1:8002/docs | Swagger API Docs |
| http://127.0.0.1:8002/health | Server Health Check |

---

## 💡 How It Works

### Emergency Request Flow
```
User fills form → Get Location → Request Ambulance
    ↓
Backend assigns nearest ambulance
    ↓
Frontend polls map state every 1 second
    ↓
Real-time updates on map and ETA
```

### Admin Control Flow
```
Login with admin/admin → View dashboard
    ↓
See ambulances, patients, hospitals
    ↓
Click "Dispatch All" to send ambulances
    ↓
Monitor real-time movement
    ↓
Click "Mark Reached" when done
```

---

## 🐛 Troubleshooting

### "Frontend won't load" 
- Check if npm dev server is running: `npm run dev`
- Try port 5174 instead of 5173

### "Cannot connect to backend"
- Check if backend is running on port 8002
- Open http://127.0.0.1:8002 in browser
- Check for error messages in terminal

### "Login fails" 
- Use exactly: `admin` / `admin`
- Check backend logs for errors
- Ensure backend is serving /admin/login endpoint

### "Map doesn't load"
- Leaflet CSS/JS loads from CDN (internet required)
- Check browser console for errors (F12)
- Ensure browser allows geolocation

### "No ambulance movement"
- Check backend logs for errors
- Ensure getMapState is being called
- Check network tab in DevTools (F12) for API calls

---

## 📁 Project Structure

```
Smart_Ambulance Routing/
├── backend/
│   ├── main.py (459 lines - FastAPI app)
│   ├── models.py (Pydantic models)
│   ├── auth.py (Authentication)
│   ├── services.py (Business logic)
│   └── store.py (Data storage)
├── frontend/
│   ├── src/
│   │   ├── api.js (API service layer)
│   │   ├── App.jsx (Router)
│   │   └── pages/
│   │       ├── emergency/EmergencyPage.jsx
│   │       ├── admin/AdminPage.jsx
│   │       ├── hospital/HospitalPage.jsx
│   │       └── ambulance/AmbulancePage.jsx
│   ├── package.json
│   └── vite.config.js
├── START_BACKEND.ps1
├── START_FRONTEND.ps1
├── INTEGRATION_COMPLETE.md (This summary)
└── README.md (Full documentation)
```

---

## 🎯 Next Steps

1. **Test the system** using the 5-minute test above
2. **Verify real-time updates** - watch ambulance move on map
3. **Check logs** - see system actions recorded
4. **Try multiple requests** - dispatch multiple ambulances
5. **Monitor performance** - check browser DevTools (F12)

---

## 📞 Support

If you encounter issues:
1. Check the error message in the browser console (F12)
2. Check the terminal output where backend/frontend is running
3. Verify both services are running on correct ports
4. Check INTEGRATION_COMPLETE.md for detailed info
5. Review BACKEND_API.md for API documentation

---

**System Status**: ✅ Fully Operational
**Last Check**: All services running
**Ready to Use**: Yes

# Frontend-Backend Integration Guide

This guide shows exactly how to connect your React frontend to the Smart Ambulance backend API.

## Server URL

```javascript
const API_BASE_URL = "http://127.0.0.1:8000";
```

Change `8000` to `8001` if port 8000 is in use.

## Emergency Page Integration

### 1. Request Ambulance

When user clicks "Request Ambulance" after entering details and location:

```javascript
async function requestAmbulance(patientData) {
  const response = await fetch(`${API_BASE_URL}/emergency/request`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      name: patientData.name,
      age: patientData.age || null,
      condition: patientData.condition,
      latitude: patientData.latitude,
      longitude: patientData.longitude
    })
  });

  if (!response.ok) {
    throw new Error("Failed to request ambulance");
  }

  const data = await response.json();
  return {
    patientId: data.patientId,
    ambulanceId: data.assignedAmbulanceId,
    hospitalId: data.hospitalId,
    eta: data.eta,
    message: data.message
  };
}
```

### 2. Live Map Updates

Poll `/map/state` every 1-2 seconds to get live positions:

```javascript
useEffect(() => {
  const pollInterval = setInterval(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/map/state`);
      const mapData = await response.json();

      // Update patient marker
      if (mapData.patient) {
        updatePatientMarker({
          lat: mapData.patient.location.lat,
          lng: mapData.patient.location.lng,
          name: mapData.patient.name,
          condition: mapData.patient.condition,
          status: mapData.patient.status
        });

        // Update ambulance marker
        if (mapData.patient.ambulanceLocation) {
          updateAmbulanceMarker({
            lat: mapData.patient.ambulanceLocation.lat,
            lng: mapData.patient.ambulanceLocation.lng,
            eta: mapData.patient.ambulanceETA
          });
        }

        // Update hospital marker
        if (mapData.patient.hospitalLocation) {
          updateHospitalMarker({
            lat: mapData.patient.hospitalLocation.lat,
            lng: mapData.patient.hospitalLocation.lng,
            name: mapData.patient.hospitalName
          });
        }
      }

      // Update all ambulances
      if (mapData.ambulances) {
        updateAmbulancesOnMap(mapData.ambulances);
      }

      // Update all hospitals
      if (mapData.hospitals) {
        updateHospitalsOnMap(mapData.hospitals);
      }
    } catch (error) {
      console.error("Map update failed:", error);
    }
  }, 1000); // Poll every 1 second

  return () => clearInterval(pollInterval);
}, []);
```

### 3. Get Patient Status

Optionally, get specific patient status:

```javascript
async function getPatientStatus(patientId) {
  const response = await fetch(
    `${API_BASE_URL}/emergency/status/${patientId}`
  );
  const data = await response.json();
  return {
    status: data.status,
    ambulanceETA: data.ambulanceETA,
    hospitalName: data.hospitalName,
    ambulanceLocation: data.ambulanceLocation
  };
}
```

---

## Admin Page Integration

### 1. Admin Login

```javascript
async function adminLogin(username, password) {
  const response = await fetch(`${API_BASE_URL}/admin/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      username: username,
      password: password
    })
  });

  if (!response.ok) {
    throw new Error("Login failed");
  }

  const data = await response.json();
  
  // Save token to localStorage
  localStorage.setItem("adminToken", data.access_token);
  
  return {
    token: data.access_token,
    message: data.message
  };
}
```

### 2. Get Admin Dashboard

```javascript
async function getAdminDashboard() {
  const token = localStorage.getItem("adminToken");
  
  const response = await fetch(`${API_BASE_URL}/admin/dashboard`, {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${token}`
    }
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error("Session expired");
    }
    throw new Error("Failed to get dashboard");
  }

  const data = await response.json();
  return {
    patient: data.patient,
    ambulances: data.ambulances,
    hospitals: data.hospitals,
    logs: data.logs
  };
}
```

### 3. Dispatch/Release Ambulances

```javascript
async function releaseAllAmbulances() {
  const token = localStorage.getItem("adminToken");
  
  const response = await fetch(`${API_BASE_URL}/admin/releaseAll`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`
    }
  });

  if (!response.ok) {
    throw new Error("Failed to release ambulances");
  }

  return response.json();
}

async function dispatchAllAmbulances() {
  const token = localStorage.getItem("adminToken");
  
  const response = await fetch(`${API_BASE_URL}/admin/dispatchAll`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`
    }
  });

  if (!response.ok) {
    throw new Error("Failed to dispatch ambulances");
  }

  return response.json();
}
```

### 4. Mark Patient Reached

```javascript
async function markPatientReached(patientId) {
  const token = localStorage.getItem("adminToken");
  
  const response = await fetch(
    `${API_BASE_URL}/admin/markReached?patient_id=${patientId}`,
    {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`
      }
    }
  );

  if (!response.ok) {
    throw new Error("Failed to mark patient");
  }

  return response.json();
}
```

### 5. Admin Dashboard Polling

```javascript
useEffect(() => {
  const token = localStorage.getItem("adminToken");
  if (!token) return;

  const pollInterval = setInterval(async () => {
    try {
      const dashboard = await getAdminDashboard();
      
      // Update patient info
      if (dashboard.patient) {
        setPatientInfo(dashboard.patient);
      }

      // Update ambulance list
      setAmbulances(dashboard.ambulances);

      // Update hospital list
      setHospitals(dashboard.hospitals);

      // Update logs
      setLogs(dashboard.logs);
    } catch (error) {
      console.error("Dashboard update failed:", error);
    }
  }, 1000); // Poll every 1 second

  return () => clearInterval(pollInterval);
}, []);
```

---

## Hospital Page Integration

### Get All Hospitals

```javascript
async function getHospitalList() {
  const response = await fetch(`${API_BASE_URL}/hospitals/list`);
  const data = await response.json();
  
  return data.hospitals.map(h => ({
    id: h.hospitalId,
    name: h.name,
    location: h.location,
    icuBeds: h.icuBeds,
    generalBeds: h.generalBeds,
    occupiedBeds: h.occupiedBeds,
    availableBeds: h.generalBeds - h.occupiedBeds
  }));
}
```

### Get Specific Hospital

```javascript
async function getHospitalDetails(hospitalId) {
  const response = await fetch(
    `${API_BASE_URL}/hospital/${hospitalId}`
  );
  return response.json();
}
```

---

## Ambulance Page Integration

### Get All Ambulances

```javascript
async function getAmbulanceList() {
  const response = await fetch(`${API_BASE_URL}/ambulances/list`);
  const data = await response.json();
  
  return data.ambulances.map(a => ({
    id: a.ambulanceId,
    driver: a.driverName,
    driverId: a.driverId,
    status: a.status,
    location: a.location,
    patientId: a.currentPatientId
  }));
}
```

### Get Specific Ambulance

```javascript
async function getAmbulanceDetails(ambulanceId) {
  const response = await fetch(
    `${API_BASE_URL}/ambulance/${ambulanceId}`
  );
  return response.json();
}
```

---

## System Logs

### Get Recent Logs

```javascript
async function getSystemLogs(limit = 50) {
  const response = await fetch(
    `${API_BASE_URL}/logs?limit=${limit}`
  );
  const data = await response.json();
  
  return data.logs.map(log => ({
    timestamp: new Date(log.timestamp),
    message: log.message,
    level: log.level
  }));
}
```

---

## Error Handling

All endpoints can return errors. Handle them properly:

```javascript
async function apiCall(url, options = {}) {
  try {
    const response = await fetch(url, options);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || `HTTP ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("API Error:", error);
    throw error;
  }
}
```

Common error codes:
- `200` - Success
- `400` - Bad request (invalid input)
- `401` - Unauthorized (invalid token)
- `403` - Forbidden (not authorized)
- `404` - Not found
- `503` - Service unavailable (no ambulances)

---

## Leaflet Map Example

```javascript
import L from "leaflet";

// Initialize map
const map = L.map("map").setView([12.3456, 74.5678], 13);
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(map);

// Patient marker (red)
let patientMarker;
function updatePatientMarker(patient) {
  if (patientMarker) patientMarker.remove();
  patientMarker = L.circleMarker(
    [patient.lat, patient.lng],
    { color: "red", radius: 10 }
  )
    .bindPopup(`<b>${patient.name}</b><br>${patient.condition}`)
    .addTo(map);
}

// Ambulance marker (blue)
let ambulanceMarker;
function updateAmbulanceMarker(ambulance) {
  if (ambulanceMarker) ambulanceMarker.remove();
  ambulanceMarker = L.circleMarker(
    [ambulance.lat, ambulance.lng],
    { color: "blue", radius: 8 }
  )
    .bindPopup(`<b>Ambulance</b><br>ETA: ${ambulance.eta}s`)
    .addTo(map);
}

// Hospital marker (green)
let hospitalMarker;
function updateHospitalMarker(hospital) {
  if (hospitalMarker) hospitalMarker.remove();
  hospitalMarker = L.circleMarker(
    [hospital.lat, hospital.lng],
    { color: "green", radius: 10 }
  )
    .bindPopup(`<b>${hospital.name}</b>`)
    .addTo(map);
}

// Draw route
let route;
function drawRoute(patientLoc, hospitalLoc) {
  if (route) route.remove();
  route = L.polyline(
    [
      [patientLoc.lat, patientLoc.lng],
      [hospitalLoc.lat, hospitalLoc.lng]
    ],
    { color: "blue", weight: 2, dashArray: "5, 5" }
  ).addTo(map);
}
```

---

## React Hooks Pattern

```javascript
// Custom hook for emergency polling
function useEmergencyPolling(patientId) {
  const [status, setStatus] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!patientId) return;

    const interval = setInterval(async () => {
      try {
        const response = await fetch(
          `${API_BASE_URL}/emergency/status/${patientId}`
        );
        const data = await response.json();
        setStatus(data);
      } catch (err) {
        setError(err.message);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [patientId]);

  return { status, error };
}

// Usage in component
function EmergencyPage() {
  const [patientId, setPatientId] = useState(null);
  const { status, error } = useEmergencyPolling(patientId);

  return (
    <div>
      {status && <p>Status: {status.status}</p>}
      {error && <p>Error: {error}</p>}
    </div>
  );
}
```

---

## Testing

Quick curl commands to test endpoints:

```bash
# Health check
curl http://127.0.0.1:8000/

# Login
curl -X POST http://127.0.0.1:8000/admin/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin"}'

# Request emergency
curl -X POST http://127.0.0.1:8000/emergency/request \
  -H "Content-Type: application/json" \
  -d '{
    "name":"Test",
    "age":30,
    "condition":"trauma",
    "latitude":12.3456,
    "longitude":74.5678
  }'

# Get map state
curl http://127.0.0.1:8000/map/state

# Get ambulances
curl http://127.0.0.1:8000/ambulances/list

# Get hospitals
curl http://127.0.0.1:8000/hospitals/list
```

---

## Deployment URLs

When deploying, update `API_BASE_URL`:

**Development:**
```javascript
const API_BASE_URL = "http://127.0.0.1:8000";
```

**Production (AWS):**
```javascript
const API_BASE_URL = "https://api.smartambulance.com";
```

**Environment Variable (Recommended):**
```javascript
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";
```

Create `.env` file:
```
VITE_API_URL=http://127.0.0.1:8000
```

---

## Support & Debugging

- **Network Tab:** Check browser DevTools → Network for all API requests
- **Console Errors:** Check browser console for fetch errors
- **Backend Logs:** Check server terminal for detailed logs
- **CORS Issues:** If frontend can't connect, check backend CORS settings

For issues, see [BACKEND_API.md](./BACKEND_API.md) and [backend/README_backend.md](./backend/README_backend.md).

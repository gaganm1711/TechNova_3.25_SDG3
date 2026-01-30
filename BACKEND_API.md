# Smart Ambulance Backend API Documentation

## Overview

The Smart Ambulance Backend is a FastAPI-based real-time emergency response system. It manages:
- Patient emergencies and dispatching
- Ambulance fleet management and real-time positioning
- Hospital bed availability and patient routing
- Admin control center and system logs
- Live map updates for frontend visualization

**Server URL:** `http://127.0.0.1:8000` (default) or `http://127.0.0.1:8001`

---

## Table of Contents

1. [Authentication](#authentication)
2. [Emergency Endpoints](#emergency-endpoints)
3. [Map & Tracking](#map--tracking)
4. [Admin Control](#admin-control)
5. [Ambulance Fleet](#ambulance-fleet)
6. [Hospital Management](#hospital-management)
7. [System Logs](#system-logs)
8. [Data Models](#data-models)

---

## Authentication

### POST /admin/login

Authenticate admin user and receive a bearer token.

**Request:**
```json
{
  "username": "admin",
  "password": "admin"
}
```

**Response (200 OK):**
```json
{
  "access_token": "YWRtaW46...",
  "token_type": "bearer",
  "message": "Login successful"
}
```

**Usage in Subsequent Requests:**
```
Authorization: Bearer <access_token>
```

---

## Emergency Endpoints

### POST /emergency/request

Request an ambulance for a medical emergency.

**Request:**
```json
{
  "name": "John Doe",
  "age": 45,
  "condition": "cardiac",
  "latitude": 12.3456,
  "longitude": 74.5678
}
```

**Response (200 OK):**
```json
{
  "patientId": "PAT-DB97579A",
  "assignedAmbulanceId": "AMB-001",
  "hospitalId": "HOSP-001",
  "eta": 120,
  "message": "Ambulance dispatched"
}
```

**Description:**
- Automatically finds the nearest available ambulance
- Assigns the nearest hospital with available beds
- Ambulance begins moving toward patient immediately
- ETA is in seconds

---

### GET /emergency/status/{patient_id}

Get real-time status of a patient's emergency request.

**Response (200 OK):**
```json
{
  "patientId": "PAT-DB97579A",
  "name": "John Doe",
  "age": 45,
  "condition": "cardiac",
  "status": "PICKUP",
  "location": {
    "lat": 12.3456,
    "lng": 74.5678
  },
  "ambulanceLocation": {
    "lat": 12.3456,
    "lng": 74.5678
  },
  "ambulanceETA": 45,
  "hospitalLocation": {
    "lat": 12.35,
    "lng": 74.59
  },
  "hospitalName": "City General Hospital"
}
```

**Patient Status Values:**
- `WAITING` - Emergency request received, waiting for ambulance
- `PICKUP` - Ambulance is on the way to patient
- `TO_HOSPITAL` - Ambulance has picked up patient, heading to hospital
- `ARRIVED` - Patient has arrived at hospital
- `COMPLETED` - Case closed

---

## Map & Tracking

### GET /map/state

Poll this endpoint every 1-2 seconds to get live map data for frontend visualization.

**Response (200 OK):**
```json
{
  "patient": {
    "patientId": "PAT-DB97579A",
    "name": "John Doe",
    "age": 45,
    "condition": "cardiac",
    "status": "PICKUP",
    "location": {
      "lat": 12.3456,
      "lng": 74.5678
    },
    "ambulanceLocation": {
      "lat": 12.3456,
      "lng": 74.5678
    },
    "ambulanceETA": 45,
    "hospitalLocation": {
      "lat": 12.35,
      "lng": 74.59
    },
    "hospitalName": "City General Hospital"
  },
  "ambulances": [
    {
      "ambulanceId": "AMB-001",
      "driverId": "DRV-001",
      "driverName": "John Smith",
      "status": "ASSIGNED",
      "location": {
        "lat": 12.3456,
        "lng": 74.5678
      },
      "currentPatientId": "PAT-DB97579A",
      "targetLocation": {
        "lat": 12.3456,
        "lng": 74.5678
      }
    }
  ],
  "hospitals": [
    {
      "hospitalId": "HOSP-001",
      "name": "City General Hospital",
      "location": {
        "lat": 12.35,
        "lng": 74.59
      },
      "icuBeds": 20,
      "generalBeds": 100,
      "occupiedBeds": 0
    }
  ]
}
```

**Description:**
- Returns the current active patient (if any)
- All ambulances with their current positions and status
- All hospitals with bed availability
- Frontend uses this to update the Leaflet map every 1-2 seconds

---

## Admin Control

All admin endpoints require `Authorization: Bearer <token>` header.

### POST /admin/dispatchAll

Dispatch all ambulances (confirms the dispatch).

**Response (200 OK):**
```json
{
  "message": "All ambulances dispatched",
  "status": "ok"
}
```

---

### POST /admin/releaseAll

Release all ambulances back to AVAILABLE status.

**Response (200 OK):**
```json
{
  "message": "All ambulances released",
  "status": "ok"
}
```

---

### POST /admin/markReached

Mark a patient as having reached the hospital.

**Query Parameters:**
- `patient_id` (required): The patient ID to mark as completed

**Example:**
```
POST /admin/markReached?patient_id=PAT-DB97579A
```

**Response (200 OK):**
```json
{
  "message": "Patient marked as reached",
  "status": "ok"
}
```

---

### GET /admin/dashboard

Get complete admin dashboard with all system state.

**Response (200 OK):**
```json
{
  "patient": { /* Patient data */ },
  "ambulances": [ /* Array of all ambulances */ ],
  "hospitals": [ /* Array of all hospitals */ ],
  "logs": [ /* Last 50 system logs */ ]
}
```

**Description:**
- Returns the complete state for the admin control center
- Includes the active patient, all ambulances, all hospitals, and recent logs
- Use this for the admin dashboard view

---

## Ambulance Fleet

### GET /ambulances/list

Get all ambulances with current status and position.

**Response (200 OK):**
```json
{
  "ambulances": [
    {
      "ambulanceId": "AMB-001",
      "driverId": "DRV-001",
      "driverName": "John Smith",
      "status": "AVAILABLE",
      "location": {
        "lat": 12.3456,
        "lng": 74.5678
      },
      "currentPatientId": null,
      "targetLocation": null
    }
  ],
  "count": 5
}
```

---

### GET /ambulance/{ambulance_id}

Get details of a specific ambulance.

**Response (200 OK):**
```json
{
  "ambulanceId": "AMB-001",
  "driverId": "DRV-001",
  "driverName": "John Smith",
  "status": "AVAILABLE",
  "location": {
    "lat": 12.3456,
    "lng": 74.5678
  },
  "currentPatientId": null,
  "targetLocation": null
}
```

**Ambulance Status Values:**
- `AVAILABLE` - Idle, ready to be assigned
- `ASSIGNED` - Has been assigned to a patient
- `PICKING_UP` - On the way to patient location
- `TO_HOSPITAL` - Has picked up patient, heading to hospital
- `COMPLETED` - Delivery complete, back to available

---

## Hospital Management

### GET /hospitals/list

Get all hospitals with bed availability.

**Response (200 OK):**
```json
{
  "hospitals": [
    {
      "hospitalId": "HOSP-001",
      "name": "City General Hospital",
      "location": {
        "lat": 12.35,
        "lng": 74.59
      },
      "icuBeds": 20,
      "generalBeds": 100,
      "occupiedBeds": 0
    }
  ],
  "count": 3
}
```

---

### GET /hospital/{hospital_id}

Get details of a specific hospital.

**Response (200 OK):**
```json
{
  "hospitalId": "HOSP-001",
  "name": "City General Hospital",
  "location": {
    "lat": 12.35,
    "lng": 74.59
  },
  "icuBeds": 20,
  "generalBeds": 100,
  "occupiedBeds": 0
}
```

---

## System Logs

### GET /logs

Get system logs for debugging and monitoring.

**Query Parameters:**
- `limit` (optional, default=100): Number of logs to return

**Response (200 OK):**
```json
{
  "logs": [
    {
      "timestamp": "2026-01-30T12:34:56.123456",
      "message": "System initialized with demo data",
      "level": "INFO"
    },
    {
      "timestamp": "2026-01-30T12:35:00.123456",
      "message": "New emergency request: John Doe, condition: cardiac",
      "level": "INFO"
    },
    {
      "timestamp": "2026-01-30T12:35:01.123456",
      "message": "Ambulance AMB-001 dispatched to patient PAT-DB97579A",
      "level": "INFO"
    }
  ],
  "total": 3
}
```

---

## Data Models

### Location
```json
{
  "lat": 12.3456,
  "lng": 74.5678
}
```

### Patient
```json
{
  "patientId": "PAT-DB97579A",
  "name": "John Doe",
  "age": 45,
  "condition": "cardiac",
  "status": "PICKUP",
  "location": { "lat": 12.3456, "lng": 74.5678 },
  "createdAt": "2026-01-30T12:34:56.123456",
  "ambulanceId": "AMB-001",
  "hospitalId": "HOSP-001",
  "eta": 120
}
```

### Ambulance
```json
{
  "ambulanceId": "AMB-001",
  "driverId": "DRV-001",
  "driverName": "John Smith",
  "status": "ASSIGNED",
  "location": { "lat": 12.3456, "lng": 74.5678 },
  "currentPatientId": "PAT-DB97579A",
  "targetLocation": { "lat": 12.3456, "lng": 74.5678 }
}
```

### Hospital
```json
{
  "hospitalId": "HOSP-001",
  "name": "City General Hospital",
  "location": { "lat": 12.35, "lng": 74.59 },
  "icuBeds": 20,
  "generalBeds": 100,
  "occupiedBeds": 0
}
```

---

## Frontend Integration Examples

### React: Emergency Request
```javascript
const requestAmbulance = async (patientData) => {
  const response = await fetch("http://127.0.0.1:8000/emergency/request", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: patientData.name,
      age: patientData.age,
      condition: patientData.condition,
      latitude: patientData.lat,
      longitude: patientData.lng
    })
  });
  return response.json();
};
```

### React: Poll Map State
```javascript
useEffect(() => {
  const interval = setInterval(async () => {
    const response = await fetch("http://127.0.0.1:8000/map/state");
    const data = await response.json();
    setMapState(data);
  }, 1000); // Poll every 1 second
  return () => clearInterval(interval);
}, []);
```

### React: Admin Login
```javascript
const adminLogin = async (username, password) => {
  const response = await fetch("http://127.0.0.1:8000/admin/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password })
  });
  const data = await response.json();
  localStorage.setItem("adminToken", data.access_token);
  return data;
};
```

### React: Protected Admin Request
```javascript
const releaseAmbulances = async (token) => {
  const response = await fetch("http://127.0.0.1:8000/admin/releaseAll", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`
    }
  });
  return response.json();
};
```

---

## Real-Time Updates

The backend automatically simulates ambulance movement every second. When an ambulance is assigned to a patient:

1. The ambulance status changes to `ASSIGNED`
2. Every second, the ambulance's position is updated toward the patient
3. When it reaches the patient (distance < 0.0001 degrees), status changes to `TO_HOSPITAL`
4. The ambulance then moves toward the hospital
5. When it reaches the hospital, status changes to `COMPLETED`

The frontend should poll `/map/state` every 1-2 seconds to get updated positions and animate the ambulance movement on the Leaflet map.

---

## Error Handling

All endpoints return standard HTTP status codes:

- `200 OK` - Success
- `400 Bad Request` - Invalid input
- `401 Unauthorized` - Missing or invalid token
- `403 Forbidden` - Not authorized
- `404 Not Found` - Resource not found
- `503 Service Unavailable` - No available ambulances or hospitals

Error responses include a `detail` field:
```json
{
  "detail": "No available ambulances or hospitals"
}
```

---

## Demo Credentials

**Admin Login:**
- Username: `admin`
- Password: `admin`

**Demo Data (Pre-loaded):**
- 5 Ambulances (AMB-001 to AMB-005)
- 3 Hospitals (HOSP-001 to HOSP-003)
- Demo locations in Bangalore, India area

---

## Running the Backend

```bash
cd backend
python -m uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

Or use the PowerShell script:
```powershell
.\RUN_BACKEND.ps1
```

---

## Architecture

```
FastAPI Server
├── /admin/* - Authentication & admin control
├── /emergency/* - Patient emergency handling
├── /map/* - Live map data
├── /ambulances/* - Ambulance fleet management
├── /hospitals/* - Hospital management
└── /logs/* - System logs

Background Tasks:
└── update_ambulance_positions() - Runs every second
    ├── Move ambulances toward patients
    ├── Move ambulances toward hospitals
    └── Update patient status
```

---

## Notes

- **In-Memory Storage:** All data is stored in memory. Data will be lost when the server restarts.
- **No Database:** For production, replace `store.py` with MongoDB or PostgreSQL integration.
- **CORS Enabled:** All origins are allowed (change `allow_origins=["*"]` in production).
- **Async Movement:** Ambulance positions update automatically every second via background task.
- **Real-Time:** Frontend must poll `/map/state` to get live updates.

"""
Smart Ambulance Routing System - FastAPI Backend
Real-time emergency response and ambulance dispatch
"""
from fastapi import FastAPI, Depends, HTTPException, status, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import asyncio
import uuid
from datetime import datetime, timedelta

from .models import (
    LoginRequest, LoginResponse, EmergencyRequest, EmergencyResponse,
    PatientStatusResponse, MapStateResponse, Patient, Ambulance, Hospital,
    Location, PatientStatus, AmbulanceStatus, AdminDashboardResponse,
    SystemLogEntry
)
from .auth import create_access_token, get_current_admin, ADMIN_USERNAME, ADMIN_PASSWORD
from .services import (
    dispatch_ambulance, update_ambulance_positions, create_demo_ambulances,
    create_demo_hospitals, release_all_ambulances, calculate_eta
)
from .store import (
    get_patient, get_ambulance, save_patient, save_ambulance,
    get_hospital, get_all_ambulances, get_all_hospitals, get_all_patients,
    add_log, system_logs
)


# ===== STARTUP & BACKGROUND TASKS =====

async def startup_event():
    """Initialize demo data on startup"""
    from .store import ambulances, hospitals
    
    # Load demo ambulances
    demo_ambs = create_demo_ambulances()
    for amb_id, amb in demo_ambs.items():
        ambulances[amb_id] = amb
    
    # Load demo hospitals
    demo_hosps = create_demo_hospitals()
    for hosp_id, hosp in demo_hosps.items():
        hospitals[hosp_id] = hosp
    
    add_log("System initialized with demo data")


async def lifespan(app: FastAPI):
    """Handle startup and shutdown"""
    await startup_event()
    
    # Start background ambulance movement task
    task = asyncio.create_task(update_ambulance_positions())
    
    yield
    
    # Cleanup
    task.cancel()


# ===== FASTAPI APP =====

app = FastAPI(
    title="Smart Ambulance Routing System",
    description="Real-time emergency response and ambulance dispatch",
    version="1.0.0",
    lifespan=lifespan
)

# CORS configuration for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins (change in production)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ===== HEALTH CHECK =====

@app.get("/")
def root():
    """Health check endpoint"""
    return {
        "status": "Smart Ambulance Backend Running",
        "version": "1.0.0",
        "timestamp": datetime.now()
    }


# ===== AUTHENTICATION ENDPOINTS =====

@app.post("/admin/login", response_model=LoginResponse)
def admin_login(request: LoginRequest):
    """
    Admin login endpoint.
    Username: admin
    Password: admin
    """
    if request.username != ADMIN_USERNAME or request.password != ADMIN_PASSWORD:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials"
        )
    
    token = create_access_token(request.username)
    add_log(f"Admin login successful")
    
    return LoginResponse(
        access_token=token,
        token_type="bearer",
        message="Login successful"
    )


# ===== EMERGENCY ENDPOINTS =====

@app.post("/emergency/request", response_model=EmergencyResponse)
def request_ambulance(request: EmergencyRequest):
    """
    Request an ambulance for an emergency.
    
    Input:
    - name: Patient name
    - age: Patient age (optional)
    - condition: Medical condition (e.g., 'cardiac', 'trauma', 'asthma')
    - latitude: Patient location latitude
    - longitude: Patient location longitude
    
    Output:
    - patientId: Unique patient ID
    - assignedAmbulanceId: ID of assigned ambulance
    - hospitalId: ID of destination hospital
    - eta: Estimated time to arrival in seconds
    """
    # Create patient
    patient_id = f"PAT-{str(uuid.uuid4())[:8].upper()}"
    patient = Patient(
        patientId=patient_id,
        name=request.name,
        age=request.age,
        condition=request.condition,
        status=PatientStatus.WAITING,
        location=Location(lat=request.latitude, lng=request.longitude),
        createdAt=datetime.now(),
    )
    
    save_patient(patient)
    add_log(f"New emergency request: {request.name}, condition: {request.condition}")
    
    # Dispatch ambulance
    ambulance_id, hospital_id = dispatch_ambulance(patient)
    
    if not ambulance_id or not hospital_id:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="No available ambulances or hospitals"
        )
    
    # Get ETA
    patient = get_patient(patient_id)
    eta = patient.eta or 0
    
    return EmergencyResponse(
        patientId=patient_id,
        assignedAmbulanceId=ambulance_id,
        hospitalId=hospital_id,
        eta=eta,
        message="Ambulance dispatched"
    )


@app.get("/emergency/status/{patient_id}", response_model=PatientStatusResponse)
def get_emergency_status(patient_id: str):
    """
    Get the status of an emergency/patient.
    
    Returns:
    - Patient details (name, age, condition, status)
    - Current ambulance location and ETA
    - Hospital destination details
    """
    patient = get_patient(patient_id)
    if not patient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Patient not found"
        )
    
    ambulance_location = None
    ambulance_eta = None
    if patient.ambulanceId:
        ambulance = get_ambulance(patient.ambulanceId)
        if ambulance:
            ambulance_location = ambulance.location
            ambulance_eta = calculate_eta(ambulance.location, 
                                         patient.location if patient.status == PatientStatus.PICKUP 
                                         else get_hospital(patient.hospitalId).location)
    
    hospital_location = None
    hospital_name = None
    if patient.hospitalId:
        hospital = get_hospital(patient.hospitalId)
        if hospital:
            hospital_location = hospital.location
            hospital_name = hospital.name
    
    return PatientStatusResponse(
        patientId=patient.patientId,
        name=patient.name,
        age=patient.age,
        condition=patient.condition,
        status=patient.status,
        location=patient.location,
        ambulanceLocation=ambulance_location,
        ambulanceETA=ambulance_eta,
        hospitalLocation=hospital_location,
        hospitalName=hospital_name
    )


# ===== MAP DATA ENDPOINT =====

@app.get("/map/state", response_model=MapStateResponse)
def get_map_state():
    """
    Get current map state: patient, all ambulances, all hospitals.
    
    Frontend polls this every 1-2 seconds to update the live map.
    
    Returns:
    - patient: Current active patient (if any)
    - ambulances: List of all ambulances with current positions
    - hospitals: List of all hospitals
    """
    # Get active patient (first waiting or in progress)
    active_patient = None
    for patient in get_all_patients():
        if patient.status != PatientStatus.COMPLETED:
            active_patient = patient
            break
    
    # Convert to response
    patient_response = None
    if active_patient:
        ambulance_location = None
        ambulance_eta = None
        if active_patient.ambulanceId:
            ambulance = get_ambulance(active_patient.ambulanceId)
            if ambulance:
                ambulance_location = ambulance.location
                ambulance_eta = calculate_eta(
                    ambulance.location,
                    active_patient.location if active_patient.status == PatientStatus.PICKUP
                    else get_hospital(active_patient.hospitalId).location
                )
        
        hospital_location = None
        hospital_name = None
        if active_patient.hospitalId:
            hospital = get_hospital(active_patient.hospitalId)
            if hospital:
                hospital_location = hospital.location
                hospital_name = hospital.name
        
        patient_response = PatientStatusResponse(
            patientId=active_patient.patientId,
            name=active_patient.name,
            age=active_patient.age,
            condition=active_patient.condition,
            status=active_patient.status,
            location=active_patient.location,
            ambulanceLocation=ambulance_location,
            ambulanceETA=ambulance_eta,
            hospitalLocation=hospital_location,
            hospitalName=hospital_name
        )
    
    return MapStateResponse(
        patient=patient_response,
        ambulances=get_all_ambulances(),
        hospitals=get_all_hospitals()
    )


# ===== ADMIN ENDPOINTS =====

@app.post("/admin/dispatchAll")
def admin_dispatch_all(current_admin: str = Depends(get_current_admin)):
    """
    Admin command to dispatch all ambulances to current patient.
    (Backend already does this automatically, but this confirms it.)
    """
    add_log("Admin dispatched all ambulances", level="INFO")
    return {"message": "All ambulances dispatched", "status": "ok"}


@app.post("/admin/releaseAll")
def admin_release_all(current_admin: str = Depends(get_current_admin)):
    """
    Admin command to release all ambulances back to AVAILABLE status.
    """
    release_all_ambulances()
    add_log("Admin released all ambulances", level="INFO")
    return {"message": "All ambulances released", "status": "ok"}


@app.post("/admin/markReached")
def admin_mark_reached(patient_id: str, current_admin: str = Depends(get_current_admin)):
    """
    Admin command to mark a patient as reached hospital.
    """
    patient = get_patient(patient_id)
    if not patient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Patient not found"
        )
    
    patient.status = PatientStatus.COMPLETED
    save_patient(patient)
    
    # Release ambulance
    if patient.ambulanceId:
        ambulance = get_ambulance(patient.ambulanceId)
        if ambulance:
            ambulance.status = AmbulanceStatus.AVAILABLE
            ambulance.currentPatientId = None
            ambulance.targetLocation = None
            save_ambulance(ambulance)
    
    add_log(f"Admin marked patient {patient_id} as reached hospital", level="INFO")
    return {"message": "Patient marked as reached", "status": "ok"}


@app.get("/admin/dashboard", response_model=AdminDashboardResponse)
def admin_dashboard(current_admin: str = Depends(get_current_admin)):
    """
    Admin dashboard: complete system state.
    
    Returns:
    - Active patient
    - All ambulances with current status
    - All hospitals
    - Recent system logs
    """
    # Get active patient
    active_patient = None
    for patient in get_all_patients():
        if patient.status != PatientStatus.COMPLETED:
            active_patient = patient
            break
    
    patient_response = None
    if active_patient:
        ambulance_location = None
        ambulance_eta = None
        if active_patient.ambulanceId:
            ambulance = get_ambulance(active_patient.ambulanceId)
            if ambulance:
                ambulance_location = ambulance.location
                ambulance_eta = calculate_eta(
                    ambulance.location,
                    active_patient.location if active_patient.status == PatientStatus.PICKUP
                    else get_hospital(active_patient.hospitalId).location
                )
        
        hospital_location = None
        hospital_name = None
        if active_patient.hospitalId:
            hospital = get_hospital(active_patient.hospitalId)
            if hospital:
                hospital_location = hospital.location
                hospital_name = hospital.name
        
        patient_response = PatientStatusResponse(
            patientId=active_patient.patientId,
            name=active_patient.name,
            age=active_patient.age,
            condition=active_patient.condition,
            status=active_patient.status,
            location=active_patient.location,
            ambulanceLocation=ambulance_location,
            ambulanceETA=ambulance_eta,
            hospitalLocation=hospital_location,
            hospitalName=hospital_name
        )
    
    return AdminDashboardResponse(
        patient=patient_response,
        ambulances=get_all_ambulances(),
        hospitals=get_all_hospitals(),
        logs=system_logs[-50:]  # Last 50 logs
    )


# ===== AMBULANCE FLEET ENDPOINTS =====

@app.get("/ambulances/list")
def get_ambulances_list():
    """Get list of all ambulances with current status and position"""
    return {
        "ambulances": get_all_ambulances(),
        "count": len(get_all_ambulances())
    }


@app.get("/ambulance/{ambulance_id}")
def get_ambulance_details(ambulance_id: str):
    """Get details of a specific ambulance"""
    ambulance = get_ambulance(ambulance_id)
    if not ambulance:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Ambulance not found"
        )
    return ambulance


# ===== HOSPITAL ENDPOINTS =====

@app.get("/hospitals/list")
def get_hospitals_list():
    """Get list of all hospitals with bed availability"""
    return {
        "hospitals": get_all_hospitals(),
        "count": len(get_all_hospitals())
    }


@app.get("/hospital/{hospital_id}")
def get_hospital_details(hospital_id: str):
    """Get details of a specific hospital"""
    hospital = get_hospital(hospital_id)
    if not hospital:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Hospital not found"
        )
    return hospital


# ===== SYSTEM LOGS =====

@app.get("/logs")
def get_system_logs(limit: int = 100):
    """Get recent system logs"""
    return {
        "logs": system_logs[-limit:],
        "total": len(system_logs)
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

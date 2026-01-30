"""
Services for ambulance movement, patient handling, and emergency dispatch
"""
import asyncio
import math
import uuid
from datetime import datetime
from typing import Optional, Dict
from .models import (
    Patient, Ambulance, Hospital, Location, PatientStatus, AmbulanceStatus
)
from .store import (
    get_patient, get_ambulance, save_patient, save_ambulance,
    get_available_ambulance, get_nearest_hospital, get_all_ambulances,
    get_all_hospitals, add_log
)


# Speed constants
AMBULANCE_SPEED = 0.0005  # degrees per second (~50 km/h)
MOVEMENT_INTERVAL = 1.0  # seconds


def haversine_distance(lat1: float, lng1: float, lat2: float, lng2: float) -> float:
    """Calculate distance between two coordinates in km"""
    R = 6371  # Earth radius in km
    
    lat1_rad = math.radians(lat1)
    lat2_rad = math.radians(lat2)
    delta_lat = math.radians(lat2 - lat1)
    delta_lng = math.radians(lng2 - lng1)
    
    a = math.sin(delta_lat / 2) ** 2 + math.cos(lat1_rad) * math.cos(lat2_rad) * math.sin(delta_lng / 2) ** 2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    
    return R * c


def move_toward(current: Location, target: Location, speed: float) -> Location:
    """Move a location toward a target by a given speed"""
    distance = haversine_distance(
        current.lat, current.lng, target.lat, target.lng
    )
    
    if distance < 0.0001:  # Reached target
        return target
    
    # Calculate direction
    lat_diff = target.lat - current.lat
    lng_diff = target.lng - current.lng
    
    # Normalize and apply speed
    total = math.sqrt(lat_diff ** 2 + lng_diff ** 2)
    new_lat = current.lat + (lat_diff / total) * speed
    new_lng = current.lng + (lng_diff / total) * speed
    
    return Location(lat=new_lat, lng=new_lng)


def calculate_eta(current: Location, target: Location, speed_kmh: float = 50) -> int:
    """Calculate ETA in seconds"""
    distance_km = haversine_distance(
        current.lat, current.lng, target.lat, target.lng
    )
    if distance_km == 0:
        return 0
    
    hours = distance_km / speed_kmh
    seconds = int(hours * 3600)
    return max(seconds, 1)


def dispatch_ambulance(patient: Patient) -> tuple[Optional[str], Optional[str]]:
    """
    Dispatch an available ambulance and assign a hospital.
    Returns (ambulanceId, hospitalId)
    """
    # Find available ambulance
    ambulance = get_available_ambulance()
    if not ambulance:
        add_log(f"No available ambulances for patient {patient.patientId}", "WARNING")
        return None, None
    
    # Find nearest hospital
    hospital = get_nearest_hospital(patient.location.lat, patient.location.lng)
    if not hospital:
        add_log(f"No available hospitals for patient {patient.patientId}", "WARNING")
        return None, None
    
    # Assign ambulance
    ambulance.status = AmbulanceStatus.ASSIGNED
    ambulance.currentPatientId = patient.patientId
    ambulance.targetLocation = patient.location
    save_ambulance(ambulance)
    
    # Update patient
    patient.status = PatientStatus.PICKUP
    patient.ambulanceId = ambulance.ambulanceId
    patient.hospitalId = hospital.hospitalId
    patient.eta = calculate_eta(ambulance.location, patient.location)
    save_patient(patient)
    
    # Log
    add_log(f"Ambulance {ambulance.ambulanceId} dispatched to patient {patient.patientId}")
    
    return ambulance.ambulanceId, hospital.hospitalId


async def update_ambulance_positions():
    """
    Simulate ambulance movement. Call this in a background task.
    Every second, move ambulances toward their targets.
    """
    while True:
        await asyncio.sleep(MOVEMENT_INTERVAL)
        
        for ambulance in get_all_ambulances():
            if ambulance.status == AmbulanceStatus.AVAILABLE:
                continue
            
            if ambulance.targetLocation is None:
                continue
            
            # Check if reached target
            distance = haversine_distance(
                ambulance.location.lat, ambulance.location.lng,
                ambulance.targetLocation.lat, ambulance.targetLocation.lng
            )
            
            if distance < 0.0001:  # Reached target
                patient = get_patient(ambulance.currentPatientId)
                
                if patient and patient.status == PatientStatus.PICKUP:
                    # Reached patient, now go to hospital
                    hospital = get_hospital(patient.hospitalId)
                    if hospital:
                        ambulance.status = AmbulanceStatus.TO_HOSPITAL
                        ambulance.targetLocation = hospital.location
                        patient.status = PatientStatus.TO_HOSPITAL
                        add_log(f"Ambulance {ambulance.ambulanceId} picked up patient {patient.patientId}")
                        save_patient(patient)
                
                elif patient and patient.status == PatientStatus.TO_HOSPITAL:
                    # Reached hospital
                    ambulance.status = AmbulanceStatus.COMPLETED
                    ambulance.targetLocation = None
                    ambulance.currentPatientId = None
                    patient.status = PatientStatus.COMPLETED
                    add_log(f"Ambulance {ambulance.ambulanceId} reached hospital with patient {patient.patientId}")
                    save_patient(patient)
            else:
                # Move toward target
                ambulance.location = move_toward(
                    ambulance.location,
                    ambulance.targetLocation,
                    AMBULANCE_SPEED
                )
            
            save_ambulance(ambulance)


def create_demo_ambulances() -> Dict[str, Ambulance]:
    """Create demo ambulances"""
    ambulances_data = [
        {
            "ambulanceId": "AMB-001",
            "driverId": "DRV-001",
            "driverName": "John Smith",
            "lat": 12.3456,
            "lng": 74.5678,
        },
        {
            "ambulanceId": "AMB-002",
            "driverId": "DRV-002",
            "driverName": "Maria Garcia",
            "lat": 12.3500,
            "lng": 74.5700,
        },
        {
            "ambulanceId": "AMB-003",
            "driverId": "DRV-003",
            "driverName": "Ahmed Hassan",
            "lat": 12.3400,
            "lng": 74.5600,
        },
        {
            "ambulanceId": "AMB-004",
            "driverId": "DRV-004",
            "driverName": "Lisa Chen",
            "lat": 12.3600,
            "lng": 74.5750,
        },
        {
            "ambulanceId": "AMB-005",
            "driverId": "DRV-005",
            "driverName": "Robert Johnson",
            "lat": 12.3300,
            "lng": 74.5500,
        },
    ]
    
    result = {}
    for data in ambulances_data:
        amb = Ambulance(
            ambulanceId=data["ambulanceId"],
            driverId=data["driverId"],
            driverName=data["driverName"],
            status=AmbulanceStatus.AVAILABLE,
            location=Location(lat=data["lat"], lng=data["lng"]),
        )
        result[amb.ambulanceId] = amb
    
    return result


def create_demo_hospitals() -> Dict[str, Hospital]:
    """Create demo hospitals"""
    hospitals_data = [
        {
            "hospitalId": "HOSP-001",
            "name": "City General Hospital",
            "lat": 12.3500,
            "lng": 74.5900,
            "icuBeds": 20,
            "generalBeds": 100,
        },
        {
            "hospitalId": "HOSP-002",
            "name": "St. Mary Medical Center",
            "lat": 12.3300,
            "lng": 74.5400,
            "icuBeds": 15,
            "generalBeds": 80,
        },
        {
            "hospitalId": "HOSP-003",
            "name": "Emergency Care Clinic",
            "lat": 12.3700,
            "lng": 74.5600,
            "icuBeds": 10,
            "generalBeds": 50,
        },
    ]
    
    result = {}
    for data in hospitals_data:
        hosp = Hospital(
            hospitalId=data["hospitalId"],
            name=data["name"],
            location=Location(lat=data["lat"], lng=data["lng"]),
            icuBeds=data["icuBeds"],
            generalBeds=data["generalBeds"],
            occupiedBeds=0,
        )
        result[hosp.hospitalId] = hosp
    
    return result


def release_all_ambulances():
    """Release all ambulances back to AVAILABLE status"""
    for ambulance in get_all_ambulances():
        ambulance.status = AmbulanceStatus.AVAILABLE
        ambulance.currentPatientId = None
        ambulance.targetLocation = None
        save_ambulance(ambulance)
    add_log("All ambulances released")




from typing import Dict

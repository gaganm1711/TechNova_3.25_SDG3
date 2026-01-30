"""
In-memory data storage for Smart Ambulance System
"""
from .models import Patient, Ambulance, Hospital, SystemLogEntry
from datetime import datetime
from typing import Dict, List, Optional

# Global in-memory storage
patients: Dict[str, Patient] = {}
ambulances: Dict[str, Ambulance] = {}
hospitals: Dict[str, Hospital] = {}
system_logs: List[SystemLogEntry] = []


def add_log(message: str, level: str = "INFO"):
    """Add a system log entry"""
    log = SystemLogEntry(
        timestamp=datetime.now(),
        message=message,
        level=level
    )
    system_logs.append(log)
    if len(system_logs) > 1000:  # Keep last 1000 logs
        system_logs.pop(0)
    print(f"[{level}] {message}")


def get_patient(patient_id: str) -> Optional[Patient]:
    """Retrieve a patient"""
    return patients.get(patient_id)


def get_ambulance(ambulance_id: str) -> Optional[Ambulance]:
    """Retrieve an ambulance"""
    return ambulances.get(ambulance_id)


def get_hospital(hospital_id: str) -> Optional[Hospital]:
    """Retrieve a hospital"""
    return hospitals.get(hospital_id)


def save_patient(patient: Patient):
    """Save a patient"""
    patients[patient.patientId] = patient


def save_ambulance(ambulance: Ambulance):
    """Save an ambulance"""
    ambulances[ambulance.ambulanceId] = ambulance


def get_all_patients() -> List[Patient]:
    """Get all patients"""
    return list(patients.values())


def get_all_ambulances() -> List[Ambulance]:
    """Get all ambulances"""
    return list(ambulances.values())


def get_all_hospitals() -> List[Hospital]:
    """Get all hospitals"""
    return list(hospitals.values())


def get_available_ambulance() -> Optional[Ambulance]:
    """Get the first available ambulance"""
    for amb in ambulances.values():
        from .models import AmbulanceStatus
        if amb.status == AmbulanceStatus.AVAILABLE:
            return amb
    return None


def get_nearest_hospital(lat: float, lng: float) -> Optional[Hospital]:
    """Get the nearest hospital (simplified - just returns first with available beds)"""
    for hosp in hospitals.values():
        available = hosp.generalBeds - hosp.occupiedBeds
        if available > 0:
            return hosp
    return None


def clear_all():
    """Clear all data (for testing)"""
    global patients, ambulances, hospitals, system_logs
    patients.clear()
    ambulances.clear()
    hospitals.clear()
    system_logs.clear()

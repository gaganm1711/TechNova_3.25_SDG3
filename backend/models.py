"""
Pydantic models for Smart Ambulance System
"""
from pydantic import BaseModel
from typing import Optional, List
from enum import Enum
from datetime import datetime


class PatientStatus(str, Enum):
    WAITING = "WAITING"
    PICKUP = "PICKUP"
    TO_HOSPITAL = "TO_HOSPITAL"
    ARRIVED = "ARRIVED"
    COMPLETED = "COMPLETED"


class AmbulanceStatus(str, Enum):
    AVAILABLE = "AVAILABLE"
    ASSIGNED = "ASSIGNED"
    PICKING_UP = "PICKING_UP"
    TO_HOSPITAL = "TO_HOSPITAL"
    COMPLETED = "COMPLETED"


# ===== REQUEST MODELS =====

class LoginRequest(BaseModel):
    username: str
    password: str


class EmergencyRequest(BaseModel):
    name: str
    age: Optional[int] = None
    condition: str
    latitude: float
    longitude: float


# ===== INTERNAL DATA MODELS =====

class Location(BaseModel):
    lat: float
    lng: float


class Patient(BaseModel):
    patientId: str
    name: str
    age: Optional[int]
    condition: str
    status: PatientStatus
    location: Location
    createdAt: datetime
    ambulanceId: Optional[str] = None
    hospitalId: Optional[str] = None
    eta: Optional[int] = None  # seconds


class Ambulance(BaseModel):
    ambulanceId: str
    driverId: str
    driverName: str
    status: AmbulanceStatus
    location: Location
    currentPatientId: Optional[str] = None
    targetLocation: Optional[Location] = None


class Hospital(BaseModel):
    hospitalId: str
    name: str
    location: Location
    icuBeds: int
    generalBeds: int
    occupiedBeds: int = 0


# ===== RESPONSE MODELS =====

class LoginResponse(BaseModel):
    access_token: str
    token_type: str
    message: str


class EmergencyResponse(BaseModel):
    patientId: str
    assignedAmbulanceId: str
    hospitalId: str
    eta: int
    message: str


class PatientStatusResponse(BaseModel):
    patientId: str
    name: str
    age: Optional[int]
    condition: str
    status: PatientStatus
    location: Location
    ambulanceLocation: Optional[Location]
    ambulanceETA: Optional[int]
    hospitalLocation: Optional[Location]
    hospitalName: Optional[str]


class MapStateResponse(BaseModel):
    patient: Optional[PatientStatusResponse]
    ambulances: List[Ambulance]
    hospitals: List[Hospital]


class AmbulanceFleetResponse(BaseModel):
    ambulances: List[Ambulance]


class SystemLogEntry(BaseModel):
    timestamp: datetime
    message: str
    level: str  # INFO, WARNING, ERROR


class AdminDashboardResponse(BaseModel):
    patient: Optional[PatientStatusResponse]
    ambulances: List[Ambulance]
    hospitals: List[Hospital]
    logs: List[SystemLogEntry]

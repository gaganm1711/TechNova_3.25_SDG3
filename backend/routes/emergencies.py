from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from db.init_db import SessionLocal
from models.models import Emergency

router = APIRouter(prefix="/emergency", tags=["emergency"])

class EmergencyCreate(BaseModel):
    patient_name: str
    age: int | None = None
    symptoms: str
    lat: float
    lon: float

@router.post("", status_code=201)
def create_emergency(payload: EmergencyCreate):
    session: Session = SessionLocal()
    em = Emergency(
        patient_name=payload.patient_name,
        age=payload.age,
        symptoms=payload.symptoms,
        lat=payload.lat,
        lon=payload.lon,
    )
    session.add(em)
    session.commit()
    session.refresh(em)
    session.close()
    return {"id": em.id, "message": "Emergency created"}

@router.get("/all")
def list_emergencies():
    session: Session = SessionLocal()
    items = session.query(Emergency).order_by(Emergency.created_at.desc()).all()
    out = []
    for e in items:
        out.append({
            "id": e.id,
            "patient_name": e.patient_name,
            "age": e.age,
            "symptoms": e.symptoms,
            "lat": e.lat,
            "lon": e.lon,
            "assigned_hospital_id": e.assigned_hospital_id,
        })
    session.close()
    return out

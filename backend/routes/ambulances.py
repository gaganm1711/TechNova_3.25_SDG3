from fastapi import APIRouter
from db.init_db import SessionLocal
from models.models import Ambulance

router = APIRouter(prefix="/ambulances", tags=["ambulances"])

@router.get("")
def get_ambulances():
    session = SessionLocal()
    rows = session.query(Ambulance).all()
    out = []
    for r in rows:
        out.append({
            "id": r.id,
            "identifier": r.identifier,
            "lat": r.lat,
            "lon": r.lon,
            "status": r.status,
        })
    session.close()
    return out

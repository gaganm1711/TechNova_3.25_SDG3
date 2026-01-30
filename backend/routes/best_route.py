from fastapi import APIRouter, HTTPException
from db.init_db import SessionLocal
from models.models import Emergency, Hospital
from ai.priority_engine import select_best_hospital
import requests
import os

router = APIRouter(prefix="/best-route", tags=["routing"])
OSRM_URL = os.getenv('OSRM_URL', 'http://localhost:5000')

@router.get("/{emergency_id}")
def get_best_route(emergency_id: int):
    session = SessionLocal()
    em = session.query(Emergency).filter(Emergency.id == emergency_id).first()
    if not em:
        raise HTTPException(status_code=404, detail="Emergency not found")
    hospitals = session.query(Hospital).all()
    # select hospital via AI engine
    best = select_best_hospital(em, hospitals)
    if not best:
        raise HTTPException(status_code=404, detail="No hospital available")
    # call OSRM to compute route
    src = f"{em.lon},{em.lat}"
    dst = f"{best.lon},{best.lat}"
    url = f"{OSRM_URL}/route/v1/driving/{src};{dst}?overview=full&geometries=polyline&annotations=duration"
    try:
        res = requests.get(url, timeout=5)
        data = res.json()
        route = data['routes'][0]
        duration = route.get('duration')  # seconds
        geometry = route.get('geometry')
    except Exception:
        duration = None
        geometry = None
    # assign hospital id to emergency
    em.assigned_hospital_id = best.id
    session.add(em)
    session.commit()
    session.close()
    return {
        "hospital": {
            "id": best.id,
            "name": best.name,
            "lat": best.lat,
            "lon": best.lon,
            "icu_available": best.icu_available,
            "beds_available": best.beds_available,
        },
        "eta_seconds": duration,
        "geometry_polyline": geometry,
    }

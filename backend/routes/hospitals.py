from fastapi import APIRouter
from db.init_db import SessionLocal
from models.models import Hospital

router = APIRouter(prefix="/hospitals", tags=["hospitals"])

@router.get("")
def list_hospitals():
    session = SessionLocal()
    rows = session.query(Hospital).all()
    out = []
    for r in rows:
        out.append({
            "id": r.id,
            "name": r.name,
            "lat": r.lat,
            "lon": r.lon,
            "beds_total": r.beds_total,
            "beds_available": r.beds_available,
            "icu_beds": r.icu_beds,
            "icu_available": r.icu_available,
        })
    session.close()
    return out

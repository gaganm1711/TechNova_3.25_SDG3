import os
from dotenv import load_dotenv
from db.database import engine, SessionLocal, Base
from models.models import Hospital, Ambulance, User

load_dotenv()

SAMPLE_HOSPITALS = [
    {"name": "Central General Hospital", "lat": 40.7128, "lon": -74.0060, "beds_total": 150, "beds_available": 12, "icu_beds": 20, "icu_available": 2},
    {"name": "Northside Medical Center", "lat": 40.730610, "lon": -73.935242, "beds_total": 90, "beds_available": 10, "icu_beds": 10, "icu_available": 1},
    {"name": "South Health Clinic", "lat": 40.700292, "lon": -73.987495, "beds_total": 60, "beds_available": 30, "icu_beds": 5, "icu_available": 3},
]

SAMPLE_AMBULANCES = [
    {"identifier": "AMB-01", "lat": 40.715, "lon": -74.011, "status": "idle"},
    {"identifier": "AMB-02", "lat": 40.725, "lon": -73.995, "status": "idle"},
]


def create_tables_and_seed():
    Base.metadata.create_all(bind=engine)
    session = SessionLocal()
    # seed hospitals if empty
    if session.query(Hospital).count() == 0:
        for h in SAMPLE_HOSPITALS:
            session.add(Hospital(**h))
    if session.query(Ambulance).count() == 0:
        for a in SAMPLE_AMBULANCES:
            session.add(Ambulance(**a))
    session.commit()
    session.close()

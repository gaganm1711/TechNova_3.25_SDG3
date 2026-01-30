from sqlalchemy import Column, Integer, String, Float, Boolean, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from db.database import Base
import datetime

class User(Base):
    """User table for Firebase authentication and role management"""
    __tablename__ = 'users'
    id = Column(Integer, primary_key=True)
    firebase_uid = Column(String, unique=True, nullable=False)
    email = Column(String, unique=True, nullable=False)
    role = Column(String, nullable=False)  # ambulance, hospital, or admin
    display_name = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class Patient(Base):
    __tablename__ = 'patients'
    id = Column(Integer, primary_key=True)
    name = Column(String, nullable=False)
    age = Column(Integer)

class Ambulance(Base):
    __tablename__ = 'ambulances'
    id = Column(Integer, primary_key=True)
    identifier = Column(String, nullable=False)
    lat = Column(Float, default=0.0)
    lon = Column(Float, default=0.0)
    status = Column(String, default='idle')  # idle, enroute, busy

class Hospital(Base):
    __tablename__ = 'hospitals'
    id = Column(Integer, primary_key=True)
    name = Column(String, nullable=False)
    lat = Column(Float, nullable=False)
    lon = Column(Float, nullable=False)
    beds_total = Column(Integer, default=0)
    beds_available = Column(Integer, default=0)
    icu_beds = Column(Integer, default=0)
    icu_available = Column(Integer, default=0)

class Emergency(Base):
    __tablename__ = 'emergencies'
    id = Column(Integer, primary_key=True)
    patient_name = Column(String, nullable=False)
    age = Column(Integer)
    symptoms = Column(String)
    lat = Column(Float, nullable=False)
    lon = Column(Float, nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    assigned_hospital_id = Column(Integer, ForeignKey('hospitals.id'), nullable=True)
    assigned_hospital = relationship('Hospital')

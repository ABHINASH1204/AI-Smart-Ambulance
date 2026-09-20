from sqlalchemy import Column, Integer, String, Enum, ForeignKey, Float, DateTime, func
import enum

from app.database import Base


class TripStatus(str, enum.Enum):
    REQUESTED = "REQUESTED"
    ASSIGNED = "ASSIGNED"
    ACCEPTED = "ACCEPTED"
    EN_ROUTE = "EN_ROUTE"
    ARRIVED_AT_PATIENT = "ARRIVED_AT_PATIENT"
    PATIENT_PICKED_UP = "PATIENT_PICKED_UP"
    EN_ROUTE_TO_HOSPITAL = "EN_ROUTE_TO_HOSPITAL"
    ARRIVED_AT_HOSPITAL = "ARRIVED_AT_HOSPITAL"
    COMPLETED = "COMPLETED"
    CANCELLED = "CANCELLED"


class Trip(Base):
    __tablename__ = "trips"

    id = Column(Integer, primary_key=True, index=True)
    emergency_id = Column(Integer, ForeignKey("emergencies.id"), nullable=False)
    ambulance_id = Column(Integer, ForeignKey("ambulances.id"), nullable=True)
    hospital_id = Column(Integer, ForeignKey("hospitals.id"), nullable=True)
    start_time = Column(DateTime(timezone=True), server_default=func.now())
    patient_pickup_time = Column(DateTime(timezone=True), nullable=True)
    hospital_arrival_time = Column(DateTime(timezone=True), nullable=True)
    distance = Column(Float, nullable=True)
    estimated_time = Column(Float, nullable=True)
    actual_time = Column(Float, nullable=True)
    status = Column(Enum(TripStatus), nullable=False, default=TripStatus.REQUESTED)

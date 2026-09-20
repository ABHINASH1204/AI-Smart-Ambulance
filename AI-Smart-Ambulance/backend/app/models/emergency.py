from sqlalchemy import Column, Integer, String, Enum, ForeignKey, Float, DateTime, func
import enum

from app.database import Base


class EmergencyStatus(str, enum.Enum):
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


class Emergency(Base):
    __tablename__ = "emergencies"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    emergency_type = Column(String(60), nullable=False)
    severity = Column(String(30), nullable=True)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    status = Column(Enum(EmergencyStatus), nullable=False, default=EmergencyStatus.REQUESTED)
    priority_score = Column(Float, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

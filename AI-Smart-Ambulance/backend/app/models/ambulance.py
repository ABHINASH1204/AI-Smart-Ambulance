from sqlalchemy import Column, Integer, String, Enum, ForeignKey, Float, DateTime, func
import enum

from app.database import Base


class AmbulanceStatus(str, enum.Enum):
    AVAILABLE = "AVAILABLE"
    ASSIGNED = "ASSIGNED"
    EN_ROUTE = "EN_ROUTE"
    OFFLINE = "OFFLINE"


class AmbulanceType(str, enum.Enum):
    BASIC = "BASIC"
    ADVANCED = "ADVANCED"
    ICU = "ICU"


class Ambulance(Base):
    __tablename__ = "ambulances"

    id = Column(Integer, primary_key=True, index=True)
    vehicle_number = Column(String(30), unique=True, nullable=False)
    driver_id = Column(Integer, ForeignKey("drivers.id"), nullable=True)
    ambulance_type = Column(Enum(AmbulanceType), nullable=False, default=AmbulanceType.BASIC)
    status = Column(Enum(AmbulanceStatus), nullable=False, default=AmbulanceStatus.AVAILABLE)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

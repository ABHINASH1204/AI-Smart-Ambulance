from sqlalchemy import Column, Integer, String, Boolean, Enum, Float, DateTime, func
import enum

from app.database import Base


class HospitalStatus(str, enum.Enum):
    ACTIVE = "ACTIVE"
    FULL = "FULL"
    INACTIVE = "INACTIVE"


class Hospital(Base):
    __tablename__ = "hospitals"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(150), nullable=False)
    address = Column(String(255), nullable=True)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    emergency_available = Column(Boolean, default=True)
    icu_available = Column(Boolean, default=False)
    trauma_available = Column(Boolean, default=False)
    available_beds = Column(Integer, default=0)
    status = Column(Enum(HospitalStatus), nullable=False, default=HospitalStatus.ACTIVE)

from sqlalchemy import Column, Integer, String, Enum, ForeignKey, DateTime, func
import enum

from app.database import Base


class DriverStatus(str, enum.Enum):
    AVAILABLE = "AVAILABLE"
    BUSY = "BUSY"
    OFFLINE = "OFFLINE"


class Driver(Base):
    __tablename__ = "drivers"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    license_number = Column(String(50), unique=True, nullable=False)
    status = Column(Enum(DriverStatus), nullable=False, default=DriverStatus.OFFLINE)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

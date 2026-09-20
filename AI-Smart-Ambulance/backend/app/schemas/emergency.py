from datetime import datetime
from pydantic import BaseModel


class EmergencyCreate(BaseModel):
    user_id: int
    emergency_type: str
    severity: str | None = None
    latitude: float
    longitude: float


class EmergencyOut(BaseModel):
    id: int
    user_id: int
    emergency_type: str
    severity: str | None = None
    latitude: float
    longitude: float
    status: str
    priority_score: float | None = None
    created_at: datetime

    class Config:
        from_attributes = True


class EmergencyStatusUpdate(BaseModel):
    status: str

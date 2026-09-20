from datetime import datetime
from pydantic import BaseModel


class TripCreate(BaseModel):
    emergency_id: int
    ambulance_id: int | None = None
    hospital_id: int | None = None


class TripOut(BaseModel):
    id: int
    emergency_id: int
    ambulance_id: int | None = None
    hospital_id: int | None = None
    start_time: datetime
    patient_pickup_time: datetime | None = None
    hospital_arrival_time: datetime | None = None
    distance: float | None = None
    estimated_time: float | None = None
    actual_time: float | None = None
    status: str

    class Config:
        from_attributes = True


class TripStatusUpdate(BaseModel):
    status: str

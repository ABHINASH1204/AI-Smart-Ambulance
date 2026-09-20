from datetime import datetime
from pydantic import BaseModel


class AmbulanceOut(BaseModel):
    id: int
    vehicle_number: str
    driver_id: int | None = None
    ambulance_type: str
    status: str
    latitude: float | None = None
    longitude: float | None = None
    created_at: datetime

    class Config:
        from_attributes = True


class AmbulanceStatusUpdate(BaseModel):
    status: str


class AmbulanceLocationUpdate(BaseModel):
    latitude: float
    longitude: float

from datetime import datetime
from pydantic import BaseModel


class DriverOut(BaseModel):
    id: int
    user_id: int
    license_number: str
    status: str
    created_at: datetime

    class Config:
        from_attributes = True


class DriverStatusUpdate(BaseModel):
    status: str  # AVAILABLE | BUSY | OFFLINE

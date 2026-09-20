from pydantic import BaseModel


class HospitalOut(BaseModel):
    id: int
    name: str
    address: str | None = None
    latitude: float
    longitude: float
    emergency_available: bool
    icu_available: bool
    trauma_available: bool
    available_beds: int
    status: str

    class Config:
        from_attributes = True

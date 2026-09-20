from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.trip import Trip
from app.schemas.trip import TripCreate, TripOut, TripStatusUpdate
from app.services.trip_service import create_trip, update_trip_status

router = APIRouter()


@router.post("/", response_model=TripOut)
def create(payload: TripCreate, db: Session = Depends(get_db)):
    return create_trip(db, payload.emergency_id, payload.ambulance_id, payload.hospital_id)


@router.get("/{trip_id}", response_model=TripOut)
def get_trip(trip_id: int, db: Session = Depends(get_db)):
    trip = db.query(Trip).filter(Trip.id == trip_id).first()
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")
    return trip


@router.patch("/{trip_id}/status", response_model=TripOut)
def set_status(trip_id: int, payload: TripStatusUpdate, db: Session = Depends(get_db)):
    trip = update_trip_status(db, trip_id, payload.status)
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")
    return trip

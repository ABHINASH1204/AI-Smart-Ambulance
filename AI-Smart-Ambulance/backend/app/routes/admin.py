from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.emergency import Emergency
from app.models.ambulance import Ambulance, AmbulanceStatus
from app.models.hospital import Hospital, HospitalStatus
from app.models.trip import Trip, TripStatus

router = APIRouter()


@router.get("/stats")
def get_stats(db: Session = Depends(get_db)):
    total_emergencies = db.query(Emergency).count()
    active_trips = db.query(Trip).filter(
        Trip.status.notin_([TripStatus.COMPLETED, TripStatus.CANCELLED])
    ).count()
    available_ambulances = db.query(Ambulance).filter(
        Ambulance.status == AmbulanceStatus.AVAILABLE
    ).count()
    active_hospitals = db.query(Hospital).filter(
        Hospital.status == HospitalStatus.ACTIVE
    ).count()

    return {
        "total_emergencies": total_emergencies,
        "active_trips": active_trips,
        "available_ambulances": available_ambulances,
        "active_hospitals": active_hospitals,
    }
from sqlalchemy.orm import Session
from datetime import datetime

from app.models.trip import Trip, TripStatus
from app.services.notification_service import notify_driver, notify_user


def create_trip(db: Session, emergency_id: int, ambulance_id: int | None, hospital_id: int | None) -> Trip:
    trip = Trip(
        emergency_id=emergency_id,
        ambulance_id=ambulance_id,
        hospital_id=hospital_id,
        status=TripStatus.REQUESTED if ambulance_id is None else TripStatus.ASSIGNED,
    )
    db.add(trip)
    db.commit()
    db.refresh(trip)

    if ambulance_id is not None:
        notify_driver(ambulance_id, f"New emergency assigned: trip #{trip.id}")

    return trip


def update_trip_status(db: Session, trip_id: int, status: str) -> Trip | None:
    trip = db.query(Trip).filter(Trip.id == trip_id).first()
    if not trip:
        return None
    trip.status = status
    if status == "PATIENT_PICKED_UP":
        trip.patient_pickup_time = datetime.utcnow()
    elif status == "ARRIVED_AT_HOSPITAL":
        trip.hospital_arrival_time = datetime.utcnow()
    db.commit()
    db.refresh(trip)

    if status in ("EN_ROUTE", "ARRIVED_AT_PATIENT", "ARRIVED_AT_HOSPITAL", "COMPLETED"):
        notify_user(trip.emergency_id, f"Trip #{trip.id} status update: {status}")

    return trip
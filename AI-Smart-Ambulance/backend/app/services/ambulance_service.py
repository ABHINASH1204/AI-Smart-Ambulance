from sqlalchemy.orm import Session

from app.models.ambulance import Ambulance, AmbulanceStatus
from app.utils.helpers import haversine_distance_km


def get_available_ambulances(db: Session) -> list[Ambulance]:
    return db.query(Ambulance).filter(Ambulance.status == AmbulanceStatus.AVAILABLE).all()


def recommend_ambulance(db: Session, latitude: float, longitude: float) -> Ambulance | None:
    """Rule-based fallback: nearest available ambulance.
    Replace/augment with ai.models.ambulance_recommendation once trained."""
    candidates = get_available_ambulances(db)
    best, best_distance = None, None
    for amb in candidates:
        if amb.latitude is None or amb.longitude is None:
            continue
        d = haversine_distance_km(latitude, longitude, amb.latitude, amb.longitude)
        if best_distance is None or d < best_distance:
            best, best_distance = amb, d
    return best


def update_ambulance_status(db: Session, ambulance_id: int, status: str) -> Ambulance | None:
    amb = db.query(Ambulance).filter(Ambulance.id == ambulance_id).first()
    if not amb:
        return None
    amb.status = status
    db.commit()
    db.refresh(amb)
    return amb


def update_ambulance_location(db: Session, ambulance_id: int, latitude: float, longitude: float) -> Ambulance | None:
    amb = db.query(Ambulance).filter(Ambulance.id == ambulance_id).first()
    if not amb:
        return None
    amb.latitude, amb.longitude = latitude, longitude
    db.commit()
    db.refresh(amb)
    return amb

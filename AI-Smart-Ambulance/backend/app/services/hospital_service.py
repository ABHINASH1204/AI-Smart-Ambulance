from sqlalchemy.orm import Session

from app.models.hospital import Hospital, HospitalStatus
from app.utils.helpers import haversine_distance_km


def get_active_hospitals(db: Session) -> list[Hospital]:
    return db.query(Hospital).filter(Hospital.status == HospitalStatus.ACTIVE).all()


def recommend_hospital(db: Session, latitude: float, longitude: float, needs_icu: bool = False,
                        needs_trauma: bool = False) -> Hospital | None:
    """Rule-based fallback: nearest suitable hospital with capacity.
    Replace/augment with ai.models.hospital_recommendation once trained."""
    candidates = get_active_hospitals(db)
    best, best_distance = None, None
    for hosp in candidates:
        if hosp.available_beds <= 0:
            continue
        if needs_icu and not hosp.icu_available:
            continue
        if needs_trauma and not hosp.trauma_available:
            continue
        d = haversine_distance_km(latitude, longitude, hosp.latitude, hosp.longitude)
        if best_distance is None or d < best_distance:
            best, best_distance = hosp, d
    return best

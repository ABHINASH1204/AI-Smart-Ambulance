import os
import joblib
import pandas as pd
from sqlalchemy.orm import Session

from app.models.ambulance import Ambulance, AmbulanceStatus
from app.utils.helpers import haversine_distance_km

_MODEL_PATH = os.path.join(os.path.dirname(__file__), "..", "..", "..", "ai", "trained_models", "ambulance_recommendation_model.pkl")
_model = None
_model_load_failed = False


def _get_model():
    global _model, _model_load_failed
    if _model is None and not _model_load_failed:
        try:
            _model = joblib.load(_MODEL_PATH)
        except Exception:
            _model_load_failed = True
    return _model


def get_available_ambulances(db: Session) -> list[Ambulance]:
    return db.query(Ambulance).filter(Ambulance.status == AmbulanceStatus.AVAILABLE).all()


def recommend_ambulance(db: Session, latitude: float, longitude: float,
                         emergency_type: str = "Other", severity: str = "MEDIUM") -> Ambulance | None:
    all_ambulances = db.query(Ambulance).all()
    model = _get_model()

    best, best_score = None, None
    for amb in all_ambulances:
        if amb.latitude is None or amb.longitude is None:
            continue
        distance = haversine_distance_km(latitude, longitude, amb.latitude, amb.longitude)
        is_available = 1 if amb.status == AmbulanceStatus.AVAILABLE else 0

        if model is not None:
            try:
                features = pd.DataFrame({
                    'emergency_type': [emergency_type],
                    'severity': [severity.upper()],
                    'ambulance_type': [amb.ambulance_type.value if hasattr(amb.ambulance_type, 'value') else amb.ambulance_type],
                    'distance_km': [distance],
                    'ambulance_available': [is_available],
                })
                score = float(model.predict(features)[0])
            except Exception:
                score = _fallback_score(distance, is_available)
        else:
            score = _fallback_score(distance, is_available)

        if best_score is None or score > best_score:
            best, best_score = amb, score

    # Only return it if it's actually usable (available and non-negative score)
    if best is not None and best.status == AmbulanceStatus.AVAILABLE:
        return best
    return None


def _fallback_score(distance: float, is_available: int) -> float:
    if not is_available:
        return -1.0
    return -distance  # closer = higher score


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
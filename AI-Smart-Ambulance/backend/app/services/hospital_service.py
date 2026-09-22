import os
import joblib
import pandas as pd
from sqlalchemy.orm import Session

from app.models.hospital import Hospital, HospitalStatus
from app.utils.helpers import haversine_distance_km

_MODEL_PATH = os.path.join(os.path.dirname(__file__), "..", "..", "..", "ai", "trained_models", "hospital_recommendation_model.pkl")
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


def get_active_hospitals(db: Session) -> list[Hospital]:
    return db.query(Hospital).filter(Hospital.status == HospitalStatus.ACTIVE).all()


def recommend_hospital(db: Session, latitude: float, longitude: float, needs_icu: bool = False,
                        needs_trauma: bool = False, severity: str = "MEDIUM") -> Hospital | None:
    candidates = get_active_hospitals(db)
    model = _get_model()

    best, best_score = None, None
    for hosp in candidates:
        distance = haversine_distance_km(latitude, longitude, hosp.latitude, hosp.longitude)

        if model is not None:
            try:
                features = pd.DataFrame({
                    'severity': [severity.upper()],
                    'needs_icu': [1 if needs_icu else 0],
                    'needs_trauma': [1 if needs_trauma else 0],
                    'hospital_has_icu': [1 if hosp.icu_available else 0],
                    'hospital_has_trauma': [1 if hosp.trauma_available else 0],
                    'available_beds': [hosp.available_beds],
                    'distance_km': [distance],
                })
                score = float(model.predict(features)[0])
            except Exception:
                score = _fallback_score(hosp, distance, needs_icu, needs_trauma)
        else:
            score = _fallback_score(hosp, distance, needs_icu, needs_trauma)

        if best_score is None or score > best_score:
            best, best_score = hosp, score

    if best is not None and best_score is not None and best_score > 0:
        return best
    return None


def _fallback_score(hosp: Hospital, distance: float, needs_icu: bool, needs_trauma: bool) -> float:
    if hosp.available_beds <= 0:
        return 0.0
    if needs_icu and not hosp.icu_available:
        return 0.0
    if needs_trauma and not hosp.trauma_available:
        return 0.0
    return 100.0 - distance  # closer = higher score, always positive if suitable
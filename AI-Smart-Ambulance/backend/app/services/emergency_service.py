import os
import joblib
import pandas as pd
from sqlalchemy.orm import Session

from app.models.emergency import Emergency, EmergencyStatus
from app.schemas.emergency import EmergencyCreate

_MODEL_PATH = os.path.join(os.path.dirname(__file__), "..", "..", "..", "ai", "trained_models", "emergency_priority_model.pkl")
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


def create_emergency(db: Session, data: EmergencyCreate) -> Emergency:
    emergency = Emergency(
        user_id=data.user_id,
        emergency_type=data.emergency_type,
        severity=data.severity,
        latitude=data.latitude,
        longitude=data.longitude,
        status=EmergencyStatus.REQUESTED,
    )
    db.add(emergency)
    db.commit()
    db.refresh(emergency)

    emergency.priority_score = _calculate_priority_score(data)
    db.commit()
    db.refresh(emergency)
    return emergency


def _calculate_priority_score(data: EmergencyCreate) -> float:
    model = _get_model()
    if model is not None:
        try:
            # Model expects the same features it was trained on. We don't have
            # patient_age or hour_of_day from the request yet, so use reasonable defaults.
            import datetime
            features = pd.DataFrame({
                'emergency_type': [data.emergency_type],
                'severity': [(data.severity or "MEDIUM").upper()],
                'patient_age': [40],  # placeholder until this is collected from the request
                'hour_of_day': [datetime.datetime.now().hour],
                'distance_to_nearest_hospital_km': [5.0],  # placeholder until real distance is available
            })
            score = model.predict(features)[0]
            return float(max(0.0, min(1.0, score)))
        except Exception:
            pass  # fall through to the rule-based fallback below

    return _fallback_priority_score(data.severity)


def _fallback_priority_score(severity: str | None) -> float:
    mapping = {"CRITICAL": 0.95, "HIGH": 0.75, "MEDIUM": 0.5, "LOW": 0.25}
    return mapping.get((severity or "").upper(), 0.5)


def update_emergency_status(db: Session, emergency_id: int, status: str) -> Emergency | None:
    emergency = db.query(Emergency).filter(Emergency.id == emergency_id).first()
    if not emergency:
        return None
    emergency.status = status
    db.commit()
    db.refresh(emergency)
    return emergency
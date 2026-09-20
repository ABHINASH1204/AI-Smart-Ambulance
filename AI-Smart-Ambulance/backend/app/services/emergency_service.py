from sqlalchemy.orm import Session

from app.models.emergency import Emergency, EmergencyStatus
from app.schemas.emergency import EmergencyCreate


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

    # Placeholder priority score until Person 3's model is wired in.
    # Replace this call with ai.models.emergency_priority_model once ready.
    emergency.priority_score = _fallback_priority_score(data.severity)
    db.commit()
    db.refresh(emergency)
    return emergency


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

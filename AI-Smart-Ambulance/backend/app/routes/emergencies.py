from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.emergency import Emergency
from app.schemas.emergency import EmergencyCreate, EmergencyOut, EmergencyStatusUpdate
from app.services.emergency_service import create_emergency, update_emergency_status
from app.utils.validators import is_valid_lat_lng

router = APIRouter()


@router.post("/", response_model=EmergencyOut)
def create(payload: EmergencyCreate, db: Session = Depends(get_db)):
    if not is_valid_lat_lng(payload.latitude, payload.longitude):
        raise HTTPException(status_code=400, detail="Invalid latitude/longitude values")
    return create_emergency(db, payload)


@router.get("/", response_model=list[EmergencyOut])
def list_emergencies(db: Session = Depends(get_db)):
    return db.query(Emergency).all()


@router.get("/{emergency_id}", response_model=EmergencyOut)
def get_emergency(emergency_id: int, db: Session = Depends(get_db)):
    emergency = db.query(Emergency).filter(Emergency.id == emergency_id).first()
    if not emergency:
        raise HTTPException(status_code=404, detail="Emergency not found")
    return emergency


@router.patch("/{emergency_id}/status", response_model=EmergencyOut)
def set_status(emergency_id: int, payload: EmergencyStatusUpdate, db: Session = Depends(get_db)):
    emergency = update_emergency_status(db, emergency_id, payload.status)
    if not emergency:
        raise HTTPException(status_code=404, detail="Emergency not found")
    return emergency
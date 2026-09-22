from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.ambulance import Ambulance
from app.schemas.ambulance import AmbulanceOut, AmbulanceStatusUpdate
from app.services.ambulance_service import (
    get_available_ambulances, recommend_ambulance, update_ambulance_status,
)

router = APIRouter()


@router.get("/", response_model=list[AmbulanceOut])
def list_ambulances(db: Session = Depends(get_db)):
    return db.query(Ambulance).all()


@router.get("/available", response_model=list[AmbulanceOut])
def list_available(db: Session = Depends(get_db)):
    return get_available_ambulances(db)


@router.get("/recommend", response_model=AmbulanceOut)
def recommend(latitude: float, longitude: float, emergency_type: str = "Other",
              severity: str = "MEDIUM", db: Session = Depends(get_db)):
    amb = recommend_ambulance(db, latitude, longitude, emergency_type, severity)
    if not amb:
        raise HTTPException(status_code=404, detail="No available ambulance found")
    return amb


@router.get("/{ambulance_id}", response_model=AmbulanceOut)
def get_ambulance(ambulance_id: int, db: Session = Depends(get_db)):
    amb = db.query(Ambulance).filter(Ambulance.id == ambulance_id).first()
    if not amb:
        raise HTTPException(status_code=404, detail="Ambulance not found")
    return amb


@router.patch("/{ambulance_id}/status", response_model=AmbulanceOut)
def set_status(ambulance_id: int, payload: AmbulanceStatusUpdate, db: Session = Depends(get_db)):
    amb = update_ambulance_status(db, ambulance_id, payload.status)
    if not amb:
        raise HTTPException(status_code=404, detail="Ambulance not found")
    return amb


@router.post("/{ambulance_id}/accept", response_model=AmbulanceOut)
def accept_emergency(ambulance_id: int, db: Session = Depends(get_db)):
    amb = update_ambulance_status(db, ambulance_id, "ASSIGNED")
    if not amb:
        raise HTTPException(status_code=404, detail="Ambulance not found")
    return amb
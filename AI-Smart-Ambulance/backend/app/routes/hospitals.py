from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.hospital import Hospital
from app.schemas.hospital import HospitalOut
from app.services.hospital_service import get_active_hospitals, recommend_hospital

router = APIRouter()


@router.get("/", response_model=list[HospitalOut])
def list_hospitals(db: Session = Depends(get_db)):
    return db.query(Hospital).all()


@router.get("/recommend", response_model=HospitalOut)
def recommend(latitude: float, longitude: float, needs_icu: bool = False,
              needs_trauma: bool = False, db: Session = Depends(get_db)):
    hospital = recommend_hospital(db, latitude, longitude, needs_icu, needs_trauma)
    if not hospital:
        raise HTTPException(status_code=404, detail="No suitable hospital found")
    return hospital


@router.get("/{hospital_id}", response_model=HospitalOut)
def get_hospital(hospital_id: int, db: Session = Depends(get_db)):
    hospital = db.query(Hospital).filter(Hospital.id == hospital_id).first()
    if not hospital:
        raise HTTPException(status_code=404, detail="Hospital not found")
    return hospital

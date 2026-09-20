from app.utils.constants import (
    USER_ROLES, DRIVER_STATUSES, AMBULANCE_STATUSES, AMBULANCE_TYPES, HOSPITAL_STATUSES,
)


def is_valid_role(role: str) -> bool:
    return role in USER_ROLES


def is_valid_driver_status(status: str) -> bool:
    return status in DRIVER_STATUSES


def is_valid_ambulance_status(status: str) -> bool:
    return status in AMBULANCE_STATUSES


def is_valid_ambulance_type(a_type: str) -> bool:
    return a_type in AMBULANCE_TYPES


def is_valid_hospital_status(status: str) -> bool:
    return status in HOSPITAL_STATUSES


def is_valid_lat_lng(lat: float, lng: float) -> bool:
    return -90 <= lat <= 90 and -180 <= lng <= 180

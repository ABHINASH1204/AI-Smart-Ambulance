from fastapi import APIRouter

from app.services.route_service import get_route

router = APIRouter()


@router.get("/")
def get_route_info(origin_lat: float, origin_lng: float, dest_lat: float, dest_lng: float):
    return get_route(origin_lat, origin_lng, dest_lat, dest_lng)

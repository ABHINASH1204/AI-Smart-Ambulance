import requests

from app.config import settings
from app.utils.helpers import haversine_distance_km


def get_route(origin_lat: float, origin_lng: float, dest_lat: float, dest_lng: float) -> dict:
    """Calls an OSRM-compatible routing API for distance/duration/geometry.
    Falls back to a straight-line estimate if the routing service is unreachable,
    so the rest of the team is never blocked on this integration."""
    try:
        url = (
            f"{settings.routing_api_url}/route/v1/driving/"
            f"{origin_lng},{origin_lat};{dest_lng},{dest_lat}"
            f"?overview=full&geometries=geojson"
        )
        response = requests.get(url, timeout=5)
        response.raise_for_status()
        data = response.json()
        route = data["routes"][0]
        return {
            "distance_km": route["distance"] / 1000,
            "duration_min": route["duration"] / 60,
            "geometry": route["geometry"],
            "source": "osrm",
        }
    except Exception:
        distance_km = haversine_distance_km(origin_lat, origin_lng, dest_lat, dest_lng)
        return {
            "distance_km": distance_km,
            "duration_min": (distance_km / 40) * 60,  # assume 40km/h avg
            "geometry": None,
            "source": "fallback_estimate",
        }

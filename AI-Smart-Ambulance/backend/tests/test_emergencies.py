import uuid
from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def make_test_user():
    email = f"emergtest_{uuid.uuid4().hex[:8]}@example.com"
    response = client.post("/api/auth/register", json={
        "name": "Emergency Test User",
        "email": email,
        "phone": "9998887777",
        "password": "testpass123",
        "role": "USER",
    })
    return response.json()["id"]


def test_create_emergency_succeeds():
    user_id = make_test_user()
    response = client.post("/api/emergencies/", json={
        "user_id": user_id,
        "emergency_type": "Accident",
        "severity": "HIGH",
        "latitude": 12.9716,
        "longitude": 77.5946,
    })
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "REQUESTED"
    assert data["priority_score"] == 0.75  # HIGH maps to 0.75


def test_create_emergency_rejects_invalid_coordinates():
    user_id = make_test_user()
    response = client.post("/api/emergencies/", json={
        "user_id": user_id,
        "emergency_type": "Accident",
        "severity": "HIGH",
        "latitude": 999,   # invalid
        "longitude": 77.5946,
    })
    assert response.status_code == 400


def test_get_nonexistent_emergency_returns_404():
    response = client.get("/api/emergencies/999999")
    assert response.status_code == 404
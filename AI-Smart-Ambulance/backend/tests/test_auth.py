import uuid
from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def unique_email():
    return f"test_{uuid.uuid4().hex[:8]}@example.com"


def test_register_creates_user():
    email = unique_email()
    response = client.post("/api/auth/register", json={
        "name": "Pytest User",
        "email": email,
        "phone": "1112223333",
        "password": "testpass123",
        "role": "USER",
    })
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == email
    assert data["role"] == "USER"
    assert "id" in data


def test_register_rejects_invalid_role():
    response = client.post("/api/auth/register", json={
        "name": "Bad Role",
        "email": unique_email(),
        "phone": "1112223333",
        "password": "testpass123",
        "role": "NOT_A_REAL_ROLE",
    })
    assert response.status_code == 400


def test_login_succeeds_with_correct_credentials():
    email = unique_email()
    password = "testpass123"
    client.post("/api/auth/register", json={
        "name": "Login Test",
        "email": email,
        "phone": "1112223333",
        "password": password,
        "role": "USER",
    })
    response = client.post("/api/auth/login", json={"email": email, "password": password})
    assert response.status_code == 200
    assert "access_token" in response.json()


def test_login_fails_with_wrong_password():
    email = unique_email()
    client.post("/api/auth/register", json={
        "name": "Wrong Pass Test",
        "email": email,
        "phone": "1112223333",
        "password": "correctpassword",
        "role": "USER",
    })
    response = client.post("/api/auth/login", json={"email": email, "password": "wrongpassword"})
    assert response.status_code == 401
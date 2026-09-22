import logging
logging.basicConfig(level=logging.INFO)

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import Base, engine
from app.middleware.error_handler import register_error_handlers
from app.routes import auth, users, drivers, ambulances, emergencies, hospitals, trips, routes as route_router, admin

# Creates tables if they don't exist yet. For anything beyond local dev,
# use database/schema.sql (source of truth) instead of relying on this.
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="AI Smart Ambulance API",
    description="Emergency response, dispatch and route optimization backend.",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # tighten before deployment
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

register_error_handlers(app)

app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(users.router, prefix="/api/users", tags=["users"])
app.include_router(drivers.router, prefix="/api/drivers", tags=["drivers"])
app.include_router(ambulances.router, prefix="/api/ambulances", tags=["ambulances"])
app.include_router(emergencies.router, prefix="/api/emergencies", tags=["emergencies"])
app.include_router(hospitals.router, prefix="/api/hospitals", tags=["hospitals"])
app.include_router(trips.router, prefix="/api/trips", tags=["trips"])
app.include_router(route_router.router, prefix="/api/routes", tags=["routes"])
app.include_router(admin.router, prefix="/api/admin", tags=["admin"])


@app.get("/")
def root():
    return {"status": "ok", "service": "AI Smart Ambulance API"}


@app.get("/health")
def health():
    return {"status": "healthy"}
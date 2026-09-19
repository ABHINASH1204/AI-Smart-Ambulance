# Database Design

Core entities:
users, drivers, ambulances, emergencies, hospitals, trips.

Relationships:
USER → EMERGENCY → AMBULANCE → DRIVER
EMERGENCY → HOSPITAL
EMERGENCY → TRIP

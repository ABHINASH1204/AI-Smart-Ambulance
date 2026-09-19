from fastapi import FastAPI

app = FastAPI(
    title="AI Smart Ambulance API",
    version="1.0.0",
    description="REST API for emergency ambulance response and route optimization."
)

@app.get("/")
def root():
    return {"message": "AI Smart Ambulance API is running"}

@app.get("/health")
def health():
    return {"status": "ok"}

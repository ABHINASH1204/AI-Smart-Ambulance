from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    database_url: str = "mysql+pymysql://root:password@localhost:3306/ai_smart_ambulance"
    secret_key: str = "change-this-secret-key"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 1440
    routing_api_url: str = "https://router.project-osrm.org"

    class Config:
        env_file = ".env"


settings = Settings()

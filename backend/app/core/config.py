from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional

class Settings(BaseSettings):
    PROJECT_NAME: str = "AuctionOS"
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str = "changethiskeyinproduction"  # Should be overridden by env var
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # CORS
    BACKEND_CORS_ORIGINS: list[str] | str = []

    @field_validator("BACKEND_CORS_ORIGINS", mode="before")
    @classmethod
    def assemble_cors_origins(cls, v: str | list[str]) -> list[str] | str:
        if isinstance(v, str) and not v.startswith("["):
            return [i.strip() for i in v.split(",")]
        elif isinstance(v, (list, str)):
            return v
        raise ValueError(v)

    DATABASE_URL: str = "mysql+pymysql://user:password@localhost:3306/auctionos"
    REDIS_URL: str = "redis://redis:6379"

    model_config = SettingsConfigDict(case_sensitive=True, env_file=".env")

settings = Settings()

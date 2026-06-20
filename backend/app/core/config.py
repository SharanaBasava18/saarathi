from functools import lru_cache

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    app_name: str = "SAARTHI API"
    app_version: str = "0.1.0"
    api_prefix: str = "/api"
    cors_origins: list[str] = Field(default_factory=lambda: ["*"])
    database_url: str = "sqlite:///./saarathi.db"
    environment: str = "development"


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    return Settings()
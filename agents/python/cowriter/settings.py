from __future__ import annotations

from functools import lru_cache
from pydantic import BaseSettings


class Settings(BaseSettings):
    livekit_url: str
    livekit_api_key: str
    livekit_api_secret: str

    openai_api_key: str | None = None
    gemini_api_key: str | None = None

    elevenlabs_api_key: str | None = None
    elevenlabs_voice_id: str | None = None

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        env_prefix = ""  # keep raw names


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    return Settings()  # type: ignore[arg-type]


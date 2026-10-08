from pathlib import Path
from pydantic_settings import BaseSettings


BACKEND_DIR = Path(__file__).resolve().parent.parent.parent
PROJECT_ROOT = BACKEND_DIR.parent

import os

class Settings(BaseSettings):
    FLOOD_MODEL_PATH: str = os.getenv(
        "FLOOD_MODEL_PATH",
        str(PROJECT_ROOT / "AI" / "models" / "github_best.pt")
    )
    # OpenWeather API key — MUST be set in backend/.env; never forwarded to frontend
    OPENWEATHER_API_KEY: str = ""

    # Gemini configuration
    GEMINI_API_KEY: str = ""
    GEMINI_MODEL: str = "gemini-3.8-flash"
    GEMINI_FALLBACK_MODELS: str = "gemini-3.7-flash,gemini-3.6-flash,gemini-3.5-flash-lite"
    GEMINI_MAX_RETRIES: int = 3
    GEMINI_RETRY_BASE_SECONDS: float = 1.0

    @property
    def gemini_fallback_models_list(self) -> list[str]:
        return [m.strip() for m in self.GEMINI_FALLBACK_MODELS.split(",") if m.strip()]

    # Agent configuration
    AGENT_RISK_SCORE_DELTA: int = 10
    AGENT_WATER_AREA_DELTA: float = 0.1
    AGENT_DETECTION_COUNT_DELTA: int = 2
    AGENT_CYCLE_INTERVAL_SECONDS: int = 60

    # Alert Phase 12 Config
    TWILIO_ACCOUNT_SID: str = ""
    TWILIO_AUTH_TOKEN: str = ""
    TWILIO_WHATSAPP_FROM: str = ""
    ALERT_WHATSAPP_TO: str = ""
    TWILIO_SMS_FROM: str = ""
    ALERT_SMS_TO: str = ""
    ALERT_PROVIDER: str = "twilio"

    # MongoDB Phase 9 Config
    MONGODB_URI: str = ""
    MONGODB_DATABASE: str = "disastra"
    MONGODB_ENABLED: bool = True

    class Config:
        env_file = str(BACKEND_DIR / ".env")
        env_file_encoding = "utf-8"
        extra = "ignore"


settings = Settings()


def validate_config() -> None:
    if not Path(settings.FLOOD_MODEL_PATH).exists():
        raise RuntimeError(
            f"Configuration Error: Model file not found at {settings.FLOOD_MODEL_PATH}"
        )
    if not settings.OPENWEATHER_API_KEY:
        print(
            "[config] WARNING: OPENWEATHER_API_KEY is not set. "
            "Weather monitoring will return errors until the key is added to backend/.env"
        )

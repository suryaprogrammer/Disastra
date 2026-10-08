import os
import time
import random
from datetime import datetime
from google import genai
from google.genai import types
from google.genai.errors import APIError
from app.core.config import settings
from app.schemas.ai import (
    AIRequestPayload,
    CombinedAIResponse,
    SituationReport,
    ResponseRecommendation,
)

SYSTEM_INSTRUCTION = """You are the Disaster Intelligence Reasoning Layer for DISASTRA.

You do not detect disasters yourself.
You do not calculate the authoritative risk score.
You do not override verified model results.
You do not invent unavailable information.

Use only the supplied Flood Detection, Risk & Severity, and Weather facts.

Explain the observed situation.
Summarize supported threats.
Explain the meaning of the current risk level.
Generate practical response recommendations.

Never claim an action was executed unless the input explicitly says it was executed.
Clearly disclose unavailable information.
This system provides decision support and does not autonomously execute emergency actions."""

class GeminiService:
    def __init__(self):
        # We handle missing keys gracefully at the generation step rather than failing to instantiate
        self.api_key = settings.GEMINI_API_KEY or os.environ.get("GEMINI_API_KEY")
        self.model_name = settings.GEMINI_MODEL
        self.client = None
        if self.api_key:
            try:
                self.client = genai.Client(api_key=self.api_key)
            except Exception as e:
                print(f"Failed to initialize Gemini Client: {e}")

    def generate_brief(self, payload: AIRequestPayload) -> CombinedAIResponse:
        if not self.client:
            raise ValueError("GEMINI_API_KEY is missing or invalid.")

        # Construct Context Strings
        flood_str = "Unavailable"
        if payload.flood:
            flood_str = (
                f"Water Detected: {payload.flood.water_detected}\n"
                f"Detection Count: {payload.flood.detection_count}\n"
                f"Maximum Confidence: {payload.flood.maximum_confidence}\n"
                f"Water Area Ratio: {payload.flood.water_area_ratio}\n"
                f"Timestamp: {payload.flood.analysis_timestamp}"
            )

        risk_str = "Unavailable"
        if payload.risk:
            risk_str = (
                f"Risk Score: {payload.risk.risk_score}\n"
                f"Risk Level: {payload.risk.risk_level}"
            )

        weather_str = payload.weather_status if payload.weather_status else "Unavailable"
        if payload.weather:
            weather_str = (
                f"Location: {payload.weather.location}\n"
                f"Temperature: {payload.weather.temperature}°C\n"
                f"Condition: {payload.weather.condition} ({payload.weather.description})\n"
                f"Wind: {payload.weather.wind_speed} m/s\n"
                f"Humidity: {payload.weather.humidity}%\n"
                f"Observed At: {payload.weather.observed_at}"
            )
            if not payload.weather.temperature:
                weather_str = "Weather context is unavailable. Do not infer current weather."

        user_prompt = (
            f"FLOOD CONTEXT:\n{flood_str}\n\n"
            f"RISK CONTEXT:\n{risk_str}\n\n"
            f"WEATHER CONTEXT:\n{weather_str}\n\n"
            "Please generate the Situation Report and Response Recommendation based strictly on these facts."
        )

        models_to_try = [self.model_name]
        for fallback in settings.gemini_fallback_models_list:
            if fallback not in models_to_try:
                models_to_try.append(fallback)

        max_retries = settings.GEMINI_MAX_RETRIES
        last_error_category = "UNKNOWN"
        last_error_msg = ""

        for model in models_to_try:
            for attempt in range(1, max_retries + 2):
                try:
                    response = self.client.models.generate_content(
                        model=model,
                        contents=user_prompt,
                        config=types.GenerateContentConfig(
                            system_instruction=SYSTEM_INSTRUCTION,
                            response_mime_type="application/json",
                            response_schema=CombinedAIResponse,
                        ),
                    )
                    
                    result = CombinedAIResponse.model_validate_json(response.text)
                    result.status = "SUCCESS"
                    result.model = model
                    result.generated_at = datetime.utcnow().isoformat()
                    return result
                
                except Exception as e:
                    err_str = str(e)
                    last_error_msg = err_str
                    
                    if "401" in err_str or "403" in err_str or "API_KEY" in err_str or "auth" in err_str.lower() or "permission denied" in err_str.lower():
                        last_error_category = "AUTHENTICATION_ERROR"
                    elif "400" in err_str and "schema" in err_str.lower():
                        last_error_category = "SCHEMA_ERROR"
                    elif "429" in err_str or "RATE_LIMIT" in err_str:
                        last_error_category = "RATE_LIMIT"
                    elif "503" in err_str or "UNAVAILABLE" in err_str.upper() or "unavailable" in err_str.lower():
                        last_error_category = "UPSTREAM_503"
                    elif "404" in err_str or "NOT_FOUND" in err_str:
                        last_error_category = "MODEL_NOT_AVAILABLE"
                    elif "timeout" in err_str.lower() or "deadline" in err_str.lower():
                        last_error_category = "TIMEOUT"
                    elif "protocol" in err_str.lower() or "disconnect" in err_str.lower() or "connection" in err_str.lower():
                        last_error_category = "NETWORK_ERROR"
                    else:
                        last_error_category = "UNKNOWN"

                    print(f"Gemini API Error [{model}] attempt {attempt}: {err_str} (Category: {last_error_category})")

                    if last_error_category in ["UPSTREAM_503", "RATE_LIMIT", "TIMEOUT", "NETWORK_ERROR", "UNKNOWN"]:
                        if attempt <= max_retries:
                            delay = settings.GEMINI_RETRY_BASE_SECONDS * (2 ** (attempt - 1)) + random.uniform(0, 0.5)
                            print(f"Retrying in {delay:.2f} seconds...")
                            time.sleep(delay)
                        else:
                            break
                    else:
                        break
            
            if last_error_category in ["AUTHENTICATION_ERROR", "SCHEMA_ERROR"]:
                raise ValueError(f"Fatal error: {last_error_category} - {last_error_msg}")

        raise ValueError(f"AI_UNAVAILABLE: {last_error_category} - {last_error_msg}")

gemini_service = GeminiService()

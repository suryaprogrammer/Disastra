from fastapi import APIRouter, HTTPException, Query

from app.schemas.weather import WeatherResponse
from app.services import weather_service

router = APIRouter()


@router.get("/weather", response_model=WeatherResponse, summary="Get current weather")
async def get_weather(
    lat: float = Query(
        ...,
        ge=-90.0,
        le=90.0,
        description="Latitude of the monitored location",
    ),
    lon: float = Query(
        ...,
        ge=-180.0,
        le=180.0,
        description="Longitude of the monitored location",
    ),
) -> WeatherResponse:
    """
    Retrieve current weather conditions for the specified coordinates.

    Fetches live data from OpenWeather's current weather API (units: metric).
    The OpenWeather API key is stored in the backend environment and is never
    forwarded to the browser.
    """
    try:
        weather_result = await weather_service.get_weather(lat, lon)
        
        # Async MongoDB Persistence
        import asyncio
        from app.repositories.weather_repository import weather_repository
        from app.repositories.audit_repository import audit_repository
        
        doc = weather_result.model_dump()
        asyncio.create_task(weather_repository.insert(doc))
        asyncio.create_task(audit_repository.insert_event(
            event_type="WEATHER_FETCHED",
            details={"lat": lat, "lon": lon, "condition": doc.get("condition")}
        ))
        
        return weather_result
    except ValueError as exc:
        # Known application-level errors: bad key, rate limit, not found, etc.
        raise HTTPException(status_code=400, detail=str(exc))
    except Exception as exc:
        # Unexpected errors — log server-side, return opaque 503
        print(f"[weather] Unhandled error for ({lat}, {lon}): {exc}")
        raise HTTPException(
            status_code=503,
            detail="Weather service temporarily unavailable. Try again later.",
        )

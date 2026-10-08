"""
Weather Service — OpenWeather Integration

Fetches current weather from OpenWeather's /data/2.5/weather endpoint
using coordinate-based queries. The API key is read from the backend
environment and is never exposed to the browser.
"""

from datetime import datetime, timezone
from typing import Optional

import httpx

from app.core.config import settings
from app.schemas.weather import WeatherLocation, WeatherMetrics, WeatherResponse

_OPENWEATHER_URL = "https://api.openweathermap.org/data/2.5/weather"

# 16-point compass rose, each segment is 22.5 degrees
_COMPASS = [
    "N", "NNE", "NE", "ENE",
    "E", "ESE", "SE", "SSE",
    "S", "SSW", "SW", "WSW",
    "W", "WNW", "NW", "NNW",
]


def _degrees_to_compass(deg: int) -> str:
    """Convert a wind bearing in degrees to the nearest compass label."""
    index = round(deg / 22.5) % 16
    return _COMPASS[index]


async def get_weather(lat: float, lon: float) -> WeatherResponse:
    """
    Fetch real-time weather for the given coordinates.

    Raises:
        ValueError: On invalid API key, rate-limit, missing config, or
                    any other application-level error.
        httpx.TimeoutException: On network timeout.
    """
    api_key = settings.OPENWEATHER_API_KEY
    if not api_key:
        raise ValueError(
            "OPENWEATHER_API_KEY is not configured. "
            "Add it to backend/.env to enable live weather."
        )

    params = {
        "lat": lat,
        "lon": lon,
        "appid": api_key,
        "units": "metric",
    }

    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.get(_OPENWEATHER_URL, params=params)
    except httpx.TimeoutException:
        raise ValueError("OpenWeather request timed out. Try again shortly.")
    except httpx.RequestError as exc:
        raise ValueError(f"Network error contacting weather service: {type(exc).__name__}")

    # Map common HTTP errors to useful messages without exposing internals
    if resp.status_code == 401:
        raise ValueError("Invalid or missing OpenWeather API key (HTTP 401).")
    if resp.status_code == 404:
        raise ValueError("Weather data not found for the requested coordinates (HTTP 404).")
    if resp.status_code == 429:
        raise ValueError("OpenWeather API rate limit reached. Try again later (HTTP 429).")
    if not resp.is_success:
        raise ValueError(f"OpenWeather API returned an error (HTTP {resp.status_code}).")

    try:
        data = resp.json()
    except Exception:
        raise ValueError("Received malformed response from weather service.")

    # ── Parse fields ──────────────────────────────────────────────────────────
    main = data.get("main", {})
    wind = data.get("wind", {})
    clouds = data.get("clouds", {})
    sys_info = data.get("sys", {})
    coord = data.get("coord", {})
    conditions = data.get("weather", [{}])

    # Wind: OpenWeather returns m/s, convert to km/h
    wind_speed_ms: float = wind.get("speed", 0.0)
    wind_gust_ms: Optional[float] = wind.get("gust")
    wind_deg: int = int(wind.get("deg", 0))

    # Visibility: metres → km (OpenWeather caps at 10,000 m)
    visibility_m: int = data.get("visibility", 10000)
    visibility_km = round(visibility_m / 1000.0, 1)

    # Precipitation 1h — only present when it's actually raining
    rain = data.get("rain", {})
    precip_1h: Optional[float] = rain.get("1h") if rain else None

    # Observed timestamp from the station observation time (Unix UTC)
    dt: int = data.get("dt", 0)
    observed_at = datetime.fromtimestamp(dt, tz=timezone.utc).isoformat()

    return WeatherResponse(
        location=WeatherLocation(
            name=data.get("name", "Unknown"),
            country=sys_info.get("country", ""),
            latitude=float(coord.get("lat", lat)),
            longitude=float(coord.get("lon", lon)),
        ),
        weather=WeatherMetrics(
            temperature_c=round(float(main.get("temp", 0)), 1),
            feels_like_c=round(float(main.get("feels_like", 0)), 1),
            humidity_percent=int(main.get("humidity", 0)),
            pressure_hpa=int(main.get("pressure", 0)),
            visibility_km=visibility_km,
            wind_speed_kmh=round(wind_speed_ms * 3.6, 1),
            wind_direction_deg=wind_deg,
            wind_direction_label=_degrees_to_compass(wind_deg),
            cloud_cover_percent=int(clouds.get("all", 0)),
            condition=conditions[0].get("main", ""),
            description=conditions[0].get("description", "").title(),
            wind_gust_kmh=round(wind_gust_ms * 3.6, 1) if wind_gust_ms is not None else None,
            precipitation_1h_mm=round(float(precip_1h), 1) if precip_1h is not None else None,
        ),
        observed_at=observed_at,
        source="OpenWeather",
        mode="LIVE",
    )

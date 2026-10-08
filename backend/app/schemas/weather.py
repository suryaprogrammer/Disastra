from typing import Optional
from pydantic import BaseModel


class WeatherLocation(BaseModel):
    name: str
    country: str
    latitude: float
    longitude: float


class WeatherMetrics(BaseModel):
    temperature_c: float
    feels_like_c: float
    humidity_percent: int
    pressure_hpa: int
    visibility_km: float
    wind_speed_kmh: float
    wind_direction_deg: int
    wind_direction_label: str
    cloud_cover_percent: int
    condition: str
    description: str
    wind_gust_kmh: Optional[float] = None
    precipitation_1h_mm: Optional[float] = None


class WeatherResponse(BaseModel):
    location: WeatherLocation
    weather: WeatherMetrics
    observed_at: str
    source: str = "OpenWeather"
    mode: str = "LIVE"

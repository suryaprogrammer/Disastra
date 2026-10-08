from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

class FloodContext(BaseModel):
    water_detected: bool
    detection_count: int
    maximum_confidence: float
    water_area_ratio: Optional[float]
    analysis_timestamp: str

class RiskContext(BaseModel):
    risk_score: int
    risk_level: str

class WeatherContext(BaseModel):
    location: Optional[str]
    temperature: Optional[float]
    feels_like: Optional[float]
    humidity: Optional[int]
    pressure: Optional[int]
    visibility: Optional[int]
    wind_speed: Optional[float]
    wind_direction: Optional[int]
    cloud_cover: Optional[int]
    condition: Optional[str]
    description: Optional[str]
    observed_at: Optional[str]
    precipitation_1h_mm: Optional[float] = None

class AIRequestPayload(BaseModel):
    observation_id: Optional[str] = None  # Links AI brief to a specific disaster observation
    flood: Optional[FloodContext] = None
    risk: Optional[RiskContext] = None
    weather: Optional[WeatherContext] = None
    weather_status: Optional[str] = None

class SituationReport(BaseModel):
    headline: str
    situation_summary: str
    critical_threats: List[str]
    key_observations: List[str]
    risk_context: str
    confidence_note: str
    data_limitations: List[str]

class RecommendationItem(BaseModel):
    priority: int
    action: str
    reason: str

class ResponseRecommendation(BaseModel):
    priority: str
    immediate_action: str
    recommended_actions: List[RecommendationItem]
    monitoring_actions: List[str]

class CombinedAIResponse(BaseModel):
    status: str
    situation_report: Optional[SituationReport] = None
    response_recommendation: Optional[ResponseRecommendation] = None
    model: str
    generated_at: str

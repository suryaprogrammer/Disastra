from typing import Optional, List
from pydantic import BaseModel
from app.schemas.flood import FloodAnalysisResponse

class RiskAssessment(BaseModel):
    risk_level: str
    risk_score: int
    water_detected: bool

class RiskEvidence(BaseModel):
    detection_count: int
    maximum_confidence: float
    average_confidence: float
    water_area_ratio: Optional[float] = None

class RiskMethod(BaseModel):
    type: str = "deterministic_rule_engine"
    version: str = "1.0"

class RiskAnalysisResponse(BaseModel):
    risk_assessment: RiskAssessment
    evidence: RiskEvidence
    explanation: List[str]
    method: RiskMethod = RiskMethod()

class DisasterAnalysisResponse(BaseModel):
    observation_id: str  # Unique ID for this disaster observation event
    flood_model: FloodAnalysisResponse
    risk_assessment: RiskAnalysisResponse

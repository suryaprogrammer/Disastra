from typing import Dict, List, Optional
from pydantic import BaseModel

class BoundingBox(BaseModel):
    x1: float
    y1: float
    x2: float
    y2: float

class Detection(BaseModel):
    class_id: int
    class_name: str
    confidence: float
    box: BoundingBox
    mask_present: bool = False
    mask_area_ratio: Optional[float] = None

class ModelInfo(BaseModel):
    name: str
    task: str
    classes: Dict[int, str]

class ImageInfo(BaseModel):
    filename: str

class AnalysisSummary(BaseModel):
    water_detected: bool
    detection_count: int

class FloodAnalysisResponse(BaseModel):
    success: bool
    model: ModelInfo
    image: ImageInfo
    analysis: AnalysisSummary
    detections: List[Detection]

class HealthModelInfo(BaseModel):
    loaded: bool
    task: str
    classes: Dict[int, str]

class HealthResponse(BaseModel):
    status: str
    service: str
    flood_model: HealthModelInfo

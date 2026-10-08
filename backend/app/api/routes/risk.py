from fastapi import APIRouter, UploadFile, File, HTTPException
import uuid
from app.schemas.risk import RiskAnalysisResponse, DisasterAnalysisResponse
from app.services.flood_service import flood_service
from app.services.risk_service import risk_service
from app.services.runtime_state import runtime_state

router = APIRouter()

SUPPORTED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"]
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB

@router.post("/analyze/risk", response_model=RiskAnalysisResponse)
async def analyze_risk(file: UploadFile = File(...)):
    if file.content_type not in SUPPORTED_TYPES:
        raise HTTPException(status_code=415, detail=f"Unsupported file type: {file.content_type}")
    
    image_bytes = await file.read()
    if len(image_bytes) > MAX_FILE_SIZE:
        raise HTTPException(status_code=413, detail="File too large. Max size is 10MB.")
    
    if len(image_bytes) == 0:
        raise HTTPException(status_code=400, detail="Empty file")

    try:
        flood_result = flood_service.analyze_image(image_bytes, file.filename)
        risk_result = risk_service.calculate_risk(flood_result)
        return risk_result
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        print(f"Risk inference error: {e}")
        raise HTTPException(status_code=500, detail="Internal risk analysis error")

@router.post("/analyze/disaster", response_model=DisasterAnalysisResponse)
async def analyze_disaster(file: UploadFile = File(...)):
    if file.content_type not in SUPPORTED_TYPES:
        raise HTTPException(status_code=415, detail=f"Unsupported file type: {file.content_type}")
    
    image_bytes = await file.read()
    if len(image_bytes) > MAX_FILE_SIZE:
        raise HTTPException(status_code=413, detail="File too large. Max size is 10MB.")
    
    if len(image_bytes) == 0:
        raise HTTPException(status_code=400, detail="Empty file")

    try:
        from app.schemas.risk import RiskAnalysisResponse
        from app.schemas.flood import FloodAnalysisResponse
        
        flood_dict = flood_service.analyze_image(image_bytes, file.filename)
        risk_dict = risk_service.calculate_risk(flood_dict)
        
        # Parse into validated Pydantic models
        flood_model = FloodAnalysisResponse.model_validate(flood_dict)
        risk_model = RiskAnalysisResponse.model_validate(risk_dict)
        
        # Create a unique observation_id for this event
        observation_id = f"obs-{uuid.uuid4()}"
        
        # Save to runtime state using model_dump for consistent nested access
        runtime_state.update_disaster_observation(
            observation_id=observation_id,
            source="Manual YOLO Analysis (POST /api/analyze/disaster)",
            analysis_result={
                "flood_model": flood_model.model_dump(),
                "risk_assessment": risk_model.model_dump()
            }
        )
        
        # Async MongoDB Persistence
        import asyncio
        from app.repositories.disaster_repository import disaster_repository
        from app.repositories.audit_repository import audit_repository
        from datetime import datetime
        
        doc = {
            "observation_id": observation_id,
            "observation_created_at": datetime.utcnow().isoformat() + "Z",
            "observation_source": "Manual YOLO Analysis (POST /api/analyze/disaster)",
            "risk_score": risk_model.risk_assessment.risk_score,
            "risk_level": risk_model.risk_assessment.risk_level,
            "detection_count": risk_model.evidence.detection_count,
            "maximum_confidence": risk_model.evidence.maximum_confidence,
            "water_area_ratio": risk_model.evidence.water_area_ratio,
            "flood_analysis": flood_model.model_dump(),
            "created_at": datetime.utcnow().isoformat() + "Z"
        }
        
        asyncio.create_task(disaster_repository.insert(doc))
        asyncio.create_task(audit_repository.insert_event(
            event_type="DISASTER_ANALYZED",
            details={"risk_level": risk_model.risk_assessment.risk_level, "risk_score": risk_model.risk_assessment.risk_score},
            observation_id=observation_id
        ))
        
        return DisasterAnalysisResponse(
            observation_id=observation_id,
            flood_model=flood_model,
            risk_assessment=risk_model
        )
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        print(f"Disaster inference error: {e}")
        raise HTTPException(status_code=500, detail="Internal disaster analysis error")

@router.get("/incidents")
async def get_incidents():
    from app.services.mongodb_service import mongodb_service
    from app.repositories.disaster_repository import disaster_repository
    
    if mongodb_service.is_connected:
        docs = await disaster_repository.get_all()
        return docs
    return []

@router.get("/incidents/{observation_id}")
async def get_incident(observation_id: str):
    from app.services.mongodb_service import mongodb_service
    from app.repositories.disaster_repository import disaster_repository
    
    if mongodb_service.is_connected:
        doc = await disaster_repository.get_by_observation_id(observation_id)
        if doc:
            return doc
    raise HTTPException(status_code=404, detail="Incident not found or storage unavailable")

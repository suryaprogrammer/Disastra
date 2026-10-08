from fastapi import APIRouter
from app.schemas.flood import HealthResponse
from app.services.flood_service import flood_service

router = APIRouter()

@router.get("/health", response_model=HealthResponse)
def health_check():
    return {
        "status": "ok",
        "service": "Disastra Backend",
        "flood_model": {
            "loaded": True,
            "task": flood_service.task,
            "classes": flood_service.classes
        }
    }

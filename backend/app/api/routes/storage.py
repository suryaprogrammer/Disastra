from fastapi import APIRouter
from datetime import datetime
from app.services.mongodb_service import mongodb_service

router = APIRouter()

@router.get("/status")
def get_storage_status():
    return {
        "database": "mongodb_atlas",
        "connected": mongodb_service.is_connected,
        "mode": "durable" if mongodb_service.is_connected else "runtime_degraded",
        "last_error": mongodb_service.last_error,
        "checked_at": datetime.utcnow().isoformat() + "Z"
    }

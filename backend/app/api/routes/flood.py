from fastapi import APIRouter, UploadFile, File, HTTPException
from app.schemas.flood import FloodAnalysisResponse
from app.services.flood_service import flood_service

router = APIRouter()

SUPPORTED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"]
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB

@router.post("/analyze/flood", response_model=FloodAnalysisResponse)
async def analyze_flood(file: UploadFile = File(...)):
    if file.content_type not in SUPPORTED_TYPES:
        raise HTTPException(status_code=415, detail=f"Unsupported file type: {file.content_type}")
    
    image_bytes = await file.read()
    if len(image_bytes) > MAX_FILE_SIZE:
        raise HTTPException(status_code=413, detail="File too large. Max size is 10MB.")
    
    if len(image_bytes) == 0:
        raise HTTPException(status_code=400, detail="Empty file")

    try:
        result = flood_service.analyze_image(image_bytes, file.filename)
        return result
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        # Internal error handling without exposing stack trace
        print(f"Inference error: {e}")
        raise HTTPException(status_code=500, detail="Internal inference error")

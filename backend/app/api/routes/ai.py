from fastapi import APIRouter, HTTPException
from app.schemas.ai import AIRequestPayload, CombinedAIResponse
from app.services.gemini_service import gemini_service

router = APIRouter()

@router.post("/ai/brief", response_model=CombinedAIResponse)
async def generate_brief(payload: AIRequestPayload):
    try:
        import asyncio
        result = await asyncio.to_thread(gemini_service.generate_brief, payload)
        
        # Async MongoDB Persistence
        import asyncio
        from app.repositories.ai_repository import ai_repository
        from app.repositories.audit_repository import audit_repository
        import uuid
        
        report_id = f"rep-{uuid.uuid4()}"
        doc = {
            "report_id": report_id,
            "observation_id": payload.observation_id,
            "model": result.model,
            "generated_at": result.generated_at,
            "situation_report": result.situation_report.model_dump() if result.situation_report else None,
            "response_recommendation": result.response_recommendation.model_dump() if result.response_recommendation else None,
            "created_at": result.generated_at
        }
        asyncio.create_task(ai_repository.insert(doc))
        asyncio.create_task(audit_repository.insert_event(
            event_type="AI_REPORT_GENERATED",
            details={"model": result.model},
            observation_id=payload.observation_id,
            report_id=report_id
        ))
        
        return result
    except ValueError as ve:
        err_str = str(ve)
        print(f"AI brief generation ValueError: {err_str}")
        if "AI_UNAVAILABLE" in err_str:
            raise HTTPException(status_code=503, detail="AI service temporarily unavailable. Please retry.")
        else:
            raise HTTPException(status_code=503, detail="AI service temporarily unavailable due to an internal error.")
    except Exception as e:
        print(f"AI brief generation error: {e}")
        raise HTTPException(status_code=500, detail="Internal AI brief generation error")

@router.get("/ai/reports/{observation_id}")
async def get_ai_reports(observation_id: str):
    from app.services.mongodb_service import mongodb_service
    from app.repositories.ai_repository import ai_repository
    
    if mongodb_service.is_connected:
        collection = ai_repository._get_collection()
        if collection is not None:
            cursor = collection.find({"observation_id": observation_id}).sort("generated_at", -1)
            docs = await cursor.to_list(length=100)
            return [ai_repository._deserialize_from_bson(d) for d in docs]
    return []

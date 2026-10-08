from fastapi import APIRouter
from app.schemas.agent import AgentStatusResponse
from app.services.agent_service import agent_service

router = APIRouter()

@router.get("/agent/status", response_model=AgentStatusResponse)
async def get_agent_status():
    return AgentStatusResponse(
        status=agent_service.status,
        last_cycle=agent_service.state
    )

@router.post("/agent/start")
async def start_agent():
    from fastapi import HTTPException
    raise HTTPException(status_code=403, detail="Disabled for public demo")

@router.post("/agent/stop")
async def stop_agent():
    from fastapi import HTTPException
    raise HTTPException(status_code=403, detail="Disabled for public demo")

@router.post("/agent/cycle", response_model=AgentStatusResponse)
async def cycle_agent():
    await agent_service.cycle()
    return AgentStatusResponse(
        status=agent_service.status,
        last_cycle=agent_service.state
    )

@router.get("/agent/history")
async def get_agent_history():
    from app.services.mongodb_service import mongodb_service
    from app.repositories.agent_repository import agent_repository
    
    if mongodb_service.is_connected:
        docs = await agent_repository.get_all()
        return docs
    return []

from fastapi import APIRouter, HTTPException, Request, Form
from typing import List
from app.services.alert_registry import alert_registry
from app.schemas.alert import AlertRecord

router = APIRouter()

@router.get("/", response_model=List[AlertRecord])
async def get_alerts():
    """Returns all alerts, checking MongoDB first with fallback to in-memory."""
    from app.services.mongodb_service import mongodb_service
    from app.repositories.alert_repository import alert_repository
    
    if mongodb_service.is_connected:
        db_alerts = await alert_repository.get_all()
        # Only fallback if db is empty (or we could always merge)
        # Assuming DB has all history, return it
        if db_alerts:
            # Pydantic will validate dicts back to AlertRecord
            return db_alerts
            
    return alert_registry.get_all_alerts()

@router.get("/status")
def get_alerts_status():
    """Returns system status for alert integration."""
    return {"status": "active", "provider": "twilio"}

@router.post("/test")
def test_alert():
    raise HTTPException(status_code=403, detail="Disabled for public demo")
    """
    [TEST/DEMO] Manually trigger a test alert.
    Never used in real production flows.
    """
    from app.schemas.agent import AgentState
    import uuid
    from datetime import datetime
    
    # Create fake state for test
    state = AgentState(
        agent_cycle_id=f"test-{uuid.uuid4()}",
        started_at=datetime.utcnow().isoformat() + "Z"
    )
    state.observation_id = f"test-obs-{uuid.uuid4()}"
    state.current_risk_level = "CRITICAL"
    state.current_risk_score = 99
    state.current_water_area_ratio = 0.8
    state.current_detection_count = 10
    state.weather_status = "LIVE"
    state.weather_summary = "Simulated Severe Storm"
    
    # We pass None for payload since the registry doesn't currently use it for the message
    alert = alert_registry.create_alert_from_state(state, None)
    if not alert:
        raise HTTPException(status_code=500, detail="Failed to create test alert")
    
    alert.headline = "[DEMO] " + alert.headline
    return alert

@router.post("/webhook")
async def twilio_webhook(request: Request):
    """
    Webhook callback from Twilio to update delivery status.
    Uses Form data as Twilio sends application/x-www-form-urlencoded.
    """
    form = await request.form()
    message_sid = form.get("MessageSid")
    message_status = form.get("MessageStatus")
    
    if message_sid and message_status:
        alert_registry.update_delivery_status(message_sid, message_status)
        
    return {"status": "ok"}

from typing import List, Optional
from pydantic import BaseModel
from enum import Enum
from datetime import datetime

class AgentAction(str, Enum):
    NO_ACTION = "NO_ACTION"
    MONITOR = "MONITOR"
    REANALYZE = "REANALYZE"
    PREPARE_ALERT = "PREPARE_ALERT"

class AgentStatus(str, Enum):
    IDLE = "IDLE"
    RUNNING = "RUNNING"
    MONITORING = "MONITORING"
    ANALYZING = "ANALYZING"
    WAITING = "WAITING"
    ERROR = "ERROR"
    STOPPED = "STOPPED"

class AgentState(BaseModel):
    agent_cycle_id: str
    
    observation_id: Optional[str] = None
    observation_created_at: Optional[str] = None
    observation_source: Optional[str] = None
    
    previous_risk_score: Optional[int] = None
    current_risk_score: Optional[int] = None
    
    previous_risk_level: Optional[str] = None
    current_risk_level: Optional[str] = None
    
    previous_detection_count: Optional[int] = None
    current_detection_count: Optional[int] = None
    
    previous_water_area_ratio: Optional[float] = None
    current_water_area_ratio: Optional[float] = None
    
    weather_status: Optional[str] = None
    weather_summary: Optional[str] = None
    
    change_detected: bool = False
    change_reasons: List[str] = []
    
    recommended_agent_action: AgentAction = AgentAction.NO_ACTION
    
    last_gemini_summary: Optional[str] = None
    last_error: Optional[str] = None
    
    started_at: str
    completed_at: Optional[str] = None

class AgentStatusResponse(BaseModel):
    status: AgentStatus
    last_cycle: Optional[AgentState] = None

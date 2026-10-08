from enum import Enum
from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime

class AlertPriority(str, Enum):
    CRITICAL = "CRITICAL"
    HIGH = "HIGH"
    MODERATE = "MODERATE"
    LOW = "LOW"

class AlertChannel(str, Enum):
    WHATSAPP = "WHATSAPP"
    SMS = "SMS"

class AlertStatus(str, Enum):
    PREPARED = "PREPARED"
    QUEUED = "QUEUED"
    SENDING = "SENDING"
    SENT = "SENT"
    DELIVERED = "DELIVERED"
    FAILED = "FAILED"
    SKIPPED = "SKIPPED"

class AlertRecord(BaseModel):
    alert_id: str
    created_at: str
    observation_id: str
    escalation_level: Optional[str] = None # Added for duplication checks
    risk_score: Optional[int] = None
    risk_level: Optional[str] = None
    priority: AlertPriority
    headline: str
    message: str
    recommended_action: Optional[str] = None
    channels: List[AlertChannel]
    status: AlertStatus
    provider: str
    provider_message_id: Optional[str] = None
    error: Optional[str] = None
    sent_at: Optional[str] = None
    delivered_at: Optional[str] = None

import uuid
from datetime import datetime
from typing import Optional, Dict, Any
from pymongo.errors import PyMongoError
from app.services.mongodb_service import mongodb_service
from app.repositories.base_repository import BaseRepository

class AuditRepository(BaseRepository):
    def _get_collection(self):
        return mongodb_service.get_collection("audit_events")

    async def insert_event(self, event_type: str, details: Dict[str, Any], 
                           observation_id: Optional[str] = None,
                           agent_cycle_id: Optional[str] = None,
                           alert_id: Optional[str] = None,
                           report_id: Optional[str] = None) -> bool:
        collection = self._get_collection()
        if collection is None:
            return False
            
        payload = {
            "event_id": f"EVT-{uuid.uuid4().hex[:8].upper()}",
            "event_type": event_type,
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "observation_id": observation_id,
            "agent_cycle_id": agent_cycle_id,
            "alert_id": alert_id,
            "report_id": report_id,
            "details": details
        }
            
        try:
            bson_payload = self._serialize_to_bson(payload)
            await collection.insert_one(bson_payload)
            return True
        except PyMongoError as e:
            print(f"[AuditRepository] Insert failed: {e}")
            return False

audit_repository = AuditRepository()

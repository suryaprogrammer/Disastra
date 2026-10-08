from typing import Optional, List, Dict, Any
from pymongo.errors import PyMongoError
from app.services.mongodb_service import mongodb_service
from app.repositories.base_repository import BaseRepository

class AlertRepository(BaseRepository):
    def _get_collection(self):
        return mongodb_service.get_collection("alerts")

    async def insert(self, payload: dict) -> bool:
        collection = self._get_collection()
        if collection is None:
            return False
            
        try:
            bson_payload = self._serialize_to_bson(payload)
            # Use alert_id or observation_id + escalation_level to prevent duplicates
            await collection.update_one(
                {"alert_id": bson_payload.get("alert_id")},
                {"$setOnInsert": bson_payload},
                upsert=True
            )
            return True
        except PyMongoError as e:
            print(f"[AlertRepository] Insert failed: {e}")
            return False

    async def update_status(self, alert_id: str, updates: Dict[str, Any]) -> bool:
        collection = self._get_collection()
        if collection is None:
            return False
            
        try:
            bson_updates = self._serialize_to_bson(updates)
            await collection.update_one(
                {"alert_id": alert_id},
                {"$set": bson_updates}
            )
            return True
        except PyMongoError as e:
            print(f"[AlertRepository] Update failed: {e}")
            return False

    async def get_all(self, limit: int = 50) -> List[dict]:
        collection = self._get_collection()
        if collection is None:
            return []
            
        try:
            cursor = collection.find().sort("created_at", -1).limit(limit)
            docs = await cursor.to_list(length=limit)
            return [self._deserialize_from_bson(d) for d in docs]
        except PyMongoError as e:
            print(f"[AlertRepository] Query failed: {e}")
            return []

alert_repository = AlertRepository()

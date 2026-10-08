from typing import Optional, List
from pymongo.errors import PyMongoError
from app.services.mongodb_service import mongodb_service
from app.repositories.base_repository import BaseRepository

class AIRepository(BaseRepository):
    def _get_collection(self):
        return mongodb_service.get_collection("ai_reports")

    async def insert(self, payload: dict) -> bool:
        collection = self._get_collection()
        if collection is None:
            return False
            
        try:
            bson_payload = self._serialize_to_bson(payload)
            await collection.update_one(
                {"report_id": bson_payload.get("report_id")},
                {"$setOnInsert": bson_payload},
                upsert=True
            )
            return True
        except PyMongoError as e:
            print(f"[AIRepository] Insert failed: {e}")
            return False

ai_repository = AIRepository()

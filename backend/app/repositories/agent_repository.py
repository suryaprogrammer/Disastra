from typing import Optional, List
from pymongo.errors import PyMongoError
from app.services.mongodb_service import mongodb_service
from app.repositories.base_repository import BaseRepository

class AgentRepository(BaseRepository):
    def _get_collection(self):
        return mongodb_service.get_collection("agent_cycles")

    async def insert(self, payload: dict) -> bool:
        collection = self._get_collection()
        if collection is None:
            return False
            
        try:
            bson_payload = self._serialize_to_bson(payload)
            await collection.update_one(
                {"agent_cycle_id": bson_payload.get("agent_cycle_id")},
                {"$setOnInsert": bson_payload},
                upsert=True
            )
            return True
        except PyMongoError as e:
            print(f"[AgentRepository] Insert failed: {e}")
            return False

    async def get_all(self, limit: int = 50) -> List[dict]:
        collection = self._get_collection()
        if collection is None:
            return []
            
        try:
            cursor = collection.find().sort("started_at", -1).limit(limit)
            docs = await cursor.to_list(length=limit)
            return [self._deserialize_from_bson(doc) for doc in docs]
        except PyMongoError as e:
            print(f"[AgentRepository] get_all failed: {e}")
            return []

agent_repository = AgentRepository()

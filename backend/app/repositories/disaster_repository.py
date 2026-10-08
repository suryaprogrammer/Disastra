from typing import Optional, Dict, Any, List
from pymongo.errors import PyMongoError
from app.services.mongodb_service import mongodb_service
from app.repositories.base_repository import BaseRepository

class DisasterRepository(BaseRepository):
    def _get_collection(self):
        return mongodb_service.get_collection("disaster_incidents")

    async def insert(self, payload: dict) -> bool:
        collection = self._get_collection()
        if collection is None:
            return False
            
        try:
            bson_payload = self._serialize_to_bson(payload)
            # Create a unique logical identifier based on observation_id
            await collection.update_one(
                {"observation_id": bson_payload.get("observation_id")},
                {"$setOnInsert": bson_payload},
                upsert=True
            )
            return True
        except PyMongoError as e:
            print(f"[DisasterRepository] Insert failed: {e}")
            return False

    async def get_by_observation_id(self, observation_id: str) -> Optional[dict]:
        collection = self._get_collection()
        if collection is None:
            return None
            
        try:
            doc = await collection.find_one({"observation_id": observation_id})
            return self._deserialize_from_bson(doc) if doc else None
        except PyMongoError as e:
            print(f"[DisasterRepository] Query failed: {e}")
            return None

    async def get_all(self, limit: int = 50) -> List[dict]:
        collection = self._get_collection()
        if collection is None:
            return []
            
        try:
            cursor = collection.find().sort("created_at", -1).limit(limit)
            docs = await cursor.to_list(length=limit)
            return [self._deserialize_from_bson(d) for d in docs]
        except PyMongoError as e:
            print(f"[DisasterRepository] Query failed: {e}")
            return []

disaster_repository = DisasterRepository()

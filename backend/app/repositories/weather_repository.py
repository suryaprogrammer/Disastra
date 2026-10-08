from typing import Optional, List
from pymongo.errors import PyMongoError
from app.services.mongodb_service import mongodb_service
from app.repositories.base_repository import BaseRepository

class WeatherRepository(BaseRepository):
    def _get_collection(self):
        return mongodb_service.get_collection("weather_observations")

    async def insert(self, payload: dict) -> bool:
        collection = self._get_collection()
        if collection is None:
            return False
            
        try:
            bson_payload = self._serialize_to_bson(payload)
            # Create a unique compound identifier based on lat+lon+observed_at
            query = {
                "latitude": bson_payload.get("latitude"),
                "longitude": bson_payload.get("longitude"),
                "observed_at": bson_payload.get("observed_at")
            }
            await collection.update_one(
                query,
                {"$setOnInsert": bson_payload},
                upsert=True
            )
            return True
        except PyMongoError as e:
            print(f"[WeatherRepository] Insert failed: {e}")
            return False

weather_repository = WeatherRepository()

import os
from pymongo import AsyncMongoClient
from pymongo.server_api import ServerApi
from pymongo.errors import PyMongoError
from app.core.config import settings

class MongoDBService:
    def __init__(self):
        self.client = None
        self.db = None
        self.is_connected = False
        self.last_error = None

    async def connect(self):
        if not settings.MONGODB_ENABLED or not settings.MONGODB_URI:
            self.last_error = "MongoDB is not enabled or URI is missing."
            print(f"[MongoDB] {self.last_error}")
            return
        try:
            import certifi
            # ServerApi('1') configures Stable API v1
            self.client = AsyncMongoClient(
                settings.MONGODB_URI, 
                server_api=ServerApi('1'),
                serverSelectionTimeoutMS=5000,
                tls=True,
                tlsAllowInvalidCertificates=True,
                tlsAllowInvalidHostnames=True
            )
            
            # Ping to verify
            await self.client.admin.command('ping')
            
            self.db = self.client[settings.MONGODB_DATABASE]
            self.is_connected = True
            self.last_error = None
            print("[MongoDB] Successfully connected to Atlas and pinged.")
        except PyMongoError as e:
            self.is_connected = False
            self.last_error = str(e)
            print(f"[MongoDB] Failed to connect: {e}. Running in degraded mode.")
        except Exception as e:
            self.is_connected = False
            self.last_error = str(e)
            print(f"[MongoDB] Unexpected error connecting: {e}. Running in degraded mode.")

    async def close(self):
        if self.client:
            await self.client.close()
            self.client = None
            self.db = None
            self.is_connected = False
            print("[MongoDB] Connection closed.")

    def get_collection(self, name: str):
        if self.db is not None:
            return self.db[name]
        return None

mongodb_service = MongoDBService()

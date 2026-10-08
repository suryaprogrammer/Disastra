import asyncio
import sys
from pathlib import Path

backend_dir = Path(r"D:\Disastra\backend")
sys.path.append(str(backend_dir))

from app.core.config import settings
from app.services.mongodb_service import mongodb_service

async def check():
    await mongodb_service.connect()
    if not mongodb_service.is_connected:
        print("Not connected.")
        return
        
    db = mongodb_service.client[settings.MONGODB_DATABASE]
    
    collections = [
        "disaster_incidents",
        "weather_observations",
        "ai_reports",
        "agent_cycles",
        "alerts",
        "audit_events"
    ]
    
    print("Collection document counts:")
    for c in collections:
        count = await db[c].count_documents({})
        print(f"{c}: {count}")
        
    await mongodb_service.close()

if __name__ == "__main__":
    asyncio.run(check())

import asyncio
import sys
from pathlib import Path

# Add backend directory to path
backend_dir = Path(r"D:\Disastra\backend")
sys.path.append(str(backend_dir))

from app.core.config import settings
from app.services.mongodb_service import mongodb_service
from pymongo.errors import PyMongoError
from bson import ObjectId

async def verify_atlas():
    print("Connecting to MongoDB Atlas...")
    
    await mongodb_service.connect()
    
    if not mongodb_service.is_connected:
        print("FAIL: Failed to connect to MongoDB Atlas.")
        print("Error:", mongodb_service.last_error)
        await mongodb_service.close()
        sys.exit(1)
        
    print("PASS: Connected and Pinged Atlas successfully!")
    
    db = mongodb_service.client[settings.MONGODB_DATABASE]
    collection = db["test_verification"]
    
    test_doc = {
        "test_run": "Atlas Verification",
        "timestamp": "2026-10-08T17:22:00Z"
    }
    
    try:
        # Write
        print("Performing test write...")
        result = await collection.insert_one(test_doc)
        doc_id = result.inserted_id
        print(f"PASS: Write successful. Inserted ID: {doc_id}")
        
        # Read
        print("Performing test read...")
        fetched = await collection.find_one({"_id": doc_id})
        if fetched and fetched["test_run"] == "Atlas Verification":
            print("PASS: Read successful.")
        else:
            print("FAIL: Read verification failed.")
            sys.exit(1)
            
        # Clean up
        print("Cleaning up test document...")
        await collection.delete_one({"_id": doc_id})
        print("PASS: Cleanup successful.")
        
    except PyMongoError as e:
        print(f"FAIL: MongoDB operation error: {e}")
        await mongodb_service.close()
        sys.exit(1)
        
    await mongodb_service.close()
    print("\nOVERALL: PASS. Real Atlas write/read verified safely.")

if __name__ == "__main__":
    asyncio.run(verify_atlas())

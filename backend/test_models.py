import os
from google import genai
from google.genai import types
import time
from dotenv import load_dotenv

load_dotenv("D:/Disastra/backend/.env")
api_key = os.environ.get("GEMINI_API_KEY")

if not api_key:
    print("No GEMINI_API_KEY found.")
    exit(1)

client = genai.Client(api_key=api_key)

models = [
    "gemini-3.8-flash",
    "gemini-3.7-flash",
    "gemini-3.6-flash",
    "gemini-3.5-flash",
    "gemini-3.5-flash-lite",
    "gemini-1.5-flash",
]

for model in models:
    print(f"Testing model: {model}")
    try:
        start_time = time.time()
        response = client.models.generate_content(
            model=model,
            contents="Hello",
        )
        latency = time.time() - start_time
        print(f"[{model}] SUCCESS: latency={latency:.2f}s")
    except Exception as e:
        latency = time.time() - start_time
        print(f"[{model}] ERROR ({latency:.2f}s): {type(e).__name__} - {str(e)[:150]}")

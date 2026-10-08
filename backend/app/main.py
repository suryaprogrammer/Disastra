from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app.core.config import validate_config
from app.api.routes import health, flood, risk, weather, ai, agent, alerts, storage
from app.services.agent_service import agent_service
from app.services.mongodb_service import mongodb_service

# Validate config on startup
validate_config()

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    await mongodb_service.connect()
    yield
    # Shutdown
    agent_service.stop()
    await mongodb_service.close()

app = FastAPI(
    title="Disastra API",
    version="0.1.0",
    description="Disastra Backend with AI Model Inference",
    lifespan=lifespan
)

import os

# CORS configuration
FRONTEND_URL = os.environ.get("FRONTEND_URL", "").strip()
origins = [
    "http://localhost:3000",
    "http://localhost:5173",
    "http://localhost:8080",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:5173",
    "https://tender-melons-poke.loca.lt",
]
if FRONTEND_URL:
    origins.append(FRONTEND_URL)

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {
        "name": "Disastra API",
        "version": "0.1.0",
        "status": "running"
    }

app.include_router(health.router, prefix="/api", tags=["health"])
app.include_router(flood.router, prefix="/api", tags=["flood"])
app.include_router(risk.router, prefix="/api", tags=["risk"])
app.include_router(weather.router, prefix="/api", tags=["weather"])
app.include_router(ai.router, prefix="/api", tags=["ai"])
app.include_router(agent.router, prefix="/api", tags=["agent"])
app.include_router(alerts.router, prefix="/api/alerts", tags=["alerts"])
app.include_router(storage.router, prefix="/api/storage", tags=["storage"])

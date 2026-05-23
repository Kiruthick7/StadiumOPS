"""
Stadium Operations Platform — FastAPI backend entry point.
"""

import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import get_settings
from app.routers import status, simulate, ai

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(name)s — %(message)s")
logger = logging.getLogger(__name__)

settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("🏟  Stadium OPS backend starting up")
    logger.info(f"Environment: {settings.environment}")
    logger.info(f"AI available: {bool(settings.groq_api_key)}")
    yield
    logger.info("Stadium OPS backend shutting down")


app = FastAPI(
    title="Stadium OPS API",
    description="AI-assisted stadium operations platform for real-time crowd coordination",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(status.router)
app.include_router(simulate.router)
app.include_router(ai.router)


@app.get("/health")
async def health_check():
    return {"status": "ok", "service": "stadium-ops-api"}

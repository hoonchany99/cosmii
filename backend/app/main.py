import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings

logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    settings.books_dir.mkdir(parents=True, exist_ok=True)
    logger.info("Cosmii backend started")
    yield
    logger.info("Cosmii backend shutting down")


app = FastAPI(
    title=settings.app_name,
    description="Cosmii — Gamified book learning with cosmic vibes",
    version="0.2.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=r"http://localhost:\d+",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from app.api.admin import router as admin_router
from app.api.learning import router as learning_router
from app.api.chat import router as chat_router

app.include_router(admin_router, prefix="/admin", tags=["admin"])
app.include_router(learning_router, prefix="/api", tags=["learning"])
app.include_router(chat_router, prefix="/api/chat", tags=["chat"])


@app.get("/api/health")
async def health():
    return {"status": "ok", "app": settings.app_name}

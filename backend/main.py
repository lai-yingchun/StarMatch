from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import (
    CORS_ALLOW_ORIGINS,
    APP_NAME,
    APP_VERSION,
    APP_DESC,
)

import app.data_loader  # noqa: F401

from app.routers.recommend_router import router as rec_router
from app.routers.candidate_router import router as cand_router
from app.routers.explanation_router import router as explain_router
from app.routers.health_router import router as health_router

app = FastAPI(
    title=APP_NAME,
    description=APP_DESC,
    version=APP_VERSION,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ALLOW_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 掛上各 router
app.include_router(rec_router)
app.include_router(cand_router)
app.include_router(explain_router)
app.include_router(health_router)
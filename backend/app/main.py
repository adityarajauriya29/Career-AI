"""FastAPI entry point for AI-Powered Career Roadmap Platform."""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

from app.core.config import settings
from app.core.database import connect_to_mongo, close_mongo_connection

from app.api import (
    auth,
    profile,
    roles,
    roadmap,
    gap,
    resume,
    readiness,
    progress,
    chatbot,
    admin,
    projects,
    mock_interview,
)

limiter = Limiter(key_func=get_remote_address)

app = FastAPI(
    title="AI-Powered Career Roadmap & Skill Gap Intelligence Platform",
    version="1.0.0",
    description="B.Tech Major Project - Personalized career roadmaps powered by AI",
)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_ORIGIN, "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def startup_event():
    await connect_to_mongo()


@app.on_event("shutdown")
async def shutdown_event():
    await close_mongo_connection()


@app.get("/")
async def root():
    return {
        "status": "ok",
        "service": "Career Roadmap Platform API",
        "version": "1.0.0",
    }


@app.get("/health")
async def health():
    return {"status": "healthy"}


# Register routers
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(profile.router, prefix="/api/profile", tags=["Profile"])
app.include_router(roles.router, prefix="/api/roles", tags=["Career Roles"])
app.include_router(roadmap.router, prefix="/api/roadmap", tags=["Roadmap"])
app.include_router(gap.router, prefix="/api/gap", tags=["Skill Gap"])
app.include_router(resume.router, prefix="/api/resume", tags=["Resume"])
app.include_router(readiness.router, prefix="/api/readiness", tags=["Readiness"])
app.include_router(progress.router, prefix="/api/progress", tags=["Progress"])
app.include_router(chatbot.router, prefix="/api/chatbot", tags=["AI Chatbot"])
app.include_router(admin.router, prefix="/api/admin", tags=["Admin"])
app.include_router(projects.router, prefix="/api/projects", tags=["Project Recommender"])
app.include_router(mock_interview.router, prefix="/api/interview", tags=["Mock Interview"])
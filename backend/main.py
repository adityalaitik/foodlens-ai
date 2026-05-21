from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routers import analyze, ask, health

app = FastAPI(
    title="FoodLens AI",
    description="AI-powered food analysis API using Google Gemini Vision",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router)
app.include_router(analyze.router, prefix="/api")
app.include_router(ask.router, prefix="/api")

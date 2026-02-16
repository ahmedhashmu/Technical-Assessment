"""Main FastAPI application."""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import meetings, analysis, contacts
from app.core.config import settings

app = FastAPI(
    title="TruthOS Meeting Intelligence API",
    description="Contact-centric meeting analysis with AI-powered insights",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify exact origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(meetings.router)
app.include_router(analysis.router)
app.include_router(contacts.router)


@app.get("/")
def root():
    """Root endpoint."""
    return {
        "name": "TruthOS Meeting Intelligence API",
        "version": "1.0.0",
        "status": "operational"
    }


@app.get("/health")
def health_check():
    """Health check endpoint."""
    return {"status": "healthy"}

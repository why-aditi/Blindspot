import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers.audit import router as audit_router
from routers.score import router as score_router
from routers.explain import router as explain_router
from routers.correct import router as correct_router
from routers.nlp import router as nlp_router
from routers.monitor import router as monitor_router
from routers.samples import router as samples_router

app = FastAPI(
    title="Blindspot API",
    description="AI bias detection and fairness scoring platform",
    version="1.0.0"
)

# Configure CORS
allowed_origins = os.environ.get("ALLOWED_ORIGINS", "http://localhost:5173,http://localhost:3000,https://blindspot-zeta.vercel.app").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(audit_router)
app.include_router(score_router)
app.include_router(explain_router)
app.include_router(correct_router)
app.include_router(nlp_router)
app.include_router(monitor_router)
app.include_router(samples_router)


@app.get("/")
async def root():
    return {
        "message": "Blindspot API - AI Bias Detection Platform",
        "version": "1.0.0",
        "endpoints": {
            "audit": "/audit",
            "score": "/score",
            "explain": "/explain",
            "correct": "/correct",
            "nlp_scan": "/nlp-scan",
            "monitor": "/monitor",
        }
    }


@app.get("/health")
async def health_check():
    return {"status": "healthy"}


if __name__ == "__main__":
    import uvicorn
    # Use PORT environment variable for deployment platforms (Render, etc.)
    # Default to 8000 for local development
    port = int(os.environ.get("PORT", 8000))
    # Bind to 0.0.0.0 for deployment compatibility
    host = os.environ.get("HOST", "0.0.0.0")
    uvicorn.run("main:app", host=host, port=port)

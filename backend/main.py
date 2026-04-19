import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers.audit import router as audit_router
from routers.score import router as score_router

app = FastAPI(
    title="Blindspot API",
    description="AI bias detection and fairness scoring platform",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],  # Vite default ports
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(audit_router)
app.include_router(score_router)


@app.get("/")
async def root():
    return {
        "message": "Blindspot API - AI Bias Detection Platform",
        "version": "1.0.0",
        "endpoints": {
            "audit": "/audit",
            "score": "/score"
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
    # Bind to 0.0.0.0 for deployment, 127.0.0.1 for local
    host = os.environ.get("HOST", "127.0.0.1")
    uvicorn.run("main:app", host=host, port=port)

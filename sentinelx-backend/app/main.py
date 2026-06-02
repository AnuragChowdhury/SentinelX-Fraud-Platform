import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.logging import logger
from app.api.routes import router, streamer

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Scalable Anti-Fraud intelligence pipeline for multiplayer game security.",
    version="1.0.0"
)

# Enable CORS for frontend dashboard queries (typically from http://localhost:5173)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, lock this down
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routes
app.include_router(router, prefix=settings.API_V1_STR)

@app.on_event("startup")
async def startup_event():
    logger.info("Initializing SentinelX FastAPI Server...")
    
    # Spawn the heavy V2 ML training pipeline asynchronously in the background
    import asyncio
    from app.api.routes import initialize_pipeline_bg
    asyncio.create_task(initialize_pipeline_bg())
    
    # Start real-time background simulator
    await streamer.start_streaming()
    logger.info("SentinelX background streams successfully spawned.")

@app.on_event("shutdown")
def shutdown_event():
    logger.info("Shutting down SentinelX FastAPI Server...")
    streamer.stop_streaming()
    logger.info("SentinelX background streams terminated.")

if __name__ == "__main__":
    uvicorn.run("app.main:app", host=settings.HOST, port=settings.PORT, reload=True)

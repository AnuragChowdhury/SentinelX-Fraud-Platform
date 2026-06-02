import os

class Settings:
    PROJECT_NAME: str = "SentinelX: Multiplayer Fraud & Collusion Detection Platform"
    API_V1_STR: str = "/api/v1"
    
    # Server Configuration
    HOST: str = os.getenv("SENTINELX_HOST", "127.0.0.1")
    PORT: int = int(os.getenv("SENTINELX_PORT", "8000"))
    
    # Simulation Parameters
    # Dynamically scale down for fast cloud startup if RENDER or PORT env is present
    NUM_PLAYERS: int = int(os.getenv("SENTINELX_NUM_PLAYERS", "150" if ("RENDER" in os.environ or "PORT" in os.environ) else "1500"))
    FRAUD_RATIO: float = float(os.getenv("SENTINELX_FRAUD_RATIO", "0.08"))
    
    # Risk Scoring Weights
    WEIGHT_GRAPH: float = 0.35
    WEIGHT_BEHAVIORAL: float = 0.25
    WEIGHT_DEVICE: float = 0.20
    WEIGHT_TRANSACTION: float = 0.20
    
    # Thresholds
    RISK_THRESHOLD_MEDIUM: float = 0.30
    RISK_THRESHOLD_HIGH: float = 0.60
    RISK_THRESHOLD_CRITICAL: float = 0.85

settings = Settings()

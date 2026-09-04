from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.database.database import get_db
from app.schemas.health import HealthCheckResponse
import logging

router = APIRouter()
logger = logging.getLogger(__name__)

@router.get("/health", response_model=HealthCheckResponse)
def health_check(db: Session = Depends(get_db)):
    db_status = "unhealthy"
    try:
        db.execute(text("SELECT 1"))
        db_status = "healthy"
    except Exception as e:
        db_status = "unhealthy"
        logger.error(f"Database health check failed: {e}")

    # Mocking ML model check for now
    ml_status = "healthy" # could check os.path.exists("models/...")

    status = "healthy" if db_status == "healthy" and ml_status == "healthy" else "unhealthy"

    return HealthCheckResponse(
        status=status,
        api="healthy",
        database=db_status,
        ml_model=ml_status
    )

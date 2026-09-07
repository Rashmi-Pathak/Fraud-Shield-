from datetime import datetime
from typing import Any, Dict, List, Optional

from pydantic import BaseModel


class ComponentHealth(BaseModel):
    status: str
    detail: Optional[str] = None
    latency_ms: Optional[float] = None


class EventHealth(BaseModel):
    event_type: str
    message: str
    severity: str
    timestamp: Optional[datetime] = None


class ModelArtifactHealth(BaseModel):
    name: str
    path: str
    status: str
    load_latency_ms: Optional[float] = None
    error: Optional[str] = None


class StreamHealth(BaseModel):
    status: str
    running: bool
    paused: bool
    transactions_processed: int
    current_speed: Optional[float] = None
    current_mode: Optional[str] = None
    throughput_per_second: Optional[float] = None


class HealthCheckResponse(BaseModel):
    status: str
    api: str = "healthy"
    database: str
    ml_model: str = "unknown"
    checked_at: datetime
    api_response_time_ms: Optional[float] = None
    components: Dict[str, ComponentHealth]
    performance: Dict[str, Optional[float]]
    models: List[ModelArtifactHealth]
    database_details: Dict[str, Any]
    live_stream: StreamHealth
    recent_events: List[EventHealth]

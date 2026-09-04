from pydantic import BaseModel

class HealthCheckResponse(BaseModel):
    status: str
    api: str
    database: str
    ml_model: str

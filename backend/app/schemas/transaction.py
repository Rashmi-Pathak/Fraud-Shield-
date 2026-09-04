from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime

class TransactionBase(BaseModel):
    transaction_id: str
    customer_id: str
    card_id: str
    account_id: str
    event_time: datetime
    amount: float
    currency: str = "USD"
    transaction_type: str = "purchase"
    payment_channel: str = "online"
    merchant_id: str
    merchant_category: str
    country: str = "US"
    city: str = ""
    device_id: str = ""
    card_present: bool = False
    international_transaction: bool = False
    latitude: Optional[float] = None
    longitude: Optional[float] = None

class TransactionCreate(TransactionBase):
    pass

class FraudDetectionOut(BaseModel):
    fraud_category: str
    fraud_subcategory: Optional[str] = None
    severity: Optional[str] = None
    confidence: Optional[float] = None
    reason: Optional[str] = None

    class Config:
        from_attributes = True

class PredictionOut(BaseModel):
    risk_score: int
    risk_level: str
    recommended_action: str
    fraud_probability: float
    xgboost_probability: Optional[float] = None
    random_forest_probability: Optional[float] = None
    isolation_forest_score: Optional[float] = None
    rule_risk_score: Optional[int] = None
    
    class Config:
        from_attributes = True

class TransactionOut(TransactionBase):
    prediction: Optional[PredictionOut] = None
    class Config:
        from_attributes = True

class TransactionDetailOut(BaseModel):
    transaction: TransactionOut
    prediction: Optional[PredictionOut] = None
    detections: List[FraudDetectionOut] = []
    label: Optional[str] = None
    features: Optional[Dict[str, Any]] = None
    risk_factors: List[str] = []

class PaginatedTransactionsOut(BaseModel):
    items: List[TransactionOut]
    total: int
    page: int
    size: int
    pages: int

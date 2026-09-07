from datetime import datetime
from typing import Any, Dict, List, Optional

from pydantic import BaseModel


class ConfirmLabelRequest(BaseModel):
    is_fraud: bool


class FeedbackLabelOut(BaseModel):
    transaction_id: str
    is_fraud: bool
    label_status: str
    label_source: Optional[str] = None
    labeled_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class FeedbackDatasetItem(BaseModel):
    transaction_id: str
    transaction: Dict[str, Any]
    is_fraud: bool
    label_status: str
    label_source: Optional[str] = None
    labeled_at: Optional[datetime] = None


class FeedbackDatasetOut(BaseModel):
    items: List[FeedbackDatasetItem]
    total: int
    confirmed_fraud: int
    confirmed_legitimate: int


class LabelAuditOut(BaseModel):
    transaction_id: str
    label_source: str
    previous_status: str
    new_status: str
    timestamp: datetime

    class Config:
        from_attributes = True

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database.database import get_db
from app.database.models import Transaction, FraudLabel
from pydantic import BaseModel

router = APIRouter()

class DataSummaryResponse(BaseModel):
    total_transactions: int
    total_fraud: int
    total_legitimate: int
    fraud_percentage: float
    unique_customers: int
    unique_cards: int
    unique_devices: int
    unique_merchants: int

@router.get("/summary", response_model=DataSummaryResponse)
def get_data_summary(db: Session = Depends(get_db)):
    total_transactions = db.query(func.count(Transaction.transaction_id)).scalar() or 0
    
    total_fraud = db.query(func.count(FraudLabel.transaction_id)).filter(FraudLabel.is_fraud == True).scalar() or 0
    total_legitimate = db.query(func.count(FraudLabel.transaction_id)).filter(FraudLabel.is_fraud == False).scalar() or 0
    
    fraud_percentage = (total_fraud / (total_fraud + total_legitimate) * 100) if (total_fraud + total_legitimate) > 0 else 0.0

    unique_customers = db.query(func.count(func.distinct(Transaction.customer_id))).scalar() or 0
    unique_cards = db.query(func.count(func.distinct(Transaction.card_id))).scalar() or 0
    unique_devices = db.query(func.count(func.distinct(Transaction.device_id))).scalar() or 0
    unique_merchants = db.query(func.count(func.distinct(Transaction.merchant_id))).scalar() or 0

    return DataSummaryResponse(
        total_transactions=total_transactions,
        total_fraud=total_fraud,
        total_legitimate=total_legitimate,
        fraud_percentage=fraud_percentage,
        unique_customers=unique_customers,
        unique_cards=unique_cards,
        unique_devices=unique_devices,
        unique_merchants=unique_merchants
    )

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import Dict, Any

from app.database.database import get_db
from app.database.models import Transaction
from app.schemas.transaction import TransactionCreate
from app.ml.predict import PredictionService

router = APIRouter()

@router.post("", response_model=Dict[str, Any])
def predict_transaction(tx_in: TransactionCreate, db: Session = Depends(get_db)):
    """
    Dedicated prediction endpoint clearly separated from transaction browsing.
    Validates payload, runs feature engine, rules, ML models, risk engine,
    and saves prediction.
    """
    tx = db.query(Transaction).filter(Transaction.transaction_id == tx_in.transaction_id).first()
    if not tx:
        tx = Transaction(**tx_in.model_dump())
        db.add(tx)
        db.commit()
        db.refresh(tx)
        
    service = PredictionService(db)
    result = service.predict(tx)
    
    return result

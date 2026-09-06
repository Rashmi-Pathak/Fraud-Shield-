from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc, asc, func
from typing import Optional, List, Dict, Any
import math

from app.database.database import get_db
from app.database.models import Transaction, Prediction, FraudDetection, FraudLabel
from app.schemas.transaction import TransactionOut, TransactionDetailOut, PaginatedTransactionsOut, TransactionCreate
from app.ml.predict import PredictionService

router = APIRouter()

@router.get(""), response_model=PaginatedTransactionsOut)
def get_transactions(
    db: Session = Depends(get_db),
    page: int = Query(1, ge=1),
    size: int = Query(50, ge=1, le=1000),
    search: Optional[str] = None,
    risk_level: Optional[str] = None,
    fraud_label: Optional[str] = None,
    category: Optional[str] = None,
    merchant: Optional[str] = None,
    city: Optional[str] = None,
    device: Optional[str] = None,
    customer_id: Optional[str] = None,
    card_id: Optional[str] = None,
    min_amount: Optional[float] = None,
    max_amount: Optional[float] = None,
    sort_by: str = \"event_time\",
    sort_desc: bool = True
):
    query = db.query(Transaction)
    
    if risk_level:
        query = query.join(Prediction).filter(Prediction.risk_level == risk_level)
        
    if fraud_label:
        query = query.join(FraudLabel).filter(FraudLabel.label == fraud_label)
        
    if search:
        query = query.filter(
            (Transaction.transaction_id.ilike(f\"%{search}%\")) |
            (Transaction.customer_id.ilike(f\"%{search}%\")) |
            (Transaction.card_id.ilike(f\"%{search}%\"))
        )
        
    if category:
        query = query.filter(Transaction.merchant_category == category)
    if merchant:
        query = query.filter(Transaction.merchant_id == merchant)
    if city:
        query = query.filter(Transaction.city == city)
    if device:
        query = query.filter(Transaction.device_id == device)
    if customer_id:
        query = query.filter(Transaction.customer_id == customer_id)
    if card_id:
        query = query.filter(Transaction.card_id == card_id)
        
    if min_amount is not None:
        query = query.filter(Transaction.amount >= min_amount)
    if max_amount is not None:
        query = query.filter(Transaction.amount <= max_amount)
        
    sort_col = getattr(Transaction, sort_by, Transaction.event_time)
    if sort_desc:
        query = query.order_by(desc(sort_col))
    else:
        query = query.order_by(asc(sort_col))
        
    total = query.count()
    pages = math.ceil(total / size) if size > 0 else 0
    items = query.offset((page - 1) * size).limit(size).all()
    
    tx_ids = [item.transaction_id for item in items]
    preds = db.query(Prediction).filter(Prediction.transaction_id.in_(tx_ids)).all()
    pred_map = {p.transaction_id: p for p in preds}
    
    # We need to explicitly attach predictions so the Pydantic model picks it up
    out_items = []
    for item in items:
        # SQLAlchemy models can be somewhat read-only for new properties
        # We'll just set it on the python object, Pydantic from_attributes will see it
        setattr(item, 'prediction', pred_map.get(item.transaction_id))
        out_items.append(item)
    
    return {
        \"items\": out_items,
        \"total\": total,
        \"page\": page,
        \"size\": size,
        \"pages\": pages
    }

@router.get(\"/{transaction_id}\", response_model=TransactionDetailOut)
def get_transaction_detail(transaction_id: str, db: Session = Depends(get_db)):
    tx = db.query(Transaction).filter(Transaction.transaction_id == transaction_id).first()
    if not tx:
        raise HTTPException(status_code=404, detail=\"Transaction not found\")
        
    pred = db.query(Prediction).filter(Prediction.transaction_id == transaction_id).first()
    detections = db.query(FraudDetection).filter(FraudDetection.transaction_id == transaction_id).all()
    label_obj = db.query(FraudLabel).filter(FraudLabel.transaction_id == transaction_id).first()
    
    try:
        service = PredictionService(db)
        feat_result = service.feature_eng.compute_features(tx)
        features = feat_result[\"features\"]
        signals = feat_result[\"feature_metadata\"][\"signals\"]
    except Exception:
        features = {}
        signals = []
        
    risk_factors = list(signals)
    for det in detections:
        if det.reason and det.reason not in risk_factors:
            risk_factors.append(det.reason)

    setattr(tx, 'prediction', pred)

    return {
        \"transaction\": tx,
        \"prediction\": pred,
        \"detections\": detections,
        \"label\": label_obj.label if label_obj else None,
        \"features\": features,
        \"risk_factors\": risk_factors
    }

@router.post(\"/analyze\", response_model=Dict[str, Any])
def analyze_transaction(tx_in: TransactionCreate, db: Session = Depends(get_db)):
    tx = db.query(Transaction).filter(Transaction.transaction_id == tx_in.transaction_id).first()
    if not tx:
        tx = Transaction(**tx_in.model_dump())
        db.add(tx)
        db.commit()
        db.refresh(tx)
        
    service = PredictionService(db)
    result = service.predict(tx)
    return result

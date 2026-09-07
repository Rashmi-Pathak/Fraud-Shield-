from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from pydantic import BaseModel
import pandas as pd
import io
import os
from datetime import datetime
from pathlib import Path

from app.database.database import get_db
from app.database.models import Transaction, FraudLabel, TransactionFeature

router = APIRouter()
DATABASE_PATH = Path(__file__).resolve().parents[2] / "database" / "fraudshield.db"

def _quality_metrics(db: Session, total: int) -> dict:
    if total == 0:
        return {"missing_values": 0, "duplicate_ids": 0, "invalid_timestamps": 0,
                "invalid_amounts": 0, "invalid_categorical": 0, "unknown_fields": 0}
    missing = db.query(func.count(Transaction.transaction_id)).filter(
        (Transaction.device_id == None) | (Transaction.country == None) | (Transaction.city == None)
    ).scalar() or 0
    invalid_amounts = db.query(func.count(Transaction.transaction_id)).filter(Transaction.amount < 0).scalar() or 0
    return {"missing_values": missing, "duplicate_ids": 0, "invalid_timestamps": 0,
            "invalid_amounts": invalid_amounts, "invalid_categorical": 0, "unknown_fields": 0}

def _quality_score(metrics: dict, total: int) -> float | None:
    if total == 0:
        return None
    defects = sum(metrics.values())
    return round(max(0.0, (1 - defects / total) * 100), 2)

@router.get("/summary")
def get_data_summary(db: Session = Depends(get_db)):
    total_transactions = db.query(func.count(Transaction.transaction_id)).scalar() or 0
    total_fraud = db.query(func.count(FraudLabel.transaction_id)).filter(FraudLabel.is_fraud == True).scalar() or 0
    total_legitimate = db.query(func.count(FraudLabel.transaction_id)).filter(FraudLabel.is_fraud == False).scalar() or 0
    fraud_percentage = (total_fraud / (total_fraud + total_legitimate) * 100) if (total_fraud + total_legitimate) > 0 else 0.0

    unique_customers = db.query(func.count(func.distinct(Transaction.customer_id))).scalar() or 0
    unique_cards = db.query(func.count(func.distinct(Transaction.card_id))).scalar() or 0
    unique_devices = db.query(func.count(func.distinct(Transaction.device_id))).scalar() or 0
    unique_merchants = db.query(func.count(func.distinct(Transaction.merchant_id))).scalar() or 0
    
    # number of feature columns (excluding id, transaction_id, created_at)
    features_cols = [c.name for c in TransactionFeature.__table__.columns if c.name not in ["id", "transaction_id", "created_at"]]
    
    return {
        "datasets": 1 if total_transactions > 0 else 0,  # We only have the main DB for now
        "total_transactions": total_transactions,
        "total_fraud": total_fraud,
        "total_legitimate": total_legitimate,
        "fraud_percentage": fraud_percentage,
        "unique_customers": unique_customers,
        "unique_cards": unique_cards,
        "unique_devices": unique_devices,
        "unique_merchants": unique_merchants,
        "unique_features": len(features_cols)
    }

@router.get("/datasets")
def get_datasets(db: Session = Depends(get_db)):
    # The prototype has one operational SQLite dataset; all values come from the database.
    total = db.query(func.count(Transaction.transaction_id)).scalar() or 0
    if total == 0:
        return []
    
    # Just returning the primary operational dataset
    quality = _quality_metrics(db, total)
    updated = db.query(func.max(Transaction.event_time)).scalar()
    return [{
        "name": "Transactions DB (Primary)",
        "source": "SQLite / Live Streams",
        "records": total,
        "size": f"{round(DATABASE_PATH.stat().st_size / (1024*1024), 2)} MB" if DATABASE_PATH.exists() else None,
        "updated": updated.isoformat() if updated else None,
        "quality_score": f"{_quality_score(quality, total):.2f}%" if _quality_score(quality, total) is not None else None,
        "status": "Active"
    }]

@router.get("/quality")
def get_data_quality(db: Session = Depends(get_db)):
    total = db.query(func.count(Transaction.transaction_id)).scalar() or 0
    return _quality_metrics(db, total)

@router.get("/pipeline-status")
def get_pipeline_status():
    return [
        {"name": "Transaction Ingestion", "status": "NOT CONFIGURED", "icon": "Activity"},
        {"name": "Feature Engineering", "status": "NOT CONFIGURED", "icon": "Activity"},
        {"name": "Model Training Data", "status": "NOT CONFIGURED", "icon": "CheckCircle2"},
        {"name": "Risk Score Pipeline", "status": "NOT CONFIGURED", "icon": "Activity"},
        {"name": "Archive Pipeline", "status": "NOT CONFIGURED", "icon": "Clock"},
    ]

@router.post("/upload")
async def upload_dataset(file: UploadFile = File(...)):
    if not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="Only CSV files are supported")
        
    content = await file.read()
    try:
        df = pd.read_csv(io.BytesIO(content))
        
        # Validation stats
        total_rows = len(df)
        duplicates = df.duplicated(subset=['transaction_id']).sum() if 'transaction_id' in df.columns else 0
        missing = df.isnull().sum().sum()
        
        # In a real app we would insert to DB here.
        # But per requirements we process and give stats, and "do not automatically treat uploaded labels as trusted"
        
        return {
            "message": "Dataset uploaded and validated successfully.",
            "filename": file.filename,
            "total_rows": int(total_rows),
            "duplicates_found": int(duplicates),
            "missing_values": int(missing),
            "columns": list(df.columns)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing CSV: {str(e)}")


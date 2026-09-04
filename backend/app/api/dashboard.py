from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, text, desc
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional
from app.database.database import get_db
from app.database.models import (
    Transaction,
    Prediction,
    Alert,
    FraudDetection
)
from pydantic import BaseModel

router = APIRouter(prefix="/api/dashboard", tags=["Dashboard"])

@router.get("/summary")
def get_dashboard_summary(db: Session = Depends(get_db)):
    total_transactions = db.query(func.count(Transaction.transaction_id)).scalar() or 0
    fraud_transactions = db.query(func.count(Prediction.transaction_id)).filter(
        Prediction.risk_level.in_(["HIGH", "CRITICAL"])
    ).scalar() or 0
    
    legitimate_transactions = total_transactions - fraud_transactions
    fraud_rate = (fraud_transactions / total_transactions) * 100.0 if total_transactions > 0 else 0.0
    
    critical_alerts = db.query(func.count(Alert.id)).filter(
        Alert.severity == "CRITICAL", Alert.status == "OPEN"
    ).scalar() or 0
    
    total_val = db.query(func.sum(Transaction.amount)).scalar() or 0.0
    flagged_val = db.query(func.sum(Transaction.amount)).join(Prediction).filter(
        Prediction.risk_level.in_(["HIGH", "CRITICAL"])
    ).scalar() or 0.0
    
    return {
        "total_transactions": total_transactions,
        "fraud_transactions": fraud_transactions,
        "legitimate_transactions": legitimate_transactions,
        "fraud_rate": fraud_rate,
        "high_risk_transactions": fraud_transactions,
        "critical_alerts": critical_alerts,
        "total_transaction_value": total_val,
        "flagged_transaction_value": flagged_val
    }

@router.get("/transaction-trends")
def get_transaction_trends(db: Session = Depends(get_db), days: int = 30):
    query = text("""
        SELECT date(event_time) as dt, COUNT(*) as cnt 
        FROM transactions 
        WHERE event_time >= date('now', :days)
        GROUP BY dt
        ORDER BY dt ASC
    """)
    res = db.execute(query, {"days": f"-{days} days"}).fetchall()
    
    return {
        "labels": [r[0] for r in res],
        "data": [r[1] for r in res]
    }

@router.get("/fraud-trends")
def get_fraud_trends(db: Session = Depends(get_db), days: int = 30):
    query = text("""
        SELECT date(t.event_time) as dt, COUNT(*) as cnt 
        FROM transactions t
        JOIN predictions p ON t.transaction_id = p.transaction_id
        WHERE p.risk_level IN ('HIGH', 'CRITICAL') 
          AND t.event_time >= date('now', :days)
        GROUP BY dt
        ORDER BY dt ASC
    """)
    res = db.execute(query, {"days": f"-{days} days"}).fetchall()
    
    return {
        "labels": [r[0] for r in res],
        "data": [r[1] for r in res]
    }

@router.get("/risk-distribution")
def get_risk_distribution(db: Session = Depends(get_db)):
    res = db.execute(text("""
        SELECT risk_level, COUNT(*) 
        FROM predictions 
        GROUP BY risk_level
    """)).fetchall()
    
    dist = {"LOW": 0, "MEDIUM": 0, "HIGH": 0, "CRITICAL": 0}
    for r in res:
        level = (r[0] or "").upper()
        if "LOW" in level: dist["LOW"] += r[1]
        elif "MEDIUM" in level: dist["MEDIUM"] += r[1]
        elif "HIGH" in level: dist["HIGH"] += r[1]
        elif "CRITICAL" in level: dist["CRITICAL"] += r[1]
        elif level in dist: dist[level] += r[1]
        
    return dist

@router.get("/fraud-categories")
def get_fraud_categories(db: Session = Depends(get_db)):
    res = db.execute(text("""
        SELECT fraud_category, COUNT(*) 
        FROM fraud_detections 
        GROUP BY fraud_category
        ORDER BY COUNT(*) DESC
    """)).fetchall()
    
    return [{"category": r[0], "count": r[1]} for r in res]

@router.get("/recent-transactions")
def get_recent_transactions(db: Session = Depends(get_db), limit: int = 10):
    txs = db.query(Transaction).order_by(desc(Transaction.event_time)).limit(limit).all()
    
    result = []
    for t in txs:
        result.append({
            "transaction_id": t.transaction_id,
            "amount": t.amount,
            "merchant": t.merchant_category,
            "time": t.event_time.isoformat(),
            "risk_level": t.prediction.risk_level if t.prediction else "UNKNOWN",
            "risk_score": t.prediction.risk_score if t.prediction else 0
        })
    return result

@router.get("/recent-alerts")
def get_recent_alerts(db: Session = Depends(get_db), limit: int = 5):
    alerts = db.query(Alert).order_by(desc(Alert.created_at)).limit(limit).all()
    
    result = []
    for a in alerts:
        result.append({
            "id": a.id,
            "title": a.title,
            "severity": a.severity,
            "status": a.status,
            "time": a.created_at.isoformat()
        })
    return result

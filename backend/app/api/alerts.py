from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc, asc
from typing import Optional, List, Dict, Any
import math
from datetime import datetime

from app.database.database import get_db
from app.database.models import Alert, Transaction, Prediction, FraudDetection, FraudLabel, SystemEvent
from app.ml.predict import PredictionService
from pydantic import BaseModel

router = APIRouter()

class AlertSummaryOut(BaseModel):
    id: int
    transaction_id: str
    severity: str
    status: str
    title: str
    created_at: datetime
    customer_id: Optional[str] = None
    card_id: Optional[str] = None
    risk_score: Optional[int] = None
    amount: Optional[float] = None
    categories: List[str] = []
    
    class Config:
        from_attributes = True

class AlertPaginatedOut(BaseModel):
    items: List[AlertSummaryOut]
    total: int
    page: int
    size: int
    pages: int

@router.get("", response_model=AlertPaginatedOut)
def get_alerts(
    db: Session = Depends(get_db),
    page: int = Query(1, ge=1),
    size: int = Query(50, ge=1, le=1000),
    severity: Optional[str] = None,
    status: Optional[str] = None,
    search: Optional[str] = None,
    sort_desc: bool = True
):
    query = db.query(Alert)
    
    if severity and severity != "All Risk Levels":
        query = query.filter(Alert.severity == severity.upper())
            
    if status and status != "All Statuses":
        if status == "OPEN":
            query = query.filter(Alert.status.in_(["OPEN", "INVESTIGATING"]))
        else:
            query = query.filter(Alert.status == status.upper())
                
    if search:
        query = query.filter(Alert.transaction_id.ilike(f"%{search}%"))
        
    if sort_desc:
        query = query.order_by(desc(Alert.created_at))
    else:
        query = query.order_by(asc(Alert.created_at))
        
    total = query.count()
    pages = math.ceil(total / size) if size > 0 else 0
    items = query.offset((page - 1) * size).limit(size).all()
    
    tx_ids = [a.transaction_id for a in items]
    
    txs = db.query(Transaction).filter(Transaction.transaction_id.in_(tx_ids)).all()
    preds = db.query(Prediction).filter(Prediction.transaction_id.in_(tx_ids)).all()
    dets = db.query(FraudDetection).filter(FraudDetection.transaction_id.in_(tx_ids)).all()
    
    tx_map = {t.transaction_id: t for t in txs}
    pred_map = {p.transaction_id: p for p in preds}
    
    det_map = {}
    for d in dets:
        if d.transaction_id not in det_map: det_map[d.transaction_id] = []
        if d.fraud_category not in det_map[d.transaction_id]:
            det_map[d.transaction_id].append(d.fraud_category)
            
    out_items = []
    for a in items:
        tx = tx_map.get(a.transaction_id)
        p = pred_map.get(a.transaction_id)
        
        out_items.append(AlertSummaryOut(
            id=a.id,
            transaction_id=a.transaction_id,
            severity=a.severity,
            status=a.status,
            title=a.title,
            created_at=a.created_at,
            customer_id=tx.customer_id if tx else "Unknown",
            card_id=tx.card_id if tx else "Unknown",
            amount=tx.amount if tx else 0.0,
            risk_score=p.risk_score if p else 0,
            categories=det_map.get(a.transaction_id, [])
        ))
    
    return {
        "items": out_items,
        "total": total,
        "page": page,
        "size": size,
        "pages": pages
    }

@router.get("/{alert_id}")
def get_alert_detail(alert_id: int, db: Session = Depends(get_db)):
    alert = db.query(Alert).filter(Alert.id == alert_id).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
        
    tx = db.query(Transaction).filter(Transaction.transaction_id == alert.transaction_id).first()
    pred = db.query(Prediction).filter(Prediction.transaction_id == alert.transaction_id).first()
    detections = db.query(FraudDetection).filter(FraudDetection.transaction_id == alert.transaction_id).all()
    label = db.query(FraudLabel).filter(FraudLabel.transaction_id == alert.transaction_id).first()
    
    events = db.query(SystemEvent).filter(SystemEvent.event_type == f"ALERT_{alert_id}").order_by(desc(SystemEvent.timestamp)).all()
    
    event_list = [{"message": e.message, "timestamp": e.timestamp.isoformat(), "severity": e.severity} for e in events]
    event_list.append({"message": "Alert Generated", "timestamp": alert.created_at.isoformat(), "severity": "SYSTEM"})

    try:
        service = PredictionService(db)
        feat_result = service.feature_eng.compute_features(tx)
        features = feat_result["features"]
        signals = feat_result["feature_metadata"]["signals"]
    except Exception:
        features = {}
        signals = []
        
    risk_factors = list(signals)
    for det in detections:
        if det.reason and det.reason not in risk_factors:
            risk_factors.append(det.reason)

    return {
        "alert": alert,
        "transaction": tx,
        "prediction": pred,
        "detections": detections,
        "label": label.label_status if label else "UNKNOWN",
        "features": features,
        "risk_factors": risk_factors,
        "timeline": event_list
    }

def _log_event(db: Session, alert_id: int, msg: str):
    evt = SystemEvent(event_type=f"ALERT_{alert_id}", message=msg, severity="USER")
    db.add(evt)
    db.commit()

@router.post("/{alert_id}/confirm-fraud")
def confirm_fraud(alert_id: int, db: Session = Depends(get_db)):
    alert = db.query(Alert).filter(Alert.id == alert_id).first()
    if not alert: raise HTTPException(404)
    alert.status = "CLOSED"
    alert.resolved_at = datetime.utcnow()
    
    lbl = db.query(FraudLabel).filter(FraudLabel.transaction_id == alert.transaction_id).first()
    if not lbl:
        lbl = FraudLabel(transaction_id=alert.transaction_id, is_fraud=True, label_status="CONFIRMED_FRAUD", labeled_at=datetime.utcnow())
        db.add(lbl)
    else:
        lbl.is_fraud = True
        lbl.label_status = "CONFIRMED_FRAUD"
        lbl.labeled_at = datetime.utcnow()
        
    _log_event(db, alert_id, "Confirmed as Fraud")
    return {"status": "success"}

@router.post("/{alert_id}/confirm-legitimate")
def confirm_legit(alert_id: int, db: Session = Depends(get_db)):
    alert = db.query(Alert).filter(Alert.id == alert_id).first()
    if not alert: raise HTTPException(404)
    alert.status = "CLOSED"
    alert.resolved_at = datetime.utcnow()
    
    lbl = db.query(FraudLabel).filter(FraudLabel.transaction_id == alert.transaction_id).first()
    if not lbl:
        lbl = FraudLabel(transaction_id=alert.transaction_id, is_fraud=False, label_status="CONFIRMED_LEGIT", labeled_at=datetime.utcnow())
        db.add(lbl)
    else:
        lbl.is_fraud = False
        lbl.label_status = "CONFIRMED_LEGIT"
        lbl.labeled_at = datetime.utcnow()
        
    _log_event(db, alert_id, "Confirmed as Legitimate")
    return {"status": "success"}

@router.post("/{alert_id}/dismiss")
def dismiss_alert(alert_id: int, db: Session = Depends(get_db)):
    alert = db.query(Alert).filter(Alert.id == alert_id).first()
    if not alert: raise HTTPException(404)
    alert.status = "DISMISSED"
    alert.resolved_at = datetime.utcnow()
    _log_event(db, alert_id, "Alert Dismissed")
    return {"status": "success"}

@router.post("/{alert_id}/start-investigation")
def start_investigation(alert_id: int, db: Session = Depends(get_db)):
    alert = db.query(Alert).filter(Alert.id == alert_id).first()
    if not alert: raise HTTPException(404)
    alert.status = "INVESTIGATING"
    _log_event(db, alert_id, "Investigation Started")
    return {"status": "success"}

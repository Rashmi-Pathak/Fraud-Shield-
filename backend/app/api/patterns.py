from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc, func
from typing import Optional, List, Dict, Any
from datetime import datetime, timedelta

from app.database.database import get_db
from app.database.models import Alert, FraudDetection, Prediction, Transaction

router = APIRouter()

PATTERN_METADATA = {
    "amount-anomaly": {"title": "Amount Anomaly", "desc": "Unusually large or small transactions compared to historical baselines."},
    "velocity": {"title": "Velocity", "desc": "Rapid succession of transactions within a short time window."},
    "geographic": {"title": "Geographic", "desc": "Transactions originating from unusual or high-risk locations."},
    "device": {"title": "Device", "desc": "Suspicious device fingerprints, multiple cards per device, or emulators."},
    "merchant": {"title": "Merchant", "desc": "Transactions at high-risk merchants or sudden merchant category changes."},
    "time-anomaly": {"title": "Time Anomaly", "desc": "Transactions occurring at highly unusual hours for the user."},
    "card-testing": {"title": "Card Testing", "desc": "Micro-transactions often used to verify stolen card validity before large purchases."},
    "behavioral": {"title": "Behavioral", "desc": "Significant deviation from the user's established spending patterns."},
    "network": {"title": "Network", "desc": "Suspicious IP addresses, VPN/proxy usage, or unusual ASN hops."},
    "sequential": {"title": "Sequential", "desc": "Pre-defined suspicious sequences of actions or specific transaction chains."}
}

@router.get("")
def get_patterns_summary(db: Session = Depends(get_db)):
    # Calculate overall stats
    total_detections_all = db.query(FraudDetection).count()
    
    # We will build stats per category
    res = []
    
    for key, meta in PATTERN_METADATA.items():
        # Get detections for this category. Note that fraud_category in DB is usually uppercase with underscores (e.g., AMOUNT_ANOMALY)
        # Let's map our keys to db categories.
        db_cat = key.upper().replace("-", "_")
        
        # Count total
        count = db.query(FraudDetection).filter(FraudDetection.fraud_category == db_cat).count()
        
        # Risk distribution (join with Prediction)
        critical = db.query(FraudDetection).join(Prediction, FraudDetection.transaction_id == Prediction.transaction_id).filter(
            FraudDetection.fraud_category == db_cat, Prediction.risk_level == 'CRITICAL'
        ).count()
        
        high = db.query(FraudDetection).join(Prediction, FraudDetection.transaction_id == Prediction.transaction_id).filter(
            FraudDetection.fraud_category == db_cat, Prediction.risk_level == 'HIGH'
        ).count()
        
        perc = round((count / total_detections_all * 100), 1) if total_detections_all > 0 else 0
        
        res.append({
            "id": key,
            "title": meta["title"],
            "description": meta["desc"],
            "total_detected": count,
            "high_risk": high,
            "critical": critical,
            "trend": None,
            "percentage": perc
        })
    
    return res

@router.get("/{pattern_id}")
def get_pattern_detail(pattern_id: str, db: Session = Depends(get_db)):
    if pattern_id not in PATTERN_METADATA:
        raise HTTPException(status_code=404, detail="Pattern not found")
        
    meta = PATTERN_METADATA[pattern_id]
    db_cat = pattern_id.upper().replace("-", "_")
    
    dets = db.query(FraudDetection).filter(FraudDetection.fraud_category == db_cat).all()
    
    total = len(dets)
    
    # Fetch risk distribution
    risk_counts = {"CRITICAL": 0, "HIGH": 0, "MEDIUM": 0, "LOW": 0}
    tx_ids = [d.transaction_id for d in dets]
    if tx_ids:
        preds = db.query(Prediction.risk_level, func.count(Prediction.risk_level)).filter(
            Prediction.transaction_id.in_(tx_ids)
        ).group_by(Prediction.risk_level).all()
        for r, c in preds:
            if r in risk_counts:
                risk_counts[r] = c
                
    # Top contributing factors (reasons)
    reason_counts = {}
    for d in dets:
        if d.reason:
            reason_counts[d.reason] = reason_counts.get(d.reason, 0) + 1
    top_factors = sorted([{"reason": k, "count": v} for k, v in reason_counts.items()], key=lambda x: x["count"], reverse=True)[:5]
    
    # Fetch geography, amounts, channels for these transactions
    geo_dist = {}
    amount_dist = {"0-50": 0, "50-200": 0, "200-1000": 0, "1000+": 0}
    channel_dist = {}
    
    recent_alerts = []
    recent_examples = []
    
    if tx_ids:
        txs = db.query(Transaction).filter(Transaction.transaction_id.in_(tx_ids)).order_by(desc(Transaction.event_time)).all()
        
        for t in txs:
            # Geo
            c = t.country or "Unknown"
            geo_dist[c] = geo_dist.get(c, 0) + 1
            
            # Amount
            amt = t.amount or 0
            if amt < 50: amount_dist["0-50"] += 1
            elif amt < 200: amount_dist["50-200"] += 1
            elif amt < 1000: amount_dist["200-1000"] += 1
            else: amount_dist["1000+"] += 1
            
            # Channel
            ch = t.payment_channel or "Unknown"
            channel_dist[ch] = channel_dist.get(ch, 0) + 1
            
        # Recent examples
        actual_alerts = {a.transaction_id: a for a in db.query(Alert).filter(Alert.transaction_id.in_(tx_ids)).all()}
        for t in txs[:5]:
            recent_examples.append({
                "transaction_id": t.transaction_id,
                "amount": t.amount,
                "customer_id": t.customer_id,
                "timestamp": t.event_time.isoformat() if t.event_time else None
            })
            alert = actual_alerts.get(t.transaction_id)
            if alert:
                recent_alerts.append({
                    "id": alert.id,
                    "severity": alert.severity,
                    "timestamp": alert.created_at.isoformat() if alert.created_at else None,
                })
            
    geo_sorted = sorted([{"country": k, "count": v} for k, v in geo_dist.items()], key=lambda x: x["count"], reverse=True)[:5]
    channel_sorted = sorted([{"channel": k, "count": v} for k, v in channel_dist.items()], key=lambda x: x["count"], reverse=True)[:5]
    
    return {
        "id": pattern_id,
        "title": meta["title"],
        "description": meta["desc"],
        "total_detections": total,
        "risk_distribution": risk_counts,
        "trend": None,
        "top_factors": top_factors,
        "geographic_distribution": geo_sorted,
        "amount_distribution": amount_dist,
        "channel_distribution": channel_sorted,
        "recent_alerts": recent_alerts,
        "recent_examples": recent_examples
    }

from sqlalchemy.orm import Session
from app.database.models import Transaction, Alert, Prediction, FraudDetection
from app.ml.predict import PredictionService
from app.schemas.transaction import TransactionCreate
from datetime import datetime
from typing import Dict, Any

class StreamProcessor:
    def __init__(self, db: Session):
        self.db = db
        self.predict_service = PredictionService(db)

    def process_transaction(self, raw_tx: Dict[str, Any]) -> Dict[str, Any]:
        """
        Process a single raw transaction dictionary, persist it, generate predictions,
        and optionally create an alert.
        """
        # Ensure some defaults if missing
        if "transaction_type" not in raw_tx: raw_tx["transaction_type"] = "purchase"
        if "payment_channel" not in raw_tx: raw_tx["payment_channel"] = "online"
        if "currency" not in raw_tx: raw_tx["currency"] = "USD"
        if "card_present" not in raw_tx: raw_tx["card_present"] = False
        if "international_transaction" not in raw_tx: raw_tx["international_transaction"] = False

        # Create Pydantic model for validation
        tx_in = TransactionCreate(**raw_tx)

        # Upsert or Insert transaction
        tx = self.db.query(Transaction).filter(Transaction.transaction_id == tx_in.transaction_id).first()
        if not tx:
            tx = Transaction(**tx_in.model_dump())
            self.db.add(tx)
            self.db.commit()
            self.db.refresh(tx)
        
        # Prevent duplicate predictions for same TX in live stream if re-run
        existing_pred = self.db.query(Prediction).filter(Prediction.transaction_id == tx.transaction_id).first()
        if existing_pred:
            # We already processed this transaction (maybe restarting stream with same data)
            # Fetch existing detections and alert
            detections = self.db.query(FraudDetection).filter(FraudDetection.transaction_id == tx.transaction_id).all()
            alert = self.db.query(Alert).filter(Alert.transaction_id == tx.transaction_id).first()
            return {
                "transaction": tx_in.model_dump(),
                "prediction": {
                    "risk_score": existing_pred.risk_score,
                    "risk_level": existing_pred.risk_level,
                    "fraud_probability": existing_pred.fraud_probability,
                    "xgboost_probability": existing_pred.xgboost_probability,
                    "random_forest_probability": existing_pred.random_forest_probability,
                    "isolation_forest_score": existing_pred.isolation_forest_score,
                    "rule_risk_score": existing_pred.rule_risk_score,
                    "recommended_action": existing_pred.recommended_action
                },
                "detections": [{"category": d.fraud_category, "reason": d.reason} for d in detections],
                "alert": {"id": alert.id, "severity": alert.severity} if alert else None,
                "is_critical": existing_pred.risk_level in ["CRITICAL", "HIGH"]
            }

        # Predict
        risk_result = self.predict_service.predict(tx)
        
        # Create Alert if necessary
        alert_created = None
        is_critical = risk_result["risk_level"] in ["CRITICAL", "HIGH"]
        if is_critical:
            alert = Alert(
                transaction_id=tx.transaction_id,
                severity=risk_result["risk_level"],
                status="OPEN",
                title=f"Suspicious Transaction Detected: {risk_result['risk_level']} Risk",
                description=f"Transaction {tx.transaction_id} flagged with score {risk_result['risk_score']}."
            )
            self.db.add(alert)
            self.db.commit()
            self.db.refresh(alert)
            alert_created = {"id": alert.id, "severity": alert.severity}

        # Fetch detections
        detections = self.db.query(FraudDetection).filter(FraudDetection.transaction_id == tx.transaction_id).all()

        return {
            "transaction": tx_in.model_dump(),
            "prediction": risk_result,
            "detections": [{"category": d.fraud_category, "reason": d.reason} for d in detections],
            "alert": alert_created,
            "is_critical": is_critical
        }

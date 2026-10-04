import os
import sys
from sqlalchemy.orm import Session
from datetime import datetime

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
from app.database.database import SessionLocal, engine
from app.database.models import Transaction, Prediction, FraudDetection, Alert
from app.ml.predict import PredictionService

def run_predictions():
    print("Initializing Prediction Engine...")
    db = SessionLocal()
    pred_service = PredictionService(db)
    
    # We will do this in batches
    print("Clearing old predictions and detections...")
    db.query(Prediction).delete()
    db.query(FraudDetection).delete()
    db.query(Alert).delete()
    db.commit()

    print("Fetching transactions...")
    # Fetch in chunks
    batch_size = 1000
    total = db.query(Transaction).count()
    print(f"Total transactions to predict: {total}")
    
    processed = 0
    
    offset = 0
    while True:
        txs = db.query(Transaction).order_by(Transaction.event_time).offset(offset).limit(batch_size).all()
        if not txs:
            break
            
        for tx in txs:
            try:
                # Predict
                risk_result = pred_service.predict(tx)
                
                # Check critical
                if risk_result["risk_level"] in ["CRITICAL", "HIGH"]:
                    alert = Alert(
                        transaction_id=tx.transaction_id,
                        severity=risk_result["risk_level"],
                        status="OPEN",
                        title=f"Suspicious Transaction Detected: {risk_result['risk_level']} Risk",
                        description=f"Transaction {tx.transaction_id} flagged with score {risk_result['risk_score']}."
                    )
                    db.add(alert)
                    
            except Exception as e:
                # Might fail if feature engineering needs history and this is the very first one
                pass
                
        db.commit()
        processed += len(txs)
        print(f"Processed {processed}/{total}...")
        offset += batch_size

    db.close()
    print("Prediction backfill complete!")

if __name__ == "__main__":
    run_predictions()

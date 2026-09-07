from datetime import datetime
from typing import Optional

from sqlalchemy.orm import Session

from app.database.models import FraudLabel, LabelAudit, SystemEvent, Transaction


CONFIRMED_STATUSES = {"CONFIRMED_FRAUD", "CONFIRMED_LEGIT"}


class FeedbackService:
    """Owns analyst labels separately from model predictions."""

    def confirm_label(self, db: Session, transaction_id: str, is_fraud: bool, source: str = "ANALYST"):
        transaction = db.query(Transaction).filter(Transaction.transaction_id == transaction_id).first()
        if transaction is None:
            raise ValueError("Transaction not found")

        now = datetime.utcnow()
        new_status = "CONFIRMED_FRAUD" if is_fraud else "CONFIRMED_LEGIT"
        label = db.query(FraudLabel).filter(FraudLabel.transaction_id == transaction_id).first()
        previous_status = label.label_status if label else "UNKNOWN"

        if label is None:
            label = FraudLabel(transaction_id=transaction_id)
            db.add(label)

        label.is_fraud = is_fraud
        label.label_status = new_status
        label.label_source = source
        label.labeled_at = now

        db.add(LabelAudit(
            transaction_id=transaction_id,
            label_source=source,
            previous_status=previous_status,
            new_status=new_status,
            timestamp=now,
        ))
        db.add(SystemEvent(
            event_type=f"LABEL_{transaction_id}",
            message=f"Label changed from {previous_status} to {new_status} by {source}",
            severity="USER",
            timestamp=now,
        ))
        db.commit()
        db.refresh(label)
        return label

    def get_confirmed(self, db: Session, label_status: Optional[str] = None):
        statuses = {label_status} if label_status else CONFIRMED_STATUSES
        return (
            db.query(Transaction, FraudLabel)
            .join(FraudLabel, FraudLabel.transaction_id == Transaction.transaction_id)
            .filter(FraudLabel.label_status.in_(statuses), FraudLabel.is_fraud.isnot(None))
            .order_by(Transaction.event_time.asc())
            .all()
        )

    def get_audit_history(self, db: Session, transaction_id: str):
        return (
            db.query(LabelAudit)
            .filter(LabelAudit.transaction_id == transaction_id)
            .order_by(LabelAudit.timestamp.asc(), LabelAudit.id.asc())
            .all()
        )

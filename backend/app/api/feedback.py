from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.schemas.feedback import FeedbackDatasetItem, FeedbackDatasetOut, FeedbackLabelOut, LabelAuditOut
from app.services.feedback_service import CONFIRMED_STATUSES, FeedbackService

router = APIRouter()
service = FeedbackService()


@router.get("/dataset", response_model=FeedbackDatasetOut)
def get_feedback_dataset(
    label_status: Optional[str] = Query(None, description="CONFIRMED_FRAUD or CONFIRMED_LEGIT"),
    db: Session = Depends(get_db),
):
    if label_status and label_status not in CONFIRMED_STATUSES:
        raise HTTPException(status_code=400, detail="Only confirmed labels are eligible for retraining")

    rows = service.get_confirmed(db, label_status)
    items = [FeedbackDatasetItem(
        transaction_id=label.transaction_id,
        transaction={column.name: getattr(transaction, column.name) for column in transaction.__table__.columns},
        is_fraud=bool(label.is_fraud),
        label_status=label.label_status,
        label_source=label.label_source,
        labeled_at=label.labeled_at,
    ) for transaction, label in rows]
    return FeedbackDatasetOut(
        items=items,
        total=len(items),
        confirmed_fraud=sum(item.label_status == "CONFIRMED_FRAUD" for item in items),
        confirmed_legitimate=sum(item.label_status == "CONFIRMED_LEGIT" for item in items),
    )


@router.post("/{transaction_id}/confirm-fraud", response_model=FeedbackLabelOut)
def confirm_fraud(transaction_id: str, db: Session = Depends(get_db)):
    try:
        return service.confirm_label(db, transaction_id, True)
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc))


@router.post("/{transaction_id}/confirm-legitimate", response_model=FeedbackLabelOut)
def confirm_legitimate(transaction_id: str, db: Session = Depends(get_db)):
    try:
        return service.confirm_label(db, transaction_id, False)
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc))


@router.get("/{transaction_id}/audit", response_model=list[LabelAuditOut])
def get_label_audit(transaction_id: str, db: Session = Depends(get_db)):
    return service.get_audit_history(db, transaction_id)

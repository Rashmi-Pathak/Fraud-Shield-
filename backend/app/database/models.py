from sqlalchemy import Column, String, Integer, Float, Boolean, DateTime, ForeignKey, Index
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from .database import Base

class Transaction(Base):
    __tablename__ = "transactions"

    transaction_id = Column(String, primary_key=True, index=True)
    customer_id = Column(String, index=True, nullable=False)
    card_id = Column(String, index=True, nullable=False)
    account_id = Column(String, nullable=False)
    event_time = Column(DateTime, index=True, nullable=False)
    ingestion_time = Column(DateTime, index=True, default=func.now())
    amount = Column(Float, nullable=False)
    currency = Column(String, nullable=False)
    transaction_type = Column(String, nullable=False)
    payment_channel = Column(String, nullable=False)
    card_present = Column(Boolean, nullable=False)
    international_transaction = Column(Boolean, nullable=False)
    installment = Column(Integer, default=1)
    is_recurring = Column(Boolean, default=False)
    merchant_id = Column(String, index=True, nullable=False)
    merchant_category = Column(String, nullable=False)
    device_id = Column(String, index=True)
    device_type = Column(String)
    operating_system = Column(String)
    browser = Column(String)
    country = Column(String)
    state = Column(String)
    city = Column(String)
    latitude = Column(Float)
    longitude = Column(Float)
    ip_country = Column(String)
    ip_region = Column(String)
    ip_city = Column(String)
    created_at = Column(DateTime, default=func.now())

    # Relationships
    features = relationship("TransactionFeature", back_populates="transaction", uselist=False)
    prediction = relationship("Prediction", back_populates="transaction", uselist=False)
    detections = relationship("FraudDetection", back_populates="transaction")
    label = relationship("FraudLabel", back_populates="transaction", uselist=False)
    alert = relationship("Alert", back_populates="transaction", uselist=False)


class TransactionFeature(Base):
    __tablename__ = "transaction_features"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    transaction_id = Column(String, ForeignKey("transactions.transaction_id"), unique=True, nullable=False)
    
    # Derived features examples
    velocity_1h = Column(Integer)
    velocity_24h = Column(Integer)
    amount_avg_24h = Column(Float)
    amount_std_24h = Column(Float)
    distance_from_last_tx = Column(Float)
    is_new_device = Column(Boolean)

    created_at = Column(DateTime, default=func.now())

    transaction = relationship("Transaction", back_populates="features")


class Prediction(Base):
    __tablename__ = "predictions"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    transaction_id = Column(String, ForeignKey("transactions.transaction_id"), unique=True, nullable=False)
    xgboost_probability = Column(Float)
    random_forest_probability = Column(Float)
    isolation_forest_score = Column(Float)
    rule_risk_score = Column(Integer)
    fraud_probability = Column(Float, nullable=False)
    risk_score = Column(Integer, nullable=False)
    risk_level = Column(String, nullable=False) # e.g., 'Low Risk', 'Medium Risk', 'High Risk'
    recommended_action = Column(String) # e.g., 'Approve', 'Review', 'Block'
    model_version = Column(String)
    created_at = Column(DateTime, default=func.now())

    transaction = relationship("Transaction", back_populates="prediction")


class FraudDetection(Base):
    __tablename__ = "fraud_detections"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    transaction_id = Column(String, ForeignKey("transactions.transaction_id"), index=True, nullable=False)
    fraud_category = Column(String, nullable=False)
    fraud_subcategory = Column(String)
    severity = Column(String)
    confidence = Column(Float)
    reason = Column(String)
    created_at = Column(DateTime, default=func.now())

    transaction = relationship("Transaction", back_populates="detections")


class FraudLabel(Base):
    __tablename__ = "fraud_labels"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    transaction_id = Column(String, ForeignKey("transactions.transaction_id"), unique=True, nullable=False)
    is_fraud = Column(Boolean)
    fraud_category = Column(String)
    fraud_subcategory = Column(String)
    label_status = Column(String, nullable=False) # UNKNOWN, PENDING_REVIEW, CONFIRMED_FRAUD, CONFIRMED_LEGIT
    label_source = Column(String)
    labeled_at = Column(DateTime)
    created_at = Column(DateTime, default=func.now())

    transaction = relationship("Transaction", back_populates="label")


class Alert(Base):
    __tablename__ = "alerts"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    transaction_id = Column(String, ForeignKey("transactions.transaction_id"), unique=True, nullable=False)
    severity = Column(String, nullable=False)
    status = Column(String, nullable=False)
    title = Column(String, nullable=False)
    description = Column(String)
    created_at = Column(DateTime, default=func.now())
    resolved_at = Column(DateTime)

    transaction = relationship("Transaction", back_populates="alert")


class ModelVersion(Base):
    __tablename__ = "model_versions"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    model_name = Column(String, nullable=False)
    version = Column(String, nullable=False, unique=True)
    training_rows = Column(Integer)
    training_date = Column(DateTime)
    precision = Column(Float)
    recall = Column(Float)
    f1 = Column(Float)
    roc_auc = Column(Float)
    pr_auc = Column(Float)
    model_path = Column(String)
    is_production = Column(Boolean, default=False)
    created_at = Column(DateTime, default=func.now())


class SystemEvent(Base):
    __tablename__ = "system_events"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    event_type = Column(String, index=True, nullable=False)
    message = Column(String, nullable=False)
    severity = Column(String, nullable=False)
    timestamp = Column(DateTime, default=func.now(), index=True)

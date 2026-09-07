"""End-to-end coverage for the local SQLite/FastAPI/ML/stream architecture."""

import json
import os
from datetime import datetime

import joblib
import numpy as np
import pandas as pd
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.database.database import Base, get_db
from app.database.models import Alert, FraudLabel, Prediction, Transaction
from app.fraud.rules import FraudRuleEngine
from app.main import app
from app.streaming import websocket as websocket_module
from app.streaming.processor import StreamProcessor


TEST_ENGINE = create_engine(
    "sqlite:///:memory:", connect_args={"check_same_thread": False}, poolclass=StaticPool
)
TestSession = sessionmaker(bind=TEST_ENGINE)


def _transaction(transaction_id: str, amount: float = 20.0) -> Transaction:
    return Transaction(
        transaction_id=transaction_id,
        customer_id=f"CUST-{transaction_id}",
        card_id=f"CARD-{transaction_id}",
        account_id=f"ACC-{transaction_id}",
        event_time=datetime(2026, 9, 1, 12, 0, 0),
        amount=amount,
        currency="USD",
        transaction_type="purchase",
        payment_channel="online",
        card_present=False,
        international_transaction=False,
        merchant_id=f"MERCHANT-{transaction_id}",
        merchant_category="retail",
        device_id=f"DEVICE-{transaction_id}",
        country="US",
        city="New York",
        latitude=40.7128,
        longitude=-74.0060,
    )


@pytest.fixture()
def e2e_client():
    Base.metadata.create_all(TEST_ENGINE)
    db = TestSession()
    db.add_all([_transaction(f"IMPORTED-{i}", 20 + i) for i in range(5)])
    db.commit()

    def override_get_db():
        session = TestSession()
        try:
            yield session
        finally:
            session.close()

    previous = app.dependency_overrides.get(get_db)
    app.dependency_overrides[get_db] = override_get_db
    client = TestClient(app)
    yield client, db
    app.dependency_overrides.pop(get_db, None)
    if previous:
        app.dependency_overrides[get_db] = previous
    db.close()
    Base.metadata.drop_all(TEST_ENGINE)


def test_database_import_and_transactions_exist(e2e_client):
    client, db = e2e_client
    csv_path = os.path.join(os.path.dirname(__file__), "..", "..", "data", "raw", "live_stream_sample_1000.csv")
    frame = pd.read_csv(csv_path).head(3)
    assert len(frame) == 3
    for record in frame.to_dict(orient="records"):
        is_fraud = bool(record.pop("is_fraud", False))
        record.pop("fraud_category", None)
        record.pop("fraud_subcategory", None)
        record["event_time"] = pd.to_datetime(record.pop("timestamp")).to_pydatetime()
        record["ingestion_time"] = pd.to_datetime(record.pop("ingestion_timestamp")).to_pydatetime()
        valid_columns = {column.name for column in Transaction.__table__.columns}
        db.add(Transaction(**{key: value for key, value in record.items() if key in valid_columns}))
        db.add(FraudLabel(transaction_id=record["transaction_id"], is_fraud=is_fraud,
                          label_status="CONFIRMED_FRAUD" if is_fraud else "CONFIRMED_LEGIT",
                          label_source="e2e_import"))
    db.commit()
    assert db.query(Transaction).count() >= 5
    assert all(row.transaction_id for row in db.query(Transaction).limit(5).all())


def test_all_configured_models_load_and_predict():
    base = os.path.join(os.path.dirname(__file__), "..", "models")
    schema = joblib.load(os.path.join(base, "feature_schema.joblib"))
    scaler = joblib.load(os.path.join(base, "preprocessor.joblib"))
    frame = pd.DataFrame([np.zeros(len(schema))], columns=schema)
    scaled = scaler.transform(frame)
    assert joblib.load(os.path.join(base, "xgboost", "model.joblib")).predict_proba(frame).shape == (1, 2)
    random_forest = joblib.load(os.path.join(base, "random_forest", "model.joblib"))
    random_forest.n_jobs = 1
    assert random_forest.predict_proba(frame).shape == (1, 2)
    assert joblib.load(os.path.join(base, "isolation_forest", "model.joblib")).score_samples(scaled).shape == (1,)


def test_manual_analysis_persists_features_rules_ml_risk_and_database(e2e_client):
    client, db = e2e_client
    payload = {
        "transaction_id": "MANUAL-E2E-1",
        "customer_id": "MANUAL-CUSTOMER",
        "card_id": "MANUAL-CARD",
        "account_id": "MANUAL-ACCOUNT",
        "event_time": "2026-09-01T12:00:00",
        "amount": 5000,
        "currency": "USD",
        "transaction_type": "purchase",
        "payment_channel": "online",
        "merchant_id": "MANUAL-MERCHANT",
        "merchant_category": "retail",
        "device_id": "MANUAL-DEVICE",
        "card_present": False,
        "international_transaction": True,
    }
    response = client.post("/api/predict", json=payload)
    assert response.status_code == 200
    result = response.json()
    assert result["fraud_categories"] is not None
    assert result["risk_score"] >= 0
    detail = client.get("/api/transactions/MANUAL-E2E-1")
    assert detail.status_code == 200
    assert detail.json()["features"]
    assert db.query(Prediction).filter_by(transaction_id="MANUAL-E2E-1").one().fraud_probability == result["fraud_probability"]


@pytest.mark.parametrize(
    "scenario,features,expected",
    [
        ("Card Testing", {"micro_to_large_sequence": 1}, "CARD_TESTING"),
        ("Velocity", {"transaction_count_5min": 6}, "VELOCITY"),
        ("Impossible Travel", {"estimated_travel_speed_kmh": 801}, "GEOGRAPHIC"),
        ("New Device", {"is_new_device": 1, "amount_vs_customer_average": 3}, "DEVICE"),
        ("High Value", {"amount_zscore": 4}, "AMOUNT_ANOMALY"),
        ("Behavioral", {"rapid_escalation_flag": 1}, "BEHAVIORAL"),
        ("Network", {"device_card_count": 4}, "NETWORK"),
        ("Sequential", {"same_amount_count_5min": 4}, "SEQUENTIAL"),
    ],
)
def test_fraud_scenarios(scenario, features, expected):
    assert any(rule["category"] == expected for rule in FraudRuleEngine().evaluate(features)), scenario


def test_stream_processor_creates_transaction_prediction_and_alert(e2e_client):
    _, db = e2e_client
    processor = StreamProcessor(db)
    def fake_predict(tx):
        db.add(Prediction(transaction_id=tx.transaction_id, xgboost_probability=0.99, random_forest_probability=0.99,
                          isolation_forest_score=0.99, rule_risk_score=100, fraud_probability=0.99,
                          risk_score=99, risk_level="CRITICAL", recommended_action="BLOCK_OR_REVIEW"))
        db.commit()
        return {
        "transaction_id": tx.transaction_id,
        "xgboost_probability": 0.99,
        "random_forest_probability": 0.99,
        "isolation_forest_score": 0.99,
        "rule_risk_score": 100,
        "fraud_probability": 0.99,
        "risk_score": 99,
        "risk_level": "CRITICAL",
        "recommended_action": "BLOCK_OR_REVIEW",
        "fraud_categories": ["AMOUNT_ANOMALY"],
        "risk_factors": ["End-to-end test signal"],
        }
    processor.predict_service.predict = fake_predict
    result = processor.process_transaction({
        "transaction_id": "STREAM-FRAUD-1",
        "customer_id": "STREAM-CUSTOMER",
        "card_id": "STREAM-CARD",
        "account_id": "STREAM-ACCOUNT",
        "event_time": "2026-09-01T12:00:00",
        "amount": 50000,
        "currency": "USD",
        "merchant_id": "STREAM-MERCHANT",
        "merchant_category": "electronics",
        "device_id": "STREAM-DEVICE",
        "payment_channel": "online",
        "card_present": False,
        "international_transaction": True,
    })
    assert result["transaction"]["transaction_id"] == "STREAM-FRAUD-1"
    assert db.query(Transaction).filter_by(transaction_id="STREAM-FRAUD-1").one()
    assert db.query(Prediction).filter_by(transaction_id="STREAM-FRAUD-1").one()
    assert result["alert"] is not None
    assert db.query(Alert).filter_by(transaction_id="STREAM-FRAUD-1").one()


def test_websocket_emits_processed_transaction_and_updates_sqlite(e2e_client, monkeypatch):
    client, db = e2e_client
    monkeypatch.setattr(websocket_module, "SessionLocal", TestSession)

    class FastProcessor:
        def __init__(self, session):
            self.session = session

        def process_transaction(self, raw_tx):
            transaction = _transaction(raw_tx["transaction_id"])
            self.session.add(transaction)
            self.session.add(Prediction(transaction_id=transaction.transaction_id, fraud_probability=0.01,
                                        risk_score=10, risk_level="LOW", recommended_action="ALLOW"))
            self.session.commit()
            return {
                "transaction": raw_tx,
                "prediction": {"risk_score": 10, "risk_level": "LOW", "fraud_probability": 0.01},
                "detections": [],
                "alert": None,
                "is_critical": False,
            }

    monkeypatch.setattr(websocket_module, "StreamProcessor", FastProcessor)
    with client.websocket_connect("/ws/live") as socket:
        socket.send_json({"action": "SET_SPEED", "speed": 1000})
        socket.send_json({"action": "START"})
        assert socket.receive_json()["type"] == "status"
        event = socket.receive_json()
        socket.send_json({"action": "STOP"})
    assert event["type"] == "transaction"
    transaction_id = event["data"]["transaction"]["transaction_id"]
    assert db.query(Transaction).filter_by(transaction_id=transaction_id).one()
    assert db.query(Prediction).filter_by(transaction_id=transaction_id).one()


def test_alert_investigation_confirmation_and_label_audit(e2e_client):
    client, db = e2e_client
    processor = StreamProcessor(db)
    def fake_predict(tx):
        db.add(Prediction(transaction_id=tx.transaction_id, xgboost_probability=0.99, random_forest_probability=0.99,
                          isolation_forest_score=0.99, rule_risk_score=100, fraud_probability=0.99,
                          risk_score=99, risk_level="CRITICAL", recommended_action="BLOCK_OR_REVIEW"))
        db.commit()
        return {
        "transaction_id": tx.transaction_id,
        "xgboost_probability": 0.99,
        "random_forest_probability": 0.99,
        "isolation_forest_score": 0.99,
        "rule_risk_score": 100,
        "fraud_probability": 0.99,
        "risk_score": 99,
        "risk_level": "CRITICAL",
        "recommended_action": "BLOCK_OR_REVIEW",
        "fraud_categories": ["AMOUNT_ANOMALY"],
        "risk_factors": ["End-to-end test signal"],
        }
    processor.predict_service.predict = fake_predict
    result = processor.process_transaction({
        "transaction_id": "ALERT-E2E-1", "customer_id": "C", "card_id": "CARD", "account_id": "A",
        "event_time": "2026-09-01T12:00:00", "amount": 100000, "currency": "USD",
        "merchant_id": "M", "merchant_category": "retail", "device_id": "D",
        "payment_channel": "online", "card_present": False, "international_transaction": True,
    })
    alert_id = result["alert"]["id"]
    response = client.post(f"/api/alerts/{alert_id}/confirm-fraud")
    assert response.status_code == 200
    label = db.query(FraudLabel).filter_by(transaction_id="ALERT-E2E-1").one()
    assert label.is_fraud is True
    assert label.label_status == "CONFIRMED_FRAUD"
    assert label.label_source == "ANALYST"
    assert db.query(Prediction).filter_by(transaction_id="ALERT-E2E-1").one().fraud_probability is not None


def test_dashboard_transactions_models_data_and_system_are_live(e2e_client):
    client, _ = e2e_client
    for path in [
        "/api/dashboard/summary",
        "/api/transactions?page=1&size=10",
        "/api/models",
        "/api/data/summary",
        "/api/system/health",
    ]:
        response = client.get(path)
        assert response.status_code == 200, (path, response.text)
    assert client.get("/api/data/summary").json()["total_transactions"] >= 5
    assert client.get("/api/system/health").json()["components"]["sqlite"]["status"] == "OPERATIONAL"


def test_restart_persistence_and_model_reload(e2e_client):
    _, db = e2e_client
    db.add(_transaction("RESTART-E2E-1"))
    db.commit()
    db.close()
    restarted_session = TestSession()
    try:
        assert restarted_session.query(Transaction).filter_by(transaction_id="RESTART-E2E-1").one()
        base = os.path.join(os.path.dirname(__file__), "..", "models")
        assert joblib.load(os.path.join(base, "xgboost", "model.joblib")) is not None
    finally:
        restarted_session.close()

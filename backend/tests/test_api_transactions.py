import pytest
from fastapi.testclient import TestClient
from datetime import datetime
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.main import app
from app.database.database import Base, get_db
from app.database.models import Transaction, Prediction

SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}, poolclass=StaticPool)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

client = TestClient(app)

@pytest.fixture(scope="function", autouse=True)
def setup_db():
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    
    # Insert mock transactions for testing filters
    txs = [
        Transaction(
            transaction_id=f"TXN-{i}",
            customer_id=f"CUST-{i%3}",
            card_id="CARD-1",
            account_id="ACC-1",
            event_time=datetime(2026, 9, 1, 10, i),
            amount=100.0 * i,
            currency="USD",
            transaction_type="purchase",
            payment_channel="online",
            card_present=False,
            international_transaction=False,
            country="US",
            merchant_id="M-1",
            merchant_category="retail" if i % 2 == 0 else "travel",
            city="NY",
            device_id="DEV-1"
        )
        for i in range(1, 15)
    ]
    db.add_all(txs)
    
    # Add one specific prediction to filter on
    p1 = Prediction(
        transaction_id="TXN-1",
        fraud_probability=0.9,
        risk_score=85,
        risk_level="CRITICAL",
        recommended_action="BLOCK",
        xgboost_probability=0.9,
        random_forest_probability=0.9,
        isolation_forest_score=0.9
    )
    db.add(p1)
    db.commit()
    yield db
    db.close()
    Base.metadata.drop_all(bind=engine)

def test_transactions_pagination():
    res = client.get("/api/transactions?page=1&size=5")
    assert res.status_code == 200
    data = res.json()
    assert len(data["items"]) == 5
    assert data["total"] == 14
    assert data["pages"] == 3

def test_transactions_filters():
    # Filter by category
    res = client.get("/api/transactions?category=travel")
    data = res.json()
    assert len(data["items"]) == 7 # Half of 14 are travel
    
    # Filter by risk level
    res = client.get("/api/transactions?risk_level=CRITICAL")
    data = res.json()
    assert len(data["items"]) == 1
    assert data["items"][0]["transaction_id"] == "TXN-1"
    
    # Filter by amount range
    res = client.get("/api/transactions?min_amount=1300&max_amount=1500")
    data = res.json()
    assert len(data["items"]) == 2 # TXN-13 and TXN-14 (1300, 1400)

def test_transactions_search():
    res = client.get("/api/transactions?search=CUST-2")
    data = res.json()
    # 14 items, i%3==2 -> i=2, 5, 8, 11, 14 (5 items)
    assert len(data["items"]) == 5

def test_single_transaction_valid():
    res = client.get("/api/transactions/TXN-1")
    assert res.status_code == 200
    data = res.json()
    assert data["transaction"]["transaction_id"] == "TXN-1"
    assert data["prediction"]["risk_level"] == "CRITICAL"

def test_single_transaction_invalid():
    res = client.get("/api/transactions/TXN-UNKNOWN")
    assert res.status_code == 404

def test_prediction_endpoint():
    payload = {
        "transaction_id": "TXN-NEW",
        "customer_id": "CUST-99",
        "card_id": "CARD-99",
        "account_id": "ACC-99",
        "event_time": "2026-09-02T10:00:00Z",
        "amount": 999.99,
        "merchant_id": "M-99",
        "merchant_category": "electronics",
        "city": "LA",
        "device_id": "DEV-99",
        "latitude": 34.05,
        "longitude": -118.25
    }
    res = client.post("/api/predict", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert data["transaction_id"] == "TXN-NEW"
    assert "risk_score" in data
    
    # Verify persistence
    db = TestingSessionLocal()
    pred_db = db.query(Prediction).filter_by(transaction_id="TXN-NEW").first()
    assert pred_db is not None
    assert pred_db.risk_score == data["risk_score"]
    db.close()

def test_analyze_endpoint():
    payload = {
        "transaction_id": "TXN-ANALYZE",
        "customer_id": "CUST-99",
        "card_id": "CARD-99",
        "account_id": "ACC-99",
        "event_time": "2026-09-02T10:00:00Z",
        "amount": 5.0,
        "merchant_id": "M-99",
        "merchant_category": "food",
        "city": "LA",
        "device_id": "DEV-99"
    }
    res = client.post("/api/transactions/analyze", json=payload)
    assert res.status_code == 200
    assert res.json()["transaction_id"] == "TXN-ANALYZE"

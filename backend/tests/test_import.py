import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.main import app
from app.database.database import Base, get_db
from app.database.models import Transaction, FraudLabel
from datetime import datetime

from sqlalchemy.pool import StaticPool

# Test database
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}, poolclass=StaticPool)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db
client = TestClient(app)

@pytest.fixture(scope="module")
def db_session():
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    
    # Mock some data for the test to read since we aren't running the full CSV import in the Pytest suite
    # (running 15k inserts in memory for a basic route test might be slow or depend on the CSV being present)
    for i in range(150):
        tx = Transaction(
            transaction_id=f"TXN-{i}",
            customer_id=f"CUST-{i%10}",
            card_id=f"CARD-{i%5}",
            account_id="ACC-000",
            event_time=datetime.now(),
            amount=100.0,
            currency="USD",
            transaction_type="purchase",
            payment_channel="online",
            card_present=False,
            international_transaction=False,
            merchant_id="M-101",
            merchant_category="retail",
            device_id="DEV-01"
        )
        db.add(tx)
        
        lbl = FraudLabel(
            transaction_id=f"TXN-{i}",
            is_fraud=(i % 15 == 0),
            label_status="CONFIRMED_FRAUD" if (i % 15 == 0) else "CONFIRMED_LEGIT"
        )
        db.add(lbl)
    
    db.commit()
    yield db
    db.close()
    Base.metadata.drop_all(bind=engine)

def test_data_summary_endpoint(db_session):
    response = client.get("/api/data/summary")
    assert response.status_code == 200
    
    data = response.json()
    assert data["total_transactions"] == 150
    assert data["total_fraud"] == 10
    assert data["total_legitimate"] == 140
    assert data["unique_customers"] == 10
    assert data["unique_cards"] == 5

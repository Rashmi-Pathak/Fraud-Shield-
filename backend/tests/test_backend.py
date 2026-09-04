import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.exc import IntegrityError
from datetime import datetime

from app.main import app
from app.database.database import Base, get_db
from app.database.models import Transaction

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
    # Create tables
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    yield db
    db.close()
    Base.metadata.drop_all(bind=engine)

def test_database_connection_and_creation(db_session):
    # Tests database creation and connection
    from sqlalchemy import text
    result = db_session.execute(text("SELECT 1")).scalar()
    assert result == 1

def test_tables_exist(db_session):
    # Verify tables exist by reflecting the engine
    from sqlalchemy import inspect
    inspector = inspect(engine)
    tables = inspector.get_table_names()
    assert "transactions" in tables
    assert "predictions" in tables
    assert "fraud_detections" in tables
    assert "fraud_labels" in tables
    assert "alerts" in tables
    assert "model_versions" in tables
    assert "system_events" in tables

def test_transaction_insertion_and_retrieval(db_session):
    # Test insertion
    tx = Transaction(
        transaction_id="TXN-001",
        customer_id="CUST-100",
        card_id="CARD-200",
        account_id="ACC-300",
        event_time=datetime.now(),
        amount=150.50,
        currency="USD",
        transaction_type="purchase",
        payment_channel="online",
        card_present=False,
        international_transaction=False,
        merchant_id="M-101",
        merchant_category="retail"
    )
    db_session.add(tx)
    db_session.commit()

    # Test retrieval
    retrieved = db_session.query(Transaction).filter_by(transaction_id="TXN-001").first()
    assert retrieved is not None
    assert retrieved.amount == 150.50
    assert retrieved.customer_id == "CUST-100"

def test_duplicate_transaction_protection(db_session):
    # Try inserting the same transaction_id
    duplicate_tx = Transaction(
        transaction_id="TXN-001", # same ID
        customer_id="CUST-102",
        card_id="CARD-202",
        account_id="ACC-302",
        event_time=datetime.now(),
        amount=50.00,
        currency="USD",
        transaction_type="purchase",
        payment_channel="in-store",
        card_present=True,
        international_transaction=False,
        merchant_id="M-102",
        merchant_category="grocery"
    )
    db_session.add(duplicate_tx)
    
    with pytest.raises(IntegrityError):
        db_session.commit()
    
    db_session.rollback()

def test_health_endpoint():
    # Test health endpoint using test client
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert "status" in data
    assert data["api"] == "healthy"
    assert data["database"] == "healthy"

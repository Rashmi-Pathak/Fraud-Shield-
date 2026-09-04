import pytest
from datetime import datetime, timedelta
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.database.database import Base
from app.database.models import Transaction
from app.ml.feature_engineering import FeatureEngineer

# Test database
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}, poolclass=StaticPool)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

@pytest.fixture(scope="function")
def db_session():
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    yield db
    db.close()
    Base.metadata.drop_all(bind=engine)

def create_tx(db, tx_id, amount, minutes_ago, lat=40.7128, lon=-74.0060, device_id="D1", merchant="M1"):
    now = datetime(2026, 9, 1, 12, 0, 0)
    tx = Transaction(
        transaction_id=tx_id,
        customer_id="C1",
        card_id="CARD1",
        account_id="ACC1",
        event_time=now - timedelta(minutes=minutes_ago),
        amount=amount,
        currency="USD",
        transaction_type="purchase",
        payment_channel="online",
        card_present=False,
        international_transaction=False,
        merchant_id=merchant,
        merchant_category="retail",
        device_id=device_id,
        latitude=lat,
        longitude=lon
    )
    db.add(tx)
    db.commit()
    db.refresh(tx)
    return tx

def test_feature_engineering_velocity_and_leakage(db_session):
    # Setup history
    create_tx(db_session, "TX-H1", 10.0, 60) # 1 hour ago
    create_tx(db_session, "TX-H2", 20.0, 10) # 10 mins ago
    create_tx(db_session, "TX-H3", 30.0, 2)  # 2 mins ago
    
    # Future transaction (MUST NOT LEAK)
    create_tx(db_session, "TX-FUTURE", 999.0, -10) # 10 mins IN THE FUTURE
    
    # Current transaction
    current_tx = create_tx(db_session, "TX-CURRENT", 40.0, 0)
    
    engineer = FeatureEngineer(db_session)
    result = engineer.compute_features(current_tx)
    features = result["features"]
    
    # Check Leakage (velocity shouldn't include FUTURE)
    assert features["transaction_count_1min"] == 0 # Only current is within 1m, but < dt is 0
    assert features["transaction_count_5min"] == 1 # TX-H3
    assert features["transaction_count_15min"] == 2 # TX-H2, TX-H3
    assert features["transaction_count_1h"] == 3 # All 3
    
    # Ensure FUTURE amount didn't leak into sums or max
    assert features["amount_sum_1h"] == 60.0
    assert features["customer_max_amount"] == 30.0
    
def test_feature_engineering_card_testing(db_session):
    create_tx(db_session, "TX-1", 1.0, 4)
    create_tx(db_session, "TX-2", 2.0, 3)
    create_tx(db_session, "TX-3", 1.5, 2)
    
    current_tx = create_tx(db_session, "TX-4", 1000.0, 0)
    
    engineer = FeatureEngineer(db_session)
    result = engineer.compute_features(current_tx)
    features = result["features"]
    signals = result["feature_metadata"]["signals"]
    
    assert features["micro_transaction_count_5min"] == 3
    assert features["micro_to_large_sequence"] == 1
    assert any("Card testing pattern" in s for s in signals)

def test_geographic_distance_and_impossible_travel(db_session):
    # New York
    create_tx(db_session, "TX-NY", 50.0, 30, lat=40.7128, lon=-74.0060)
    
    # Los Angeles (30 minutes later)
    current_tx = create_tx(db_session, "TX-LA", 50.0, 0, lat=34.0522, lon=-118.2437)
    
    engineer = FeatureEngineer(db_session)
    result = engineer.compute_features(current_tx)
    features = result["features"]
    signals = result["feature_metadata"]["signals"]
    
    # Distance NY -> LA is ~3900 km
    assert features["distance_from_previous_km"] > 3500
    # Travel 3900 km in 30 mins = ~7800 km/h
    assert features["estimated_travel_speed_kmh"] > 7000
    assert features["is_new_location"] == 1
    assert any("Impossible travel speed" in s for s in signals)

def test_new_device_and_merchant(db_session):
    # D1 and M1 exist
    create_tx(db_session, "TX-1", 10.0, 10, device_id="D1", merchant="M1")
    
    # Use D2 and M2
    current_tx = create_tx(db_session, "TX-2", 20.0, 0, device_id="D2", merchant="M2")
    
    engineer = FeatureEngineer(db_session)
    features = engineer.compute_features(current_tx)["features"]
    
    assert features["is_new_device"] == 1
    assert features["is_new_merchant"] == 1
    assert features["device_card_count"] == 0 # no previous txs on D2
    
def test_amount_anomaly_and_behavioral_deviation(db_session):
    # Normal spend
    for i in range(10):
        # add variance so stddev is > 0: e.g. 40, 60, 40, 60...
        amt = 40.0 if i % 2 == 0 else 60.0
        create_tx(db_session, f"TX-{i}", amt, 100 - i)
        
    current_tx = create_tx(db_session, "TX-HUGE", 5000.0, 0)
    
    engineer = FeatureEngineer(db_session)
    result = engineer.compute_features(current_tx)
    features = result["features"]
    signals = result["feature_metadata"]["signals"]
    
    assert features["customer_avg_amount"] == 50.0
    assert features["amount_vs_customer_average"] == 100.0
    assert features["rapid_escalation_flag"] == 1
    assert features["amount_zscore"] > 0
    assert any("Rapid spending escalation" in s for s in signals)

import pytest
from app.fraud.rules import FraudRuleEngine, RULE_CONFIG

@pytest.fixture
def engine():
    return FraudRuleEngine()

def test_amount_anomaly(engine):
    features = {
        "amount_zscore": 3.5,
        "amount_vs_customer_average": 5.1
    }
    rules = engine.evaluate(features)
    assert any(r["category"] == "AMOUNT_ANOMALY" for r in rules)

def test_velocity(engine):
    features = {
        "transaction_count_5min": RULE_CONFIG["VELOCITY_5MIN_THRESHOLD"] + 1,
        "transaction_count_1h": RULE_CONFIG["VELOCITY_1H_THRESHOLD"] + 5
    }
    rules = engine.evaluate(features)
    assert any(r["category"] == "VELOCITY" for r in rules)

def test_geographic(engine):
    features = {
        "estimated_travel_speed_kmh": RULE_CONFIG["IMPOSSIBLE_TRAVEL_SPEED_KMH"] + 100
    }
    rules = engine.evaluate(features)
    assert any(r["category"] == "GEOGRAPHIC" for r in rules)

def test_device(engine):
    features = {
        "is_new_device": 1,
        "amount_vs_customer_average": RULE_CONFIG["NEW_DEVICE_AMOUNT_MULTIPLIER"] + 1
    }
    rules = engine.evaluate(features)
    assert any(r["category"] == "DEVICE" for r in rules)

def test_merchant(engine):
    features = {
        "is_new_merchant": 1,
        "amount_sum_24h": RULE_CONFIG["NEW_MERCHANT_SUM_24H_THRESHOLD"] + 500
    }
    rules = engine.evaluate(features)
    assert any(r["category"] == "MERCHANT" for r in rules)

def test_time_anomaly(engine):
    features = {
        "is_outside_typical_hours": 1,
        "is_new_location": 1
    }
    rules = engine.evaluate(features)
    assert any(r["category"] == "TIME_ANOMALY" for r in rules)

def test_card_testing(engine):
    features = {
        "micro_to_large_sequence": 1,
        "micro_transaction_count_5min": 0
    }
    rules = engine.evaluate(features)
    assert any(r["category"] == "CARD_TESTING" and r["subcategory"] == "MICRO_TO_LARGE_SEQUENCE" for r in rules)
    
    features2 = {
        "micro_to_large_sequence": 0,
        "micro_transaction_count_5min": RULE_CONFIG["CARD_TESTING_MICRO_COUNT"] + 1
    }
    rules2 = engine.evaluate(features2)
    assert any(r["category"] == "CARD_TESTING" and r["subcategory"] == "MASS_MICRO_TRANSACTIONS" for r in rules2)

def test_behavioral(engine):
    features = {
        "rapid_escalation_flag": 1
    }
    rules = engine.evaluate(features)
    assert any(r["category"] == "BEHAVIORAL" for r in rules)

def test_network(engine):
    features = {
        "device_card_count": RULE_CONFIG["NETWORK_MAX_CARDS_PER_DEVICE"] + 1
    }
    rules = engine.evaluate(features)
    assert any(r["category"] == "NETWORK" for r in rules)

def test_sequential(engine):
    features = {
        "same_amount_count_5min": RULE_CONFIG["SEQUENTIAL_SAME_AMOUNT_COUNT"] + 1
    }
    rules = engine.evaluate(features)
    assert any(r["category"] == "SEQUENTIAL" for r in rules)

def test_clean_transaction(engine):
    features = {
        "amount_zscore": 0.5,
        "amount_vs_customer_average": 1.0,
        "transaction_count_5min": 1,
        "transaction_count_1h": 2,
        "estimated_travel_speed_kmh": 40.0,
        "is_new_device": 0,
        "is_new_merchant": 0,
        "is_outside_typical_hours": 0,
        "is_new_location": 0,
        "micro_to_large_sequence": 0,
        "micro_transaction_count_5min": 0,
        "rapid_escalation_flag": 0,
        "device_card_count": 1,
        "same_amount_count_5min": 0
    }
    rules = engine.evaluate(features)
    assert len(rules) == 0

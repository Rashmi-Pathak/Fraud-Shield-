from typing import Dict, Any, List

# Configuration for Fraud Rules (Thresholds)
RULE_CONFIG = {
    "AMOUNT_ZSCORE_THRESHOLD": 3.0,
    "AMOUNT_MULTIPLIER_THRESHOLD": 5.0,
    "VELOCITY_5MIN_THRESHOLD": 5,
    "VELOCITY_1H_THRESHOLD": 15,
    "IMPOSSIBLE_TRAVEL_SPEED_KMH": 800.0,
    "NEW_DEVICE_AMOUNT_MULTIPLIER": 2.0,
    "NEW_MERCHANT_SUM_24H_THRESHOLD": 1000.0,
    "CARD_TESTING_MICRO_COUNT": 3,
    "NETWORK_MAX_CARDS_PER_DEVICE": 3,
    "SEQUENTIAL_SAME_AMOUNT_COUNT": 3
}

class FraudRuleEngine:
    def __init__(self, config: Dict[str, Any] = None):
        self.config = config or RULE_CONFIG

    def evaluate(self, features: Dict[str, Any]) -> List[Dict[str, Any]]:
        """
        Evaluate real-time features against deterministic fraud rules.
        """
        triggered_rules = []

        # 1. AMOUNT_ANOMALY
        # Rule: High amount compared to historical behavior (Z-Score or pure multiplier)
        z_score = features.get("amount_zscore", 0.0)
        amt_vs_avg = features.get("amount_vs_customer_average", 0.0)
        if z_score >= self.config["AMOUNT_ZSCORE_THRESHOLD"] or amt_vs_avg >= self.config["AMOUNT_MULTIPLIER_THRESHOLD"]:
            triggered_rules.append({
                "category": "AMOUNT_ANOMALY",
                "subcategory": "UNUSUAL_SPEND_MAGNITUDE",
                "severity": "HIGH",
                "confidence": 0.85,
                "reason": "Transaction amount is significantly higher than historical average",
                "feature_values": {"amount_zscore": z_score, "amount_vs_customer_average": amt_vs_avg},
                "threshold": self.config["AMOUNT_ZSCORE_THRESHOLD"]
            })

        # 2. VELOCITY
        # Rule: Multiple transactions within a short window
        tx_5min = features.get("transaction_count_5min", 0)
        tx_1h = features.get("transaction_count_1h", 0)
        if tx_5min >= self.config["VELOCITY_5MIN_THRESHOLD"]:
            triggered_rules.append({
                "category": "VELOCITY",
                "subcategory": "RAPID_TRANSACTIONS",
                "severity": "HIGH",
                "confidence": 0.90,
                "reason": f"{tx_5min} transactions occurred within 5 minutes",
                "feature_values": {"transaction_count_5min": tx_5min},
                "threshold": self.config["VELOCITY_5MIN_THRESHOLD"]
            })
        elif tx_1h >= self.config["VELOCITY_1H_THRESHOLD"]:
            triggered_rules.append({
                "category": "VELOCITY",
                "subcategory": "HIGH_HOURLY_VOLUME",
                "severity": "MEDIUM",
                "confidence": 0.75,
                "reason": f"{tx_1h} transactions occurred within 1 hour",
                "feature_values": {"transaction_count_1h": tx_1h},
                "threshold": self.config["VELOCITY_1H_THRESHOLD"]
            })

        # 3. GEOGRAPHIC
        # Rule: Large geographic displacement in impossible time
        speed = features.get("estimated_travel_speed_kmh", 0.0)
        if speed >= self.config["IMPOSSIBLE_TRAVEL_SPEED_KMH"]:
            triggered_rules.append({
                "category": "GEOGRAPHIC",
                "subcategory": "IMPOSSIBLE_TRAVEL",
                "severity": "CRITICAL",
                "confidence": 0.95,
                "reason": f"Impossible travel speed detected: {speed:.1f} km/h",
                "feature_values": {"estimated_travel_speed_kmh": speed},
                "threshold": self.config["IMPOSSIBLE_TRAVEL_SPEED_KMH"]
            })

        # 4. DEVICE
        # Rule: New device + unusual amount
        is_new_device = features.get("is_new_device", 0)
        if is_new_device and amt_vs_avg >= self.config["NEW_DEVICE_AMOUNT_MULTIPLIER"]:
            triggered_rules.append({
                "category": "DEVICE",
                "subcategory": "NEW_DEVICE_HIGH_SPEND",
                "severity": "HIGH",
                "confidence": 0.80,
                "reason": "Unusual spend amount originating from a new device",
                "feature_values": {"is_new_device": is_new_device, "amount_vs_customer_average": amt_vs_avg},
                "threshold": self.config["NEW_DEVICE_AMOUNT_MULTIPLIER"]
            })

        # 5. MERCHANT
        # Rule: New merchant with high 24h accumulated spend
        is_new_merch = features.get("is_new_merchant", 0)
        sum_24h = features.get("amount_sum_24h", 0.0)
        if is_new_merch and sum_24h >= self.config["NEW_MERCHANT_SUM_24H_THRESHOLD"]:
            triggered_rules.append({
                "category": "MERCHANT",
                "subcategory": "NEW_MERCHANT_VELOCITY",
                "severity": "MEDIUM",
                "confidence": 0.70,
                "reason": f"High 24h accumulated spend ({sum_24h}) at a new merchant",
                "feature_values": {"is_new_merchant": is_new_merch, "amount_sum_24h": sum_24h},
                "threshold": self.config["NEW_MERCHANT_SUM_24H_THRESHOLD"]
            })

        # 6. TIME_ANOMALY
        # Rule: Unusual transaction hour combined with a new location
        is_outside_hours = features.get("is_outside_typical_hours", 0)
        is_new_loc = features.get("is_new_location", 0)
        if is_outside_hours and is_new_loc:
            triggered_rules.append({
                "category": "TIME_ANOMALY",
                "subcategory": "OFF_HOURS_NEW_LOCATION",
                "severity": "MEDIUM",
                "confidence": 0.65,
                "reason": "Transaction outside typical hours in a previously unseen location",
                "feature_values": {"is_outside_typical_hours": is_outside_hours, "is_new_location": is_new_loc},
                "threshold": 1
            })

        # 7. CARD_TESTING
        # Rule: Microtransactions followed by high-value transaction or mass microtransactions
        seq_flag = features.get("micro_to_large_sequence", 0)
        micro_cnt = features.get("micro_transaction_count_5min", 0)
        if seq_flag:
            triggered_rules.append({
                "category": "CARD_TESTING",
                "subcategory": "MICRO_TO_LARGE_SEQUENCE",
                "severity": "CRITICAL",
                "confidence": 0.95,
                "reason": "Card testing sequence: microtransactions immediately followed by a large transaction",
                "feature_values": {"micro_to_large_sequence": seq_flag},
                "threshold": 1
            })
        elif micro_cnt >= self.config["CARD_TESTING_MICRO_COUNT"]:
            triggered_rules.append({
                "category": "CARD_TESTING",
                "subcategory": "MASS_MICRO_TRANSACTIONS",
                "severity": "HIGH",
                "confidence": 0.85,
                "reason": f"Multiple microtransactions ({micro_cnt}) detected in a 5-minute window",
                "feature_values": {"micro_transaction_count_5min": micro_cnt},
                "threshold": self.config["CARD_TESTING_MICRO_COUNT"]
            })

        # 8. BEHAVIORAL
        # Rule: Rapid escalation in spending behavior
        rapid_escalation = features.get("rapid_escalation_flag", 0)
        if rapid_escalation:
            triggered_rules.append({
                "category": "BEHAVIORAL",
                "subcategory": "RAPID_SPEND_ESCALATION",
                "severity": "HIGH",
                "confidence": 0.80,
                "reason": "Customer is exhibiting a rapid escalation in spending behavior",
                "feature_values": {"rapid_escalation_flag": rapid_escalation},
                "threshold": 1
            })

        # 9. NETWORK
        # Rule: Device associated with many cards
        dev_card_cnt = features.get("device_card_count", 0)
        if dev_card_cnt >= self.config["NETWORK_MAX_CARDS_PER_DEVICE"]:
            triggered_rules.append({
                "category": "NETWORK",
                "subcategory": "DEVICE_MULTI_CARD",
                "severity": "CRITICAL",
                "confidence": 0.90,
                "reason": f"Device is associated with an unusually high number of cards ({dev_card_cnt})",
                "feature_values": {"device_card_count": dev_card_cnt},
                "threshold": self.config["NETWORK_MAX_CARDS_PER_DEVICE"]
            })

        # 10. SEQUENTIAL
        # Rule: Repeated transactions of the exact same amount
        same_amt_cnt = features.get("same_amount_count_5min", 0)
        if same_amt_cnt >= self.config["SEQUENTIAL_SAME_AMOUNT_COUNT"]:
            triggered_rules.append({
                "category": "SEQUENTIAL",
                "subcategory": "REPEATED_AMOUNTS",
                "severity": "MEDIUM",
                "confidence": 0.70,
                "reason": f"{same_amt_cnt} transactions with the exact same amount in 5 minutes",
                "feature_values": {"same_amount_count_5min": same_amt_cnt},
                "threshold": self.config["SEQUENTIAL_SAME_AMOUNT_COUNT"]
            })

        return triggered_rules

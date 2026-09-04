import math
from datetime import timedelta, datetime
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import Dict, Any

from app.database.models import Transaction

def haversine(lat1, lon1, lat2, lon2):
    """Calculate distance in km between two points on Earth."""
    if lat1 is None or lon1 is None or lat2 is None or lon2 is None:
        return 0.0
    
    R = 6371.0 # Radius of Earth in km
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    
    a = (math.sin(dlat / 2)**2 + 
         math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon / 2)**2)
    
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c

class FeatureEngineer:
    def __init__(self, db: Session):
        self.db = db

    def compute_features(self, tx: Transaction) -> Dict[str, Any]:
        """
        Compute real-time features for a transaction.
        CRITICAL: Only uses event_time strictly prior to the current transaction to prevent data leakage.
        """
        features = {}
        signals = []
        
        # TIME FEATURES
        dt = tx.event_time
        features["hour"] = dt.hour
        features["day_of_week"] = dt.weekday()
        features["is_weekend"] = 1 if dt.weekday() >= 5 else 0
        features["is_night"] = 1 if (dt.hour < 6 or dt.hour > 22) else 0
        features["is_outside_typical_hours"] = features["is_night"]
        
        # TIME WINDOWS
        t_minus_1m = dt - timedelta(minutes=1)
        t_minus_5m = dt - timedelta(minutes=5)
        t_minus_15m = dt - timedelta(minutes=15)
        t_minus_1h = dt - timedelta(hours=1)
        t_minus_24h = dt - timedelta(hours=24)
        
        # AGGREGATIONS OVER PAST TRANSACTIONS (Strictly < dt)
        # We query the last 24h of customer transactions to compute velocity and windows efficiently
        recent_txs = self.db.query(Transaction).filter(
            Transaction.customer_id == tx.customer_id,
            Transaction.event_time < dt,
            Transaction.event_time >= t_minus_24h
        ).order_by(Transaction.event_time.desc()).all()
        
        # Previous transaction information
        prev_tx = recent_txs[0] if recent_txs else None
        
        if prev_tx:
            features["previous_amount"] = prev_tx.amount
            features["previous_city"] = prev_tx.city or "UNKNOWN"
            features["previous_device_id"] = prev_tx.device_id or "UNKNOWN"
            time_diff = (dt - prev_tx.event_time).total_seconds()
            features["time_since_previous_transaction_sec"] = time_diff
            
            # Location features (Geographic Distance & Velocity)
            dist_km = haversine(prev_tx.latitude, prev_tx.longitude, tx.latitude, tx.longitude)
            features["distance_from_previous_km"] = dist_km
            
            speed = 0.0
            if time_diff > 0:
                speed = dist_km / (time_diff / 3600.0)
            features["estimated_travel_speed_kmh"] = speed
            features["is_new_location"] = 1 if dist_km > 100 else 0
            
            if speed > 1000:
                signals.append("Impossible travel speed detected")
        else:
            features["previous_amount"] = 0.0
            features["previous_city"] = "UNKNOWN"
            features["previous_device_id"] = "UNKNOWN"
            features["time_since_previous_transaction_sec"] = 86400 * 30 # arbitrary large
            features["distance_from_previous_km"] = 0.0
            features["estimated_travel_speed_kmh"] = 0.0
            features["is_new_location"] = 1
        
        # VELOCITY & AMOUNT WINDOWS
        c_1m = c_5m = c_15m = c_1h = c_24h = 0
        s_1m = s_5m = s_15m = s_1h = s_24h = 0.0
        same_amt_5m = 0
        micro_5m = 0
        
        for r_tx in recent_txs:
            c_24h += 1
            s_24h += r_tx.amount
            
            if r_tx.event_time >= t_minus_1h:
                c_1h += 1
                s_1h += r_tx.amount
            if r_tx.event_time >= t_minus_15m:
                c_15m += 1
                s_15m += r_tx.amount
            if r_tx.event_time >= t_minus_5m:
                c_5m += 1
                s_5m += r_tx.amount
                if r_tx.amount == tx.amount:
                    same_amt_5m += 1
                if r_tx.amount < 5.0:
                    micro_5m += 1
            if r_tx.event_time >= t_minus_1m:
                c_1m += 1
                s_1m += r_tx.amount

        features["transaction_count_1min"] = c_1m
        features["transaction_count_5min"] = c_5m
        features["transaction_count_15min"] = c_15m
        features["transaction_count_1h"] = c_1h
        features["transaction_count_24h"] = c_24h
        
        features["amount_sum_1min"] = s_1m
        features["amount_sum_5min"] = s_5m
        features["amount_sum_15min"] = s_15m
        features["amount_sum_1h"] = s_1h
        features["amount_sum_24h"] = s_24h
        
        # Card Testing Patterns
        features["same_amount_count_5min"] = same_amt_5m
        features["micro_transaction_count_5min"] = micro_5m
        
        is_large = tx.amount > 500.0
        features["micro_to_large_sequence"] = 1 if (micro_5m > 0 and is_large) else 0
        features["small_amount_then_large_transaction"] = features["micro_to_large_sequence"]
        
        if c_5m >= 3:
            signals.append("High transaction velocity (5m)")
        if features["micro_to_large_sequence"]:
            signals.append("Card testing pattern: micro-transactions followed by large amount")
        
        # HISTORICAL BEHAVIOR (ALL TIME)
        all_time_stats = self.db.query(
            func.count(Transaction.transaction_id),
            func.avg(Transaction.amount),
            func.max(Transaction.amount)
        ).filter(
            Transaction.customer_id == tx.customer_id,
            Transaction.event_time < dt
        ).first()
        
        total_count = all_time_stats[0] or 0
        avg_amt = all_time_stats[1] or 0.0
        max_amt = all_time_stats[2] or 0.0
        
        features["customer_avg_amount"] = avg_amt
        features["customer_max_amount"] = max_amt
        features["customer_median_amount"] = avg_amt  # Approximation without complex percentile query
        
        features["amount_vs_customer_average"] = tx.amount / avg_amt if avg_amt > 0 else 0.0
        features["amount_vs_customer_median"] = features["amount_vs_customer_average"]
        
        # Z-Score
        if total_count >= 2:
            stddev_query = self.db.query(
                func.sum((Transaction.amount - avg_amt) * (Transaction.amount - avg_amt))
            ).filter(
                Transaction.customer_id == tx.customer_id,
                Transaction.event_time < dt
            ).scalar() or 0.0
            
            variance = stddev_query / (total_count - 1)
            stddev = math.sqrt(variance)
            features["amount_zscore"] = (tx.amount - avg_amt) / stddev if stddev > 0 else 0.0
        else:
            features["amount_zscore"] = 0.0
            
        features["historical_spending_deviation"] = features["amount_zscore"]
        features["rapid_escalation_flag"] = 1 if features["amount_zscore"] > 3.0 else 0
        
        if features["rapid_escalation_flag"]:
            signals.append("Rapid spending escalation")
            
        # DEVICE / NETWORK
        dev_stats = self.db.query(
            func.count(func.distinct(Transaction.card_id)),
            func.count(func.distinct(Transaction.customer_id))
        ).filter(
            Transaction.device_id == tx.device_id,
            Transaction.event_time < dt
        ).first()
        
        d_card_count = dev_stats[0] or 0
        d_cust_count = dev_stats[1] or 0
        
        features["is_new_device"] = 1 if d_cust_count == 0 else 0
        features["device_card_count"] = d_card_count
        features["device_customer_count"] = d_cust_count
        
        if d_card_count > 2:
            signals.append("Device linked to multiple cards")
            
        # MERCHANT
        merch_count = self.db.query(func.count(Transaction.transaction_id)).filter(
            Transaction.merchant_id == tx.merchant_id,
            Transaction.event_time < dt
        ).scalar() or 0
        
        features["is_new_merchant"] = 1 if merch_count == 0 else 0
        features["merchant_historical_count"] = merch_count
        
        if features["is_new_device"]:
            signals.append("First time using this device")
            
        return {
            "transaction_id": tx.transaction_id,
            "features": features,
            "feature_metadata": {
                "signals": signals
            }
        }

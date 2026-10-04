import os
import sys
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import random

def generate_data(num_rows, start_date):
    print(f"Generating {num_rows} transactions starting from {start_date}...")
    
    # Pools
    num_customers = max(100, int(num_rows * 0.1))
    customers = [f"CUST_{str(i).zfill(6)}" for i in range(num_customers)]
    cards = [f"CARD_{str(i).zfill(6)}" for i in range(int(num_customers * 1.5))]
    merchants = [f"MERCH_{str(i).zfill(4)}" for i in range(max(50, int(num_rows * 0.02)))]
    merchant_categories = ["Retail", "Food", "Travel", "Entertainment", "Utilities", "Online_Shopping", "Electronics", "Groceries", "Gaming"]
    merchant_cats = {m: random.choice(merchant_categories) for m in merchants}
    
    devices = [f"DEV_{str(i).zfill(5)}" for i in range(int(num_customers * 1.2))]
    locations = [
        ("IN", "Maharashtra", "Mumbai"), ("IN", "Delhi", "Delhi"), ("IN", "Karnataka", "Bengaluru"),
        ("IN", "Tamil Nadu", "Chennai"), ("US", "California", "San Francisco"), ("US", "New York", "New York"),
        ("UK", "London", "London"), ("SG", "Singapore", "Singapore")
    ]
    
    transactions = []
    
    current_time = start_date
    
    for i in range(num_rows):
        current_time += timedelta(seconds=random.randint(5, 120))
        tx_id = f"TXN_{str(i).zfill(8)}"
        cust_id = random.choice(customers)
        is_fraud = random.random() < 0.1  # 10% overall fraud rate
        
        # Base legit values
        amt = round(random.uniform(5.0, 500.0), 2)
        cat = "NONE"
        subcat = "NONE"
        
        if is_fraud:
            # Assign a specific fraud scenario
            scenario = random.choice(["VELOCITY", "TIME_ANOMALY", "IMPOSSIBLE_TRAVEL", "HIGH_AMOUNT", "STRUCTURING"])
            cat = scenario
            
            if scenario == "VELOCITY":
                # multiple fast txns
                subcat = "CARD_TESTING"
                amt = round(random.uniform(1.0, 10.0), 2)
            elif scenario == "TIME_ANOMALY":
                subcat = "MIDNIGHT_PURCHASE"
                amt = round(random.uniform(100.0, 1000.0), 2)
                # Force time to midnight
                current_time = current_time.replace(hour=random.randint(1,4))
            elif scenario == "IMPOSSIBLE_TRAVEL":
                subcat = "LOCATION_SPOOF"
                amt = round(random.uniform(50.0, 300.0), 2)
            elif scenario == "HIGH_AMOUNT":
                subcat = "ACCOUNT_TAKEOVER"
                amt = round(random.uniform(3000.0, 15000.0), 2)
            elif scenario == "STRUCTURING":
                subcat = "SMURFING"
                amt = round(random.uniform(9900.0, 9999.0), 2)
                
        loc = random.choice(locations)
        
        row = {
            "transaction_id": tx_id,
            "customer_id": cust_id,
            "card_id": random.choice(cards),
            "account_id": f"ACC_{cust_id.split('_')[1]}",
            "event_time": current_time.isoformat(),
            "ingestion_timestamp": (current_time + timedelta(milliseconds=random.randint(100, 500))).isoformat(),
            "amount": amt,
            "currency": "USD",
            "transaction_type": "PURCHASE",
            "payment_channel": random.choice(["ONLINE", "POS", "ATM"]),
            "card_present": random.choice([True, False]),
            "international_transaction": random.random() < 0.05,
            "merchant_id": random.choice(merchants),
            "device_id": random.choice(devices),
            "country": loc[0],
            "state": loc[1],
            "city": loc[2],
            "is_fraud": int(is_fraud),
            "fraud_category": cat,
            "fraud_subcategory": subcat
        }
        
        row["merchant_category"] = merchant_cats[row["merchant_id"]]
        transactions.append(row)
        
        if (i+1) % 10000 == 0:
            print(f"Generated {i+1} rows...")
            
    df = pd.DataFrame(transactions)
    return df

def generate_live_stream_data():
    print("Generating custom live stream sequence...")
    # Every 20 transactions: 2 fraud (High/Critical), 5 medium risk (borderline), 13 low risk
    # Medium risk usually means moderately high amount, unusual category, but not quite fraud threshold, or just a known medium risk scenario.
    
    # We will generate 1000 rows (50 blocks of 20)
    
    customers = [f"LIVE_CUST_{str(i).zfill(4)}" for i in range(100)]
    merchants = [f"LIVE_MERCH_{str(i).zfill(4)}" for i in range(20)]
    merchant_categories = ["Retail", "Food", "Travel", "Entertainment", "Utilities"]
    merchant_cats = {m: random.choice(merchant_categories) for m in merchants}
    locations = [("US", "NY", "New York"), ("US", "CA", "Los Angeles"), ("UK", "London", "London")]
    
    transactions = []
    current_time = datetime.utcnow() - timedelta(hours=1)
    
    tx_idx = 0
    
    for block in range(50):
        block_txs = []
        
        # 13 Low
        for _ in range(13):
            loc = random.choice(locations)
            block_txs.append({
                "type": "LOW",
                "amt": round(random.uniform(5, 50), 2),
                "is_fraud": 0,
                "cat": "NONE",
                "subcat": "NONE",
                "loc": loc
            })
            
        # 5 Medium (Unusual but not strictly fraud, maybe international or slightly high amount)
        for _ in range(5):
            loc = random.choice(locations)
            block_txs.append({
                "type": "MEDIUM",
                "amt": round(random.uniform(500, 1500), 2),
                "is_fraud": 0,  # Medium risk doesn't have to be fraud, it's just risky
                "cat": "NONE",
                "subcat": "NONE",
                "loc": loc,
                "international": True
            })
            
        # 2 Fraud
        fraud_scenarios = [
            ("VELOCITY", "RAPID_SUCCESSION", round(random.uniform(50, 200), 2)),
            ("IMPOSSIBLE_TRAVEL", "LOCATION_SPOOF", round(random.uniform(200, 800), 2)),
            ("HIGH_AMOUNT", "AMOUNT_ANOMALY", round(random.uniform(5000, 15000), 2)),
            ("TIME_ANOMALY", "MIDNIGHT_PURCHASE", round(random.uniform(1000, 3000), 2)),
            ("DEVICE_ANOMALY", "NEW_DEVICE", round(random.uniform(300, 900), 2)),
            ("MERCHANT_ANOMALY", "HIGH_RISK_MERCHANT", round(random.uniform(100, 500), 2)),
            ("CARD_TESTING", "MICRO_TRANSACTIONS", round(random.uniform(1, 5), 2)),
            ("STRUCTURING", "BEHAVIORAL_ANOMALY", round(random.uniform(9900, 9999), 2)),
            ("NETWORK_ANOMALY", "VPN_PROXY_USAGE", round(random.uniform(400, 1200), 2)),
            ("SEQUENTIAL_ANOMALY", "SUSPICIOUS_SEQUENCE", round(random.uniform(1500, 4500), 2))
        ]
        
        f1 = random.choice(fraud_scenarios)
        f2 = random.choice([f for f in fraud_scenarios if f[0] != f1[0]]) # ensure different
        
        for f in [f1, f2]:
            block_txs.append({
                "type": "FRAUD",
                "amt": f[2],
                "is_fraud": 1,
                "cat": f[0],
                "subcat": f[1],
                "loc": random.choice(locations)
            })
            
        random.shuffle(block_txs) # Shuffle within the block
        
        for tx in block_txs:
            current_time += timedelta(seconds=random.randint(10, 30))
            if tx["cat"] == "TIME_ANOMALY":
                current_time = current_time.replace(hour=3) # midnight anomaly
                
            merch = random.choice(merchants)
            row = {
                "transaction_id": f"LIVE_TXN_{str(tx_idx).zfill(6)}",
                "customer_id": random.choice(customers),
                "card_id": f"CARD_{random.randint(1000,9999)}",
                "account_id": f"ACC_{random.randint(100,999)}",
                "event_time": current_time.isoformat(),
                "ingestion_timestamp": (current_time + timedelta(milliseconds=200)).isoformat(),
                "amount": tx["amt"],
                "currency": "USD",
                "transaction_type": "PURCHASE",
                "payment_channel": "ONLINE",
                "card_present": False,
                "international_transaction": tx.get("international", False),
                "merchant_id": merch,
                "merchant_category": merchant_cats[merch],
                "device_id": f"DEV_{random.randint(100,999)}",
                "country": tx["loc"][0],
                "state": tx["loc"][1],
                "city": tx["loc"][2],
                "is_fraud": tx["is_fraud"],
                "fraud_category": tx["cat"],
                "fraud_subcategory": tx["subcat"]
            }
            transactions.append(row)
            tx_idx += 1
            
    return pd.DataFrame(transactions)

if __name__ == "__main__":
    out_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "data", "raw"))
    os.makedirs(out_dir, exist_ok=True)
    
    # 1. Historical Data (100k)
    # Start date 90 days ago so we have historical data for trends
    start_date = datetime.utcnow() - timedelta(days=90)
    df_hist = generate_data(100000, start_date)
    
    raw_path = os.path.join(out_dir, "raw_transactions_100000.csv")
    label_path = os.path.join(out_dir, "fraud_labels_100000.csv")
    
    df_hist.drop(columns=["is_fraud", "fraud_category", "fraud_subcategory"]).to_csv(raw_path, index=False)
    df_hist[["transaction_id", "is_fraud", "fraud_category", "fraud_subcategory"]].to_csv(label_path, index=False)
    
    print(f"Saved 100k dataset to {raw_path} and {label_path}")
    
    # 2. Live Stream Data (1000 rows, specific distribution)
    df_live = generate_live_stream_data()
    live_path = os.path.join(out_dir, "live_stream_sample_1000.csv")
    # For simulator, we keep the labels in the same file
    df_live.rename(columns={"event_time": "timestamp"}).to_csv(live_path, index=False)
    print(f"Saved Live Stream dataset to {live_path}")

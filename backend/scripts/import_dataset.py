import os
import sys
import pandas as pd
import numpy as np
from sqlalchemy.orm import Session
from datetime import datetime

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
from app.database.database import SessionLocal, engine, Base
from app.database.models import Transaction, FraudLabel, SystemEvent

# Define paths
POSSIBLE_PATHS = [
    "../credit_card_fraud_dataset",
    "../../credit_card_fraud_dataset",
    "../data/raw",
    "../../data/raw",
    "credit_card_fraud_dataset"
]

def find_file(filename):
    for path in POSSIBLE_PATHS:
        full_path = os.path.join(os.path.dirname(__file__), path, filename)
        if os.path.exists(full_path):
            return full_path
    
    # Check data/training for labels
    for path in ["../data/training", "../../data/training"]:
        full_path = os.path.join(os.path.dirname(__file__), path, filename)
        if os.path.exists(full_path):
            return full_path
            
    print(f"Could not find {filename}")
    return None

def import_data():
    raw_tx_path = find_file("raw_transactions_15000.csv")
    labels_path = find_file("fraud_labels_15000.csv")

    if not raw_tx_path or not labels_path:
        print("Required dataset files not found.")
        sys.exit(1)

    print("Loading data...")
    df_tx = pd.read_csv(raw_tx_path)
    df_labels = pd.read_csv(labels_path)

    # Pre-validation stats
    initial_tx_count = len(df_tx)

    print("Validating schema...")
    # Schema validation and renaming
    df_tx = df_tx.rename(columns={'timestamp': 'event_time', 'ingestion_timestamp': 'ingestion_time'})
    
    required_tx_columns = ['transaction_id', 'customer_id', 'card_id', 'account_id', 'event_time', 'amount', 'currency', 'transaction_type', 'payment_channel', 'merchant_id', 'merchant_category']
    for col in required_tx_columns:
        if col not in df_tx.columns:
            print(f"Missing required column: {col}")
            sys.exit(1)

    print("Datatype validation...")
    df_tx['event_time'] = pd.to_datetime(df_tx['event_time'], errors='coerce')
    df_tx['amount'] = pd.to_numeric(df_tx['amount'], errors='coerce')

    print("Missing-value analysis...")
    missing_before = df_tx.isnull().sum().sum()
    df_tx = df_tx.dropna(subset=['transaction_id', 'customer_id', 'event_time', 'amount'])
    missing_after = df_tx.isnull().sum().sum()

    print("Duplicate detection...")
    duplicates_count = df_tx.duplicated(subset=['transaction_id']).sum()
    df_tx = df_tx.drop_duplicates(subset=['transaction_id'])

    # Handle datatypes
    # The individual to_pydatetime() conversion is handled safely during the dictionary loop below
    
    # Data Leakage Protection
    # Exclude any feature that depends on ground-truth label directly
    leakage_cols = ['is_fraud', 'fraud_category', 'fraud_subcategory', 'card_previous_fraud_count', 'device_previous_fraud_count', 'merchant_previous_fraud_count']
    for col in leakage_cols:
        if col in df_tx.columns:
            df_tx = df_tx.drop(columns=[col])

    # Import to DB
    print("Importing into database...")
    Base.metadata.create_all(bind=engine)
    db: Session = SessionLocal()
    
    # Import Transactions
    imported_tx_count = 0
    rejected_tx_count = initial_tx_count - len(df_tx)
    
    # To speed up, we can use bulk insert but we need to convert NaN to None
    df_tx = df_tx.replace({np.nan: None})
    
    # Extract only matching columns
    tx_records = df_tx.to_dict(orient='records')
    valid_tx_keys = [c.name for c in Transaction.__table__.columns]
    
    tx_to_insert = []
    for r in tx_records:
        clean_r = {k: v for k, v in r.items() if k in valid_tx_keys}
        # Add boolean conversions if needed
        clean_r['card_present'] = bool(clean_r.get('card_present', False))
        clean_r['international_transaction'] = bool(clean_r.get('international_transaction', False))
        clean_r['is_recurring'] = bool(clean_r.get('is_recurring', False))
        
        if clean_r.get('event_time'):
            if isinstance(clean_r['event_time'], str):
                clean_r['event_time'] = pd.to_datetime(clean_r['event_time']).to_pydatetime()
            elif isinstance(clean_r['event_time'], pd.Timestamp):
                clean_r['event_time'] = clean_r['event_time'].to_pydatetime()
                
        if clean_r.get('ingestion_time'):
            if isinstance(clean_r['ingestion_time'], str):
                clean_r['ingestion_time'] = pd.to_datetime(clean_r['ingestion_time']).to_pydatetime()
            elif isinstance(clean_r['ingestion_time'], pd.Timestamp):
                clean_r['ingestion_time'] = clean_r['ingestion_time'].to_pydatetime()
                
        tx_to_insert.append(clean_r)
    
    # Truncate tables for clean import
    db.query(Transaction).delete()
    db.query(FraudLabel).delete()
    db.commit()

    # Bulk insert
    db.bulk_insert_mappings(Transaction, tx_to_insert)
    imported_tx_count = len(tx_to_insert)

    # Import Labels
    df_labels = df_labels.drop_duplicates(subset=['transaction_id'])
    df_labels = df_labels[df_labels['transaction_id'].isin(df_tx['transaction_id'])]
    df_labels = df_labels.replace({np.nan: None})
    label_records = df_labels.to_dict(orient='records')
    valid_label_keys = [c.name for c in FraudLabel.__table__.columns]
    
    labels_to_insert = []
    fraud_count = 0
    legit_count = 0
    
    for r in label_records:
        clean_r = {k: v for k, v in r.items() if k in valid_label_keys}
        is_f = bool(clean_r.get('is_fraud', False))
        clean_r['is_fraud'] = is_f
        clean_r['label_status'] = 'CONFIRMED_FRAUD' if is_f else 'CONFIRMED_LEGIT'
        clean_r['label_source'] = 'historical_import'
        labels_to_insert.append(clean_r)
        
        if is_f:
            fraud_count += 1
        else:
            legit_count += 1

    db.bulk_insert_mappings(FraudLabel, labels_to_insert)
    
    # Calculate Uniques
    unique_customers = df_tx['customer_id'].nunique()
    unique_cards = df_tx['card_id'].nunique() if 'card_id' in df_tx.columns else 0
    unique_devices = df_tx['device_id'].nunique() if 'device_id' in df_tx.columns else 0
    unique_merchants = df_tx['merchant_id'].nunique() if 'merchant_id' in df_tx.columns else 0
    
    fraud_percentage = (fraud_count / (fraud_count + legit_count) * 100) if (fraud_count + legit_count) > 0 else 0

    # Log to SystemEvents
    report_msg = (
        f"Imported {imported_tx_count} rows. "
        f"Fraud: {fraud_count}, Legit: {legit_count} ({fraud_percentage:.2f}%). "
        f"Duplicates: {duplicates_count}."
    )
    event = SystemEvent(
        event_type="dataset_import",
        message=report_msg,
        severity="info"
    )
    db.add(event)
    db.commit()

    db.close()

    print("\n==================================================")
    print("IMPORT REPORT")
    print("==================================================")
    print(f"Rows imported:     {imported_tx_count}")
    print(f"Rows rejected:     {rejected_tx_count}")
    print(f"Duplicates:        {duplicates_count}")
    print(f"Missing values:    {missing_before - missing_after} resolved")
    print(f"Fraud count:       {fraud_count}")
    print(f"Legitimate count:  {legit_count}")
    print(f"Fraud percentage:  {fraud_percentage:.2f}%")
    print(f"Unique customers:  {unique_customers}")
    print(f"Unique cards:      {unique_cards}")
    print(f"Unique devices:    {unique_devices}")
    print(f"Unique merchants:  {unique_merchants}")
    print("==================================================\n")

if __name__ == "__main__":
    import_data()

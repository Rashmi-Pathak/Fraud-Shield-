import os
import sys
import uuid
import joblib
import pandas as pd
import numpy as np
from datetime import datetime

from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier, IsolationForest
from xgboost import XGBClassifier
from sklearn.metrics import (
    precision_score, recall_score, f1_score, 
    roc_auc_score, average_precision_score, confusion_matrix
)

# Add backend directory to python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database.database import SessionLocal
from app.database.models import Transaction, FraudLabel, ModelVersion
from app.ml.feature_engineering import FeatureEngineer

def create_directories():
    base = "models"
    for d in ["xgboost", "random_forest", "isolation_forest", "baseline"]:
        os.makedirs(os.path.join(base, d), exist_ok=True)

def extract_data_and_features(db):
    print("Fetching transactions ordered by time...")
    transactions = db.query(Transaction, FraudLabel).outerjoin(
        FraudLabel, Transaction.transaction_id == FraudLabel.transaction_id
    ).order_by(Transaction.event_time.asc()).all()

    print(f"Loaded {len(transactions)} transactions. Computing features...")
    
    engineer = FeatureEngineer(db)
    
    feature_records = []
    labels = []
    
    for i, (tx, label) in enumerate(transactions):
        if i % 1000 == 0 and i > 0:
            print(f"Computed {i} / {len(transactions)}")
            
        feat_dict = engineer.compute_features(tx)["features"]
        feature_records.append(feat_dict)
        labels.append(1 if label and label.is_fraud else 0)
        
    df_features = pd.DataFrame(feature_records)
    y = np.array(labels)
    
    return df_features, y

def evaluate_model(y_true, y_pred, y_prob):
    cm = confusion_matrix(y_true, y_pred)
    if cm.shape == (2, 2):
        tn, fp, fn, tp = cm.ravel()
    else:
        tn, fp, fn, tp = 0, 0, 0, 0 # Fallback
        
    fpr = fp / (fp + tn) if (fp + tn) > 0 else 0.0
    
    metrics = {
        "precision": float(precision_score(y_true, y_pred, zero_division=0)),
        "recall": float(recall_score(y_true, y_pred, zero_division=0)),
        "f1_score": float(f1_score(y_true, y_pred, zero_division=0)),
        "roc_auc": float(roc_auc_score(y_true, y_prob)),
        "pr_auc": float(average_precision_score(y_true, y_prob)),
        "false_positive_rate": float(fpr)
    }
    return metrics

def tune_threshold(y_val, y_prob_val):
    best_thresh = 0.5
    best_f1 = 0.0
    for thresh in np.arange(0.1, 0.9, 0.05):
        preds = (y_prob_val >= thresh).astype(int)
        f1 = f1_score(y_val, preds, zero_division=0)
        if f1 > best_f1:
            best_f1 = f1
            best_thresh = thresh
    return float(best_thresh)

def save_model_registry(db, name, path, metrics, threshold, is_production=False):
    # Deactivate existing active models if this is the new active one
    if is_production:
        db.query(ModelVersion).filter(ModelVersion.is_production == True).update({"is_production": False})
        
    version_str = datetime.now().strftime("v%Y%m%d_%H%M%S") + f"_{uuid.uuid4().hex[:4]}"
    mv = ModelVersion(
        model_name=name,
        version=version_str,
        training_rows=10500,
        training_date=datetime.now(),
        precision=metrics["precision"],
        recall=metrics["recall"],
        f1=metrics["f1_score"],
        roc_auc=metrics["roc_auc"],
        pr_auc=metrics["pr_auc"],
        model_path=path,
        is_production=is_production
    )
    db.add(mv)
    db.commit()

def main():
    create_directories()
    db = SessionLocal()
    
    df_X, y = extract_data_and_features(db)
    
    # Chronological Split (70 / 15 / 15)
    n = len(df_X)
    train_end = int(n * 0.7)
    val_end = int(n * 0.85)
    
    X_train, y_train = df_X.iloc[:train_end], y[:train_end]
    X_val, y_val = df_X.iloc[train_end:val_end], y[train_end:val_end]
    X_test, y_test = df_X.iloc[val_end:], y[val_end:]
    
    # Drop string/object columns (like previous_city, previous_device_id)
    numeric_cols = X_train.select_dtypes(include=[np.number]).columns.tolist()
    X_train = X_train[numeric_cols]
    X_val = X_val[numeric_cols]
    X_test = X_test[numeric_cols]
    
    print(f"Data Split: Train {len(X_train)}, Val {len(X_val)}, Test {len(X_test)}")
    print(f"Using {len(numeric_cols)} numeric features.")
    
    # Feature Schema & Preprocessor
    # All features are numeric. We apply StandardScaler for Baseline, others handle it well natively but standardizing is safe.
    scaler = StandardScaler()
    scaler.fit(X_train)
    
    # Pre-scale for Baseline & Isolation Forest
    X_train_s = scaler.transform(X_train)
    X_val_s = scaler.transform(X_val)
    X_test_s = scaler.transform(X_test)
    
    joblib.dump(scaler, "models/preprocessor.joblib")
    schema = numeric_cols
    joblib.dump(schema, "models/feature_schema.joblib")
    
    # ==================================================
    # 1. BASELINE (Logistic Regression)
    # ==================================================
    print("\nTraining Logistic Regression Baseline...")
    lr = LogisticRegression(class_weight='balanced', max_iter=1000)
    lr.fit(X_train_s, y_train)
    y_prob_lr = lr.predict_proba(X_test_s)[:, 1]
    
    # Tune on val
    y_prob_val_lr = lr.predict_proba(X_val_s)[:, 1]
    lr_thresh = tune_threshold(y_val, y_prob_val_lr)
    
    y_pred_lr = (y_prob_lr >= lr_thresh).astype(int)
    lr_metrics = evaluate_model(y_test, y_pred_lr, y_prob_lr)
    
    lr_path = "models/baseline/model.joblib"
    joblib.dump(lr, lr_path)
    save_model_registry(db, "LogisticRegression", lr_path, lr_metrics, lr_thresh, is_production=False)
    
    print(f"LR Metrics: {lr_metrics}")

    # ==================================================
    # 2. RANDOM FOREST
    # ==================================================
    print("\nTraining Random Forest...")
    rf = RandomForestClassifier(n_estimators=100, class_weight='balanced', random_state=42, n_jobs=-1)
    rf.fit(X_train, y_train)
    y_prob_rf = rf.predict_proba(X_test)[:, 1]
    
    y_prob_val_rf = rf.predict_proba(X_val)[:, 1]
    rf_thresh = tune_threshold(y_val, y_prob_val_rf)
    
    y_pred_rf = (y_prob_rf >= rf_thresh).astype(int)
    rf_metrics = evaluate_model(y_test, y_pred_rf, y_prob_rf)
    
    rf_path = "models/random_forest/model.joblib"
    joblib.dump(rf, rf_path)
    save_model_registry(db, "RandomForest", rf_path, rf_metrics, rf_thresh, is_production=False)
    
    print(f"RF Metrics: {rf_metrics}")

    # ==================================================
    # 3. XGBOOST
    # ==================================================
    print("\nTraining XGBoost...")
    # Handle imbalance via scale_pos_weight
    ratio = float(np.sum(y_train == 0)) / np.sum(y_train == 1) if np.sum(y_train == 1) > 0 else 1.0
    xgb_model = XGBClassifier(n_estimators=200, scale_pos_weight=ratio, random_state=42, eval_metric="logloss")
    
    # We can use early stopping with eval_set
    xgb_model.fit(X_train, y_train, eval_set=[(X_val, y_val)], verbose=False)
    
    y_prob_xgb = xgb_model.predict_proba(X_test)[:, 1]
    
    y_prob_val_xgb = xgb_model.predict_proba(X_val)[:, 1]
    xgb_thresh = tune_threshold(y_val, y_prob_val_xgb)
    
    y_pred_xgb = (y_prob_xgb >= xgb_thresh).astype(int)
    xgb_metrics = evaluate_model(y_test, y_pred_xgb, y_prob_xgb)
    
    xgb_path = "models/xgboost/model.joblib"
    joblib.dump(xgb_model, xgb_path)
    # Set XGBoost as Active/Production
    save_model_registry(db, "XGBoost", xgb_path, xgb_metrics, xgb_thresh, is_production=True)
    
    print(f"XGB Metrics: {xgb_metrics}")
    
    # Save Threshold config
    threshold_config = {"xgboost_threshold": xgb_thresh}
    joblib.dump(threshold_config, "models/threshold_config.joblib")

    # ==================================================
    # 4. ISOLATION FOREST
    # ==================================================
    print("\nTraining Isolation Forest...")
    # Train only on normal data for better anomaly detection, or all train data? IF handles all.
    iso_f = IsolationForest(contamination=0.1, random_state=42)
    iso_f.fit(X_train_s)
    
    # Anomaly detector outputs negative scores where lower = more anomalous
    scores_test = iso_f.score_samples(X_test_s)
    scores_val = iso_f.score_samples(X_val_s)
    
    # Normalize to [0, 1] as a pseudo-probability for the risk engine
    # Using training data min/max to prevent data leakage in scaling
    scores_train = iso_f.score_samples(X_train_s)
    max_score = scores_train.max()
    min_score = scores_train.min()
    
    # Normalized: 1 = most anomalous, 0 = normal
    # scores_train is higher for normal, lower for anomalous.
    # So inverted: norm = (max - score) / (max - min)
    def normalize_scores(s):
        ns = (max_score - s) / (max_score - min_score + 1e-9)
        return np.clip(ns, 0.0, 1.0)
        
    norm_val = normalize_scores(scores_val)
    norm_test = normalize_scores(scores_test)
    
    iso_thresh = tune_threshold(y_val, norm_val)
    y_pred_iso = (norm_test >= iso_thresh).astype(int)
    iso_metrics = evaluate_model(y_test, y_pred_iso, norm_test)
    
    iso_path = "models/isolation_forest/model.joblib"
    joblib.dump(iso_f, iso_path)
    joblib.dump({"min": min_score, "max": max_score}, "models/isolation_forest/norm_params.joblib")
    
    save_model_registry(db, "IsolationForest", iso_path, iso_metrics, iso_thresh, is_production=False)
    print(f"IF Metrics: {iso_metrics}")

    print("\nTraining pipeline complete!")

if __name__ == "__main__":
    main()

"""Train and optionally promote a candidate model from confirmed analyst labels.

This script never uses predictions as labels and never changes production artifacts
unless --promote is supplied and the candidate passes every configured gate.
"""

import argparse
import json
import os
import re
import shutil
import sys
from datetime import datetime

import joblib
import numpy as np
import pandas as pd
from sklearn.metrics import average_precision_score, confusion_matrix, f1_score, precision_score, recall_score, roc_auc_score
from sklearn.preprocessing import StandardScaler
from xgboost import XGBClassifier

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database.database import SessionLocal
from app.database.models import FraudLabel, ModelVersion, Transaction
from app.ml.feature_engineering import FeatureEngineer
from app.services.feedback_service import CONFIRMED_STATUSES


BACKEND_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MODELS_ROOT = os.path.join(BACKEND_ROOT, "models")
MODEL_NAME = "XGBoost"
MIN_IMPROVEMENT = float(os.getenv("RETRAIN_MIN_IMPROVEMENT", "0"))


def confirmed_dataset(db):
    rows = (
        db.query(Transaction, FraudLabel)
        .join(FraudLabel, FraudLabel.transaction_id == Transaction.transaction_id)
        .filter(FraudLabel.label_status.in_(CONFIRMED_STATUSES))
        .filter(FraudLabel.is_fraud.isnot(None))
        .order_by(Transaction.event_time.asc())
        .all()
    )
    if not rows:
        raise RuntimeError("No confirmed labels are available for retraining")

    engineer = FeatureEngineer(db)
    records = []
    labels = []
    for transaction, label in rows:
        records.append(engineer.compute_features(transaction)["features"])
        labels.append(int(label.is_fraud))

    features = pd.DataFrame(records)
    numeric_columns = features.select_dtypes(include=[np.number]).columns.tolist()
    if not numeric_columns:
        raise RuntimeError("Confirmed dataset has no numeric features")
    return features[numeric_columns], np.asarray(labels, dtype=int), len(rows)


def split_dataset(features, labels):
    if len(features) < 6:
        raise RuntimeError("At least 6 confirmed transactions are required for train/validation/test splits")
    train_end = int(len(features) * 0.70)
    validation_end = int(len(features) * 0.85)
    splits = (
        (features.iloc[:train_end], labels[:train_end]),
        (features.iloc[train_end:validation_end], labels[train_end:validation_end]),
        (features.iloc[validation_end:], labels[validation_end:]),
    )
    if any(len(np.unique(y)) < 2 for _, y in splits):
        raise RuntimeError("Train, validation, and test splits must each contain both confirmed classes")
    return splits


def metrics(y_true, probabilities, threshold):
    predictions = (probabilities >= threshold).astype(int)
    tn, fp, _, _ = confusion_matrix(y_true, predictions, labels=[0, 1]).ravel()
    return {
        "pr_auc": float(average_precision_score(y_true, probabilities)),
        "recall": float(recall_score(y_true, predictions, zero_division=0)),
        "precision": float(precision_score(y_true, predictions, zero_division=0)),
        "f1": float(f1_score(y_true, predictions, zero_division=0)),
        "false_positive_rate": float(fp / (fp + tn)) if (fp + tn) else 0.0,
        "roc_auc": float(roc_auc_score(y_true, probabilities)),
    }


def select_threshold(y_true, probabilities):
    thresholds = np.arange(0.10, 0.91, 0.05)
    return float(max(thresholds, key=lambda threshold: f1_score(y_true, probabilities >= threshold, zero_division=0)))


def evaluate_model(model, features, labels, threshold):
    return metrics(labels, model.predict_proba(features)[:, 1], threshold)


def next_version(db):
    versions = [row.version for row in db.query(ModelVersion).filter(ModelVersion.model_name == MODEL_NAME).all()]
    parsed = []
    for version in versions:
        match = re.fullmatch(r"v(\d+)\.(\d+)", version or "")
        if match:
            parsed.append((int(match.group(1)), int(match.group(2))))
    if not parsed:
        return "v1.0"
    major, minor = max(parsed)
    return f"v{major}.{minor + 1}"


def production_metrics(features, labels):
    path = os.path.join(MODELS_ROOT, "xgboost", "model.joblib")
    schema_path = os.path.join(MODELS_ROOT, "feature_schema.joblib")
    if not os.path.exists(path) or not os.path.exists(schema_path):
        return None
    try:
        schema = joblib.load(schema_path)
        model = joblib.load(path)
        frame = features.reindex(columns=schema, fill_value=0)
        threshold_path = os.path.join(MODELS_ROOT, "threshold_config.joblib")
        threshold = joblib.load(threshold_path).get("xgboost_threshold", 0.5) if os.path.exists(threshold_path) else 0.5
        return evaluate_model(model, frame, labels, threshold)
    except Exception as exc:
        raise RuntimeError(f"Production model could not be evaluated: {exc}") from exc


def compare(candidate, production):
    if production is None:
        return {"passed": True, "reason": "No production model is configured", "checks": {}}
    checks = {
        "pr_auc": candidate["pr_auc"] >= production["pr_auc"] + MIN_IMPROVEMENT,
        "recall": candidate["recall"] >= production["recall"] + MIN_IMPROVEMENT,
        "precision": candidate["precision"] >= production["precision"] + MIN_IMPROVEMENT,
        "f1": candidate["f1"] >= production["f1"] + MIN_IMPROVEMENT,
        "false_positive_rate": candidate["false_positive_rate"] <= production["false_positive_rate"] - MIN_IMPROVEMENT,
    }
    strictly_better = (
        candidate["pr_auc"] > production["pr_auc"] + MIN_IMPROVEMENT
        or candidate["recall"] > production["recall"] + MIN_IMPROVEMENT
        or candidate["precision"] > production["precision"] + MIN_IMPROVEMENT
        or candidate["f1"] > production["f1"] + MIN_IMPROVEMENT
        or candidate["false_positive_rate"] < production["false_positive_rate"] - MIN_IMPROVEMENT
    )
    return {"passed": all(checks.values()) and strictly_better, "checks": checks}


def promote(db, version, candidate_path, threshold):
    production_dir = os.path.join(MODELS_ROOT, "xgboost")
    os.makedirs(production_dir, exist_ok=True)
    shutil.copy2(candidate_path, os.path.join(production_dir, "model.joblib"))
    joblib.dump({"xgboost_threshold": threshold}, os.path.join(MODELS_ROOT, "threshold_config.joblib"))
    db.query(ModelVersion).filter(ModelVersion.model_name == MODEL_NAME).update({"is_production": False})
    row = db.query(ModelVersion).filter(ModelVersion.version == version).one()
    row.is_production = True
    db.commit()


def run(promote_candidate=False):
    db = SessionLocal()
    try:
        features, labels, row_count = confirmed_dataset(db)
        (x_train, y_train), (x_validation, y_validation), (x_test, y_test) = split_dataset(features, labels)
        scaler = StandardScaler().fit(x_train)
        ratio = float(np.sum(y_train == 0)) / float(np.sum(y_train == 1))
        candidate_model = XGBClassifier(
            n_estimators=200,
            scale_pos_weight=ratio,
            random_state=42,
            eval_metric="logloss",
        )
        candidate_model.fit(x_train, y_train, eval_set=[(x_validation, y_validation)], verbose=False)
        threshold = select_threshold(y_validation, candidate_model.predict_proba(x_validation)[:, 1])
        candidate_metrics = evaluate_model(candidate_model, x_test, y_test, threshold)

        # The scaler is trained and saved with the candidate for reproducibility,
        # although XGBoost itself consumes the unscaled numeric feature frame.
        version = next_version(db)
        candidate_dir = os.path.join(MODELS_ROOT, "candidates", version, "xgboost")
        os.makedirs(candidate_dir, exist_ok=False)
        candidate_path = os.path.join(candidate_dir, "model.joblib")
        joblib.dump(candidate_model, candidate_path)
        joblib.dump(scaler, os.path.join(MODELS_ROOT, "candidates", version, "preprocessor.joblib"))
        joblib.dump(list(features.columns), os.path.join(MODELS_ROOT, "candidates", version, "feature_schema.joblib"))
        joblib.dump({"xgboost_threshold": threshold}, os.path.join(MODELS_ROOT, "candidates", version, "threshold_config.joblib"))

        production = production_metrics(x_test, y_test)
        comparison = compare(candidate_metrics, production)
        registry_row = ModelVersion(
            model_name=MODEL_NAME,
            version=version,
            training_rows=row_count,
            training_date=datetime.utcnow(),
            precision=candidate_metrics["precision"],
            recall=candidate_metrics["recall"],
            f1=candidate_metrics["f1"],
            roc_auc=candidate_metrics["roc_auc"],
            pr_auc=candidate_metrics["pr_auc"],
            false_positive_rate=candidate_metrics["false_positive_rate"],
            validation_passed=comparison["passed"],
            model_path=os.path.relpath(candidate_path, BACKEND_ROOT),
            is_production=False,
        )
        db.add(registry_row)
        db.commit()

        promoted = False
        if promote_candidate:
            if not comparison["passed"]:
                raise RuntimeError("Candidate did not pass all production comparison criteria; it was not promoted")
            promote(db, version, candidate_path, threshold)
            promoted = True

        result = {
            "version": version,
            "training_rows": row_count,
            "candidate": candidate_metrics,
            "production": production,
            "comparison": comparison,
            "promoted": promoted,
            "model_path": os.path.relpath(candidate_path, BACKEND_ROOT),
        }
        print(json.dumps(result, indent=2))
        return result
    finally:
        db.close()


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Train a candidate model from confirmed analyst labels")
    parser.add_argument("--promote", action="store_true", help="Promote only if all configured gates pass")
    args = parser.parse_args()
    run(promote_candidate=args.promote)

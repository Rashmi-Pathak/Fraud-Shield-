from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc
from typing import Optional, List, Dict, Any
import joblib
import pandas as pd
import numpy as np
import shap
from pathlib import Path

from app.database.database import get_db
from app.database.models import ModelVersion, Transaction
from app.ml.predict import PredictionService

router = APIRouter()
MODELS_DIR = Path(__file__).resolve().parents[2] / "models"

@router.get("")
def get_models(db: Session = Depends(get_db)):
    models = db.query(ModelVersion).order_by(desc(ModelVersion.created_at)).all()
    
    latest = {}
    for m in models:
        if m.model_name not in latest:
            latest[m.model_name] = m
    return list(latest.values())

@router.get("/training/status")
def get_training_status():
    # Return actual training status. Since we don't have a live celery/background training worker hooked up to a state DB right now, 
    # we return None or completed.
    return {"is_training": False, "progress": 0, "job_name": None}

@router.get("/{model_name}")
def get_model_detail(model_name: str, db: Session = Depends(get_db)):
    m = db.query(ModelVersion).filter(ModelVersion.model_name.ilike(model_name)).order_by(desc(ModelVersion.created_at)).first()
    if not m:
        raise HTTPException(status_code=404, detail="Model not found")
        
    importances = []
    try:
        schema = joblib.load(MODELS_DIR / "feature_schema.joblib")
        if m.model_name == "XGBoost":
            model = joblib.load(MODELS_DIR / "xgboost" / "model.joblib")
            imp = model.feature_importances_
            importances = sorted([{"feature": f, "importance": float(v)} for f, v in zip(schema, imp)], key=lambda x: x["importance"], reverse=True)[:15]
        elif m.model_name == "RandomForest":
            model = joblib.load(MODELS_DIR / "random_forest" / "model.joblib")
            imp = model.feature_importances_
            importances = sorted([{"feature": f, "importance": float(v)} for f, v in zip(schema, imp)], key=lambda x: x["importance"], reverse=True)[:15]
        elif m.model_name == "LogisticRegression":
            model = joblib.load(MODELS_DIR / "baseline" / "model.joblib")
            imp = np.abs(model.coef_[0])
            importances = sorted([{"feature": f, "importance": float(v)} for f, v in zip(schema, imp)], key=lambda x: x["importance"], reverse=True)[:15]
        elif m.model_name == "IsolationForest":
            importances = [{"feature": "Anomaly Interpretability (Isolation Forest)", "importance": 1.0}]
    except Exception as e:
        print("Error loading feature importances:", e)
        pass

    return {
        "model_name": m.model_name,
        "version": m.version,
        "training_date": m.training_date.isoformat() if m.training_date else None,
        "training_rows": m.training_rows,
        "precision": m.precision,
        "recall": m.recall,
        "f1": m.f1,
        "roc_auc": m.roc_auc,
        "pr_auc": m.pr_auc,
        "false_positive_rate": m.false_positive_rate,
        "validation_passed": m.validation_passed,
        "status": "Active" if m.is_production else "Archived",
        "production_status": m.is_production,
        "feature_importances": importances
    }

@router.get("/xgboost/explanation/{transaction_id}")
def get_shap_explanation(transaction_id: str, db: Session = Depends(get_db)):
    tx = db.query(Transaction).filter(Transaction.transaction_id == transaction_id).first()
    if not tx: raise HTTPException(status_code=404, detail="Transaction not found")
        
    try:
        schema = joblib.load(MODELS_DIR / "feature_schema.joblib")
        xgb_model = joblib.load(MODELS_DIR / "xgboost" / "model.joblib")
        
        svc = PredictionService(db)
        feat_result = svc.feature_eng.compute_features(tx)
        feature_dict = {k: v for k, v in feat_result["features"].items() if k in schema}
        for col in schema:
            if col not in feature_dict: feature_dict[col] = 0.0
            
        df_x = pd.DataFrame([feature_dict])[schema]
        
        explainer = shap.TreeExplainer(xgb_model)
        shap_values = explainer.shap_values(df_x)
        
        if isinstance(shap_values, list):
            sv = shap_values[1][0]
        else:
            sv = shap_values[0]
            
        contributions = []
        for i, col in enumerate(schema):
            contributions.append({"feature": col, "value": float(df_x.iloc[0, i]), "contribution": float(sv[i])})
            
        contributions.sort(key=lambda x: abs(x["contribution"]), reverse=True)
        return {
            "transaction_id": transaction_id,
            "base_value": float(explainer.expected_value[1] if isinstance(explainer.expected_value, list) else explainer.expected_value),
            "contributions": contributions[:15]
        }
    except Exception as e:
        print("SHAP Error:", e)
        raise HTTPException(status_code=500, detail=str(e))

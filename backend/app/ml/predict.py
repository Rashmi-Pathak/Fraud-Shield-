import os
import joblib
import pandas as pd
import numpy as np
from sqlalchemy.orm import Session
from typing import Dict, Any

from app.database.models import Transaction, Prediction, FraudDetection
from app.ml.feature_engineering import FeatureEngineer
from app.fraud.rules import FraudRuleEngine
from app.fraud.risk_engine import RiskEngine

class PredictionService:
    def __init__(self, db: Session):
        self.db = db
        self.feature_eng = FeatureEngineer(db)
        self.rule_engine = FraudRuleEngine()
        self.risk_engine = RiskEngine()
        self._load_models()
        
    def _load_models(self):
        base = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), "models")
        self.schema = joblib.load(os.path.join(base, "feature_schema.joblib"))
        self.scaler = joblib.load(os.path.join(base, "preprocessor.joblib"))
        self.xgb = joblib.load(os.path.join(base, "xgboost", "model.joblib"))
        self.rf = joblib.load(os.path.join(base, "random_forest", "model.joblib"))
        self.iso = joblib.load(os.path.join(base, "isolation_forest", "model.joblib"))
        self.iso_norm = joblib.load(os.path.join(base, "isolation_forest", "norm_params.joblib"))
        
    def predict(self, tx: Transaction) -> Dict[str, Any]:
        """
        Executes the full prediction pipeline for a transaction.
        """
        # 1. Feature Engineering
        feat_result = self.feature_eng.compute_features(tx)
        features = feat_result["features"]
        signals = feat_result["feature_metadata"]["signals"]
        
        # 2. Fraud Rules
        triggered_rules = self.rule_engine.evaluate(features)
        
        # 3. Model Predictions
        df_x = pd.DataFrame([features])[self.schema]
        df_x_scaled = self.scaler.transform(df_x)
        
        xgb_prob = self.xgb.predict_proba(df_x)[0, 1]
        rf_prob = self.rf.predict_proba(df_x)[0, 1]
        
        iso_raw = self.iso.score_samples(df_x_scaled)[0]
        # Normalize ISO score
        iso_score = (self.iso_norm["max"] - iso_raw) / (self.iso_norm["max"] - self.iso_norm["min"] + 1e-9)
        iso_score = float(np.clip(iso_score, 0.0, 1.0))
        
        # 4. Risk Engine
        risk_result = self.risk_engine.evaluate(
            transaction_id=tx.transaction_id,
            xgb_prob=xgb_prob,
            rf_prob=rf_prob,
            iso_score=iso_score,
            triggered_rules=triggered_rules,
            feature_signals=signals
        )
        
        # 5. Save to Database
        prediction = Prediction(
            transaction_id=tx.transaction_id,
            xgboost_probability=risk_result["xgboost_probability"],
            random_forest_probability=risk_result["random_forest_probability"],
            isolation_forest_score=risk_result["isolation_forest_score"],
            rule_risk_score=risk_result["rule_risk_score"],
            fraud_probability=risk_result["fraud_probability"],
            risk_score=risk_result["risk_score"],
            risk_level=risk_result["risk_level"],
            recommended_action=risk_result["recommended_action"],
            model_version="v1" 
        )
        self.db.add(prediction)
        
        for rule in triggered_rules:
            det = FraudDetection(
                transaction_id=tx.transaction_id,
                fraud_category=rule["category"],
                fraud_subcategory=rule.get("subcategory"),
                severity=rule.get("severity"),
                confidence=rule.get("confidence"),
                reason=rule.get("reason")
            )
            self.db.add(det)
            
        self.db.commit()
        
        return risk_result

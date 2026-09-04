import os
import joblib
import pandas as pd
import numpy as np

def test_models_load_and_predict():
    base = "models"
    
    # 1. Load schema
    schema_path = os.path.join(base, "feature_schema.joblib")
    assert os.path.exists(schema_path), "Feature schema not found!"
    schema = joblib.load(schema_path)
    assert len(schema) > 0
    
    # 2. Preprocessor
    prep_path = os.path.join(base, "preprocessor.joblib")
    assert os.path.exists(prep_path), "Preprocessor not found!"
    scaler = joblib.load(prep_path)
    
    # Dummy data
    X_dummy = pd.DataFrame([np.zeros(len(schema))], columns=schema)
    X_dummy_s = scaler.transform(X_dummy)
    
    # 3. Logistic Regression
    lr_path = os.path.join(base, "baseline", "model.joblib")
    assert os.path.exists(lr_path)
    lr = joblib.load(lr_path)
    pred_lr = lr.predict_proba(X_dummy_s)
    assert pred_lr.shape == (1, 2)
    
    # 4. Random Forest
    rf_path = os.path.join(base, "random_forest", "model.joblib")
    assert os.path.exists(rf_path)
    rf = joblib.load(rf_path)
    pred_rf = rf.predict_proba(X_dummy) # RF uses unscaled
    assert pred_rf.shape == (1, 2)
    
    # 5. XGBoost
    xgb_path = os.path.join(base, "xgboost", "model.joblib")
    assert os.path.exists(xgb_path)
    xgb_model = joblib.load(xgb_path)
    pred_xgb = xgb_model.predict_proba(X_dummy) # XGB uses unscaled
    assert pred_xgb.shape == (1, 2)
    
    # 6. Isolation Forest
    iso_path = os.path.join(base, "isolation_forest", "model.joblib")
    assert os.path.exists(iso_path)
    iso = joblib.load(iso_path)
    score_iso = iso.score_samples(X_dummy_s)
    assert score_iso.shape == (1,)

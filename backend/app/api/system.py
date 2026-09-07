import os
import time
from datetime import datetime, timezone
from typing import Dict, Optional

import joblib
import numpy as np
import pandas as pd
from fastapi import APIRouter, Depends
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.database.models import SystemEvent, Transaction
from app.fraud.rules import FraudRuleEngine
from app.ml.feature_engineering import FeatureEngineer
from app.schemas.health import ComponentHealth, EventHealth, HealthCheckResponse, ModelArtifactHealth
from app.streaming.websocket import get_stream_health

router = APIRouter()


def _model_health():
    base = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), "models")
    artifacts = [
        ("feature_schema", os.path.join(base, "feature_schema.joblib")),
        ("preprocessor", os.path.join(base, "preprocessor.joblib")),
        ("xgboost", os.path.join(base, "xgboost", "model.joblib")),
        ("random_forest", os.path.join(base, "random_forest", "model.joblib")),
        ("isolation_forest", os.path.join(base, "isolation_forest", "model.joblib")),
        ("isolation_norm_params", os.path.join(base, "isolation_forest", "norm_params.joblib")),
    ]
    results = []
    failed = False
    for name, path in artifacts:
        started = time.perf_counter()
        try:
            joblib.load(path)
            results.append(ModelArtifactHealth(name=name, path=path, status="OPERATIONAL",
                                               load_latency_ms=round((time.perf_counter() - started) * 1000, 3)))
        except FileNotFoundError as exc:
            failed = True
            results.append(ModelArtifactHealth(name=name, path=path, status="NOT_CONFIGURED", error=str(exc)))
        except Exception as exc:
            failed = True
            results.append(ModelArtifactHealth(name=name, path=path, status="ERROR", error=str(exc)))
    return results, ComponentHealth(
        status="ERROR" if failed else "OPERATIONAL",
        detail="One or more model artifacts could not be loaded" if failed else "All configured artifacts loaded",
    )


def _process_metrics(wall_seconds: float, cpu_seconds: float) -> Dict[str, Optional[float]]:
    metrics: Dict[str, Optional[float]] = {"memory_mb": None, "cpu_percent": None}
    if wall_seconds > 0:
        metrics["cpu_percent"] = round((cpu_seconds / wall_seconds) * 100, 3)
    try:
        import resource
        metrics["memory_mb"] = round(resource.getrusage(resource.RUSAGE_SELF).ru_maxrss / 1024, 3)
    except (ImportError, AttributeError):
        pass
    return metrics


def _prediction_latency(db: Session) -> Optional[float]:
    """Run model inference against an existing transaction without persisting a result."""
    tx = db.query(Transaction).order_by(Transaction.event_time.desc()).first()
    if tx is None:
        return None
    try:
        base = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), "models")
        schema = joblib.load(os.path.join(base, "feature_schema.joblib"))
        scaler = joblib.load(os.path.join(base, "preprocessor.joblib"))
        xgb = joblib.load(os.path.join(base, "xgboost", "model.joblib"))
        rf = joblib.load(os.path.join(base, "random_forest", "model.joblib"))
        iso = joblib.load(os.path.join(base, "isolation_forest", "model.joblib"))
        norm = joblib.load(os.path.join(base, "isolation_forest", "norm_params.joblib"))
        features = FeatureEngineer(db).compute_features(tx)["features"]
        frame = pd.DataFrame([features])[schema]
        started = time.perf_counter()
        scaled = scaler.transform(frame)
        xgb.predict_proba(frame)
        rf.predict_proba(frame)
        iso_raw = iso.score_samples(scaled)[0]
        _ = float(np.clip((norm["max"] - iso_raw) / (norm["max"] - norm["min"] + 1e-9), 0.0, 1.0))
        return round((time.perf_counter() - started) * 1000, 3)
    except Exception:
        return None


@router.get("/health", response_model=HealthCheckResponse)
@router.get("/system/health", response_model=HealthCheckResponse)
def health_check(db: Session = Depends(get_db)):
    request_started = time.perf_counter()
    cpu_started = time.process_time()
    components: Dict[str, ComponentHealth] = {}

    db_started = time.perf_counter()
    try:
        db.execute(text("SELECT 1")).scalar_one()
        event_count = db.query(SystemEvent).count()
        db_latency = round((time.perf_counter() - db_started) * 1000, 3)
        components["sqlite"] = ComponentHealth(status="OPERATIONAL", detail="SQLite query health succeeded", latency_ms=db_latency)
        database = {"status": "OPERATIONAL", "query_latency_ms": db_latency, "system_events_count": event_count}
    except Exception as exc:
        db_latency = round((time.perf_counter() - db_started) * 1000, 3)
        components["sqlite"] = ComponentHealth(status="ERROR", detail=str(exc), latency_ms=db_latency)
        database = {"status": "ERROR", "query_latency_ms": db_latency, "error": str(exc)}

    model_results, model_component = _model_health()
    components["ml_models"] = model_component

    started = time.perf_counter()
    try:
        FeatureEngineer(db).compute_features(Transaction(
            transaction_id="__health_check__", customer_id="__health__", card_id="__health__",
            account_id="__health__", event_time=datetime.now(), amount=0.0, currency="USD",
            transaction_type="health_check", payment_channel="health_check", card_present=False,
            international_transaction=False, merchant_id="__health__", merchant_category="health_check",
        ))
        components["feature_engine"] = ComponentHealth(status="OPERATIONAL", detail="Feature computation succeeded",
                                                         latency_ms=round((time.perf_counter() - started) * 1000, 3))
    except Exception as exc:
        components["feature_engine"] = ComponentHealth(status="ERROR", detail=str(exc),
                                                         latency_ms=round((time.perf_counter() - started) * 1000, 3))

    started = time.perf_counter()
    try:
        FraudRuleEngine().evaluate({})
        components["rule_engine"] = ComponentHealth(status="OPERATIONAL", detail="Rule evaluation succeeded",
                                                      latency_ms=round((time.perf_counter() - started) * 1000, 3))
    except Exception as exc:
        components["rule_engine"] = ComponentHealth(status="ERROR", detail=str(exc),
                                                      latency_ms=round((time.perf_counter() - started) * 1000, 3))

    components["fastapi"] = ComponentHealth(status="OPERATIONAL", detail="Health endpoint is responding")
    stream = get_stream_health()
    components["websocket"] = ComponentHealth(status="OPERATIONAL", detail="WebSocket route is configured at /ws/live")
    components["stream_simulator"] = ComponentHealth(
        status="OPERATIONAL" if stream.status in {"running", "paused"} else "NOT_CONFIGURED",
        detail="Active local simulator observed" if stream.status in {"running", "paused"} else "No active simulator connection",
    )

    try:
        events = [EventHealth(event_type=e.event_type, message=e.message, severity=e.severity, timestamp=e.timestamp)
                  for e in db.query(SystemEvent).order_by(SystemEvent.timestamp.desc()).limit(10).all()]
    except Exception:
        events = []

    prediction_latency = _prediction_latency(db)
    elapsed = time.perf_counter() - request_started
    performance = _process_metrics(elapsed, time.process_time() - cpu_started)
    performance.update({
        "api_response_time_ms": round(elapsed * 1000, 3),
        "database_latency_ms": db_latency,
        "prediction_latency_ms": prediction_latency,
        "stream_throughput_per_second": stream.throughput_per_second,
    })
    overall = "ERROR" if any(c.status == "ERROR" for c in components.values()) else "OPERATIONAL"
    return HealthCheckResponse(
        status=overall,
        api="healthy",
        database="healthy" if database["status"] == "OPERATIONAL" else "unhealthy",
        ml_model=model_component.status.lower(),
        checked_at=datetime.now(timezone.utc),
        api_response_time_ms=performance["api_response_time_ms"],
        components=components,
        performance=performance,
        models=model_results,
        database_details=database,
        live_stream=stream,
        recent_events=events,
    )

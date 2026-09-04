import os
import subprocess
import time

commits = [
    {"msg": "Initial commit: README and gitignore", "files": [".gitignore", "README.md"]},
    {"msg": "Setup frontend configuration files", "files": ["frontend/package.json", "frontend/package-lock.json", "frontend/tsconfig.json", "frontend/next.config.mjs"]},
    {"msg": "Setup frontend styling configuration", "files": ["frontend/tailwind.config.ts", "frontend/postcss.config.mjs", "frontend/.eslintrc.json"]},
    {"msg": "Initialize frontend core layout and globals", "files": ["frontend/src/app/globals.css", "frontend/src/app/layout.tsx", "frontend/src/app/page.tsx"]},
    {"msg": "Add frontend static assets and fonts", "files": ["frontend/src/app/fonts/GeistMonoVF.woff", "frontend/src/app/fonts/GeistVF.woff", "frontend/src/app/favicon.ico"]},
    {"msg": "Implement main dashboard layout", "files": ["frontend/src/app/(dashboard)/layout.tsx"]},
    {"msg": "Setup backend environment and requirements", "files": ["backend/requirements.txt", "backend/.env.example"]},
    {"msg": "Initialize FastAPI main app", "files": ["backend/app/main.py"]},
    {"msg": "Implement database connection and CRUD utilities", "files": ["backend/app/database/database.py", "backend/app/database/crud.py"]},
    {"msg": "Design core SQLAlchemy data models", "files": ["backend/app/database/models.py"]},
    {"msg": "Create transaction Pydantic schemas", "files": ["backend/app/schemas/transaction.py"]},
    {"msg": "Create alert and dashboard Pydantic schemas", "files": ["backend/app/schemas/alert.py", "backend/app/schemas/dashboard.py"]},
    {"msg": "Create prediction, model, and health Pydantic schemas", "files": ["backend/app/schemas/prediction.py", "backend/app/schemas/model.py", "backend/app/schemas/health.py"]},
    {"msg": "Add raw transaction datasets", "files": ["data/raw/live_stream_sample_1000.csv", "data/raw/raw_transactions_15000.csv"]},
    {"msg": "Add training data and labels", "files": ["data/training/fraud_labels_15000.csv", "data/training/fraud_training_dataset_15000.csv"]},
    {"msg": "Include data import and model training scripts", "files": ["backend/scripts/import_dataset.py", "backend/scripts/train_models.py"]},
    {"msg": "Commit pre-trained machine learning models", "files": ["backend/models/baseline/model.joblib", "backend/models/feature_schema.joblib", "backend/models/isolation_forest/model.joblib", "backend/models/isolation_forest/norm_params.joblib", "backend/models/preprocessor.joblib", "backend/models/random_forest/model.joblib", "backend/models/threshold_config.joblib", "backend/models/xgboost/model.joblib"]},
    {"msg": "Implement real-time feature engineering engine", "files": ["backend/app/ml/feature_engineering.py"]},
    {"msg": "Implement prediction orchestration layer", "files": ["backend/app/ml/predict.py"]},
    {"msg": "Implement deterministic fraud rules and risk engine", "files": ["backend/app/fraud/rules.py", "backend/app/fraud/risk_engine.py"]},
    {"msg": "Add system health API and service", "files": ["backend/app/api/system.py", "backend/app/services/system_service.py"]},
    {"msg": "Add data import API and service", "files": ["backend/app/api/data.py", "backend/app/services/data_service.py"]},
    {"msg": "Add overview dashboard API and service", "files": ["backend/app/api/dashboard.py", "backend/app/services/dashboard_service.py"]},
    {"msg": "Add core transactions API and service", "files": ["backend/app/api/transactions.py", "backend/app/services/transaction_service.py"]},
    {"msg": "Add fraud alerts API and service", "files": ["backend/app/api/alerts.py", "backend/app/services/alert_service.py"]},
    {"msg": "Add external prediction API and service", "files": ["backend/app/api/predict.py", "backend/app/services/prediction_service.py"]},
    {"msg": "Add ML model management API and service", "files": ["backend/app/api/models.py", "backend/app/services/model_service.py"]},
    {"msg": "Add pattern detection API and service", "files": ["backend/app/api/patterns.py", "backend/app/services/pattern_service.py"]},
    {"msg": "Implement WebSocket streaming simulator", "files": ["backend/app/streaming/__init__.py", "backend/app/streaming/processor.py", "backend/app/streaming/simulator.py", "backend/app/streaming/websocket.py", "backend/app/api/stream.py"]},
    {"msg": "Build frontend overview dashboard view", "files": ["frontend/src/app/(dashboard)/dashboard/page.tsx"]},
    {"msg": "Build frontend live transaction monitor", "files": ["frontend/src/app/(dashboard)/live/page.tsx"]},
    {"msg": "Build frontend transaction analysis form", "files": ["frontend/src/app/(dashboard)/analyze/page.tsx"]},
    {"msg": "Build frontend paginated transactions table", "files": ["frontend/src/app/(dashboard)/transactions/page.tsx"]},
    {"msg": "Build frontend transaction detailed investigation view", "files": ["frontend/src/app/(dashboard)/transactions/[id]/page.tsx"]},
    {"msg": "Build frontend paginated fraud alerts table", "files": ["frontend/src/app/(dashboard)/alerts/page.tsx"]},
    {"msg": "Build frontend alert investigation and action view", "files": ["frontend/src/app/(dashboard)/alerts/[id]/page.tsx"]},
    {"msg": "Build frontend data and models management views", "files": ["frontend/src/app/(dashboard)/data/page.tsx", "frontend/src/app/(dashboard)/models/page.tsx"]},
    {"msg": "Build frontend patterns detection views", "files": ["frontend/src/app/(dashboard)/patterns/page.tsx", "frontend/src/app/(dashboard)/patterns/[id]/page.tsx"]},
    {"msg": "Build frontend system settings view", "files": ["frontend/src/app/(dashboard)/system/page.tsx"]},
    {"msg": "Add test suites and audit documentation", "files": ["backend/tests/test_api_transactions.py", "backend/tests/test_backend.py", "backend/tests/test_feature_engineering.py", "backend/tests/test_import.py", "backend/tests/test_ml.py", "backend/tests/test_prediction.py", "backend/tests/test_rules.py", "docs/FRONTEND_DATA_AUDIT.md", "frontend/README.md", "backend/test_dashboard.py"]}
]

for batch in commits:
    files_added = False
    for f in batch["files"]:
        if os.path.exists(f):
            subprocess.run(["git", "add", f], check=False)
            files_added = True
    
    if files_added:
        subprocess.run(["git", "commit", "-m", batch["msg"]], check=False)
        time.sleep(0.5)

# Add remaining untracked files
subprocess.run(["git", "add", "."], check=False)
res = subprocess.run(["git", "commit", "-m", "Final bugfixes and UI polish"], check=False)
if res.returncode != 0:
    print("No remaining files to commit")
print("Done creating commits.")

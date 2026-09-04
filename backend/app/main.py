import os
import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

load_dotenv()
logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)

from app.database.database import engine, Base
from app.api import system, data, transactions, predict, dashboard, alerts

Base.metadata.create_all(bind=engine)

app = FastAPI(title="FraudShield AI Backend")

origins = os.getenv("CORS_ORIGINS", "http://localhost:3000").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(system.router, prefix="/api", tags=["System"])
app.include_router(data.router, prefix="/api/data", tags=["Data"])
app.include_router(transactions.router, prefix="/api/transactions", tags=["Transactions"])
app.include_router(predict.router, prefix="/api/predict", tags=["Prediction"])
app.include_router(dashboard.router, prefix="/api/dashboard", tags=["Dashboard"])
app.include_router(alerts.router, prefix="/api/alerts", tags=["Alerts"])

from app.streaming import websocket
app.include_router(websocket.router)

@app.get("/")
def read_root():
    return {"message": "FraudShield AI Backend API is running."}

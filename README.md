# 🛡️ FraudShield AI

FraudShield AI is a state-of-the-art, real-time transaction monitoring and fraud detection system. Designed for financial institutions, it leverages ensemble machine learning models, deterministic rule engines, and a real-time streaming architecture to flag suspicious activity with high precision.

## ✨ Features
- **Real-Time Streaming:** Simulates and ingests transactions seamlessly using a built-in asynchronous streaming engine and WebSockets.
- **Ensemble Machine Learning:** Employs XGBoost, Random Forest, and Isolation Forest working in tandem to calculate dynamic fraud probabilities.
- **Deterministic Rule Engine:** Over 10 active rule categories (Velocity, Amount Anomalies, Geographic shifts) for immediate threshold-based flagging.
- **Advanced Feature Engineering:** Computes moving averages, transaction velocities, and behavioral deviations in real-time.
- **Interactive Dashboards:** Built with Next.js and Tailwind CSS, featuring rich interactive components, real-time KPI polling, and actionable investigation workflows.
- **Comprehensive API:** Fully documented FastAPI backend for transactions, alerts, streaming, and predictions.

## 🏗️ Architecture

- **Backend:** Python, FastAPI, SQLAlchemy, SQLite, Pandas, Scikit-learn, XGBoost
- **Frontend:** TypeScript, Next.js, React, Tailwind CSS, Recharts, Lucide Icons
- **Real-Time:** WebSockets, Asyncio

## 🚀 Getting Started

### Prerequisites
- Python 3.9+
- Node.js 18+

### Backend Setup
1. Navigate to the \ackend\ directory:
   \\\ash
   cd backend
   \\\
2. Install dependencies:
   \\\ash
   pip install -r requirements.txt
   \\\
3. Run the FastAPI server:
   \\\ash
   uvicorn app.main:app --reload --port 8000
   \\\

### Frontend Setup
1. Navigate to the \rontend\ directory:
   \\\ash
   cd frontend
   \\\
2. Install dependencies:
   \\\ash
   npm install
   \\\
3. Start the Next.js development server:
   \\\ash
   npm run dev
   \\\
4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📊 Modules
- **Overview Dashboard:** Top-level metrics and system health.
- **Live Monitor:** Real-time stream ingestion visualization.
- **Transactions:** Search, filter, and inspect paginated transactions.
- **Fraud Alerts:** Triaging system for flagged transactions.
- **Alert Investigation:** Deep-dive into SHAP values, risk factors, model breakdowns, and customer timelines.

## 📝 License
This project is licensed under the MIT License.

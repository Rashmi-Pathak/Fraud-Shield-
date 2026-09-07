import asyncio
import json
import os
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends
from starlette.concurrency import run_in_threadpool
from sqlalchemy.orm import Session
from app.database.database import get_db, SessionLocal
from app.streaming.simulator import StreamSimulator
from app.streaming.processor import StreamProcessor
from app.schemas.health import StreamHealth

router = APIRouter(prefix="/ws", tags=["Streaming"])

# Using a global manager for simplicity, though could be tied to connection
class ConnectionManager:
    def __init__(self):
        self.active_connections = []
        self.simulators = {}

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)
        # Create a simulator for this connection
        csv_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(__file__)))), "data", "raw", "live_stream_sample_1000.csv")
        sim = StreamSimulator(csv_path)
        self.simulators[websocket] = sim

        async def callback(raw_tx, ground_truth):
            # Run the blocking DB stuff in threadpool
            def process_tx():
                db = SessionLocal()
                try:
                    processor = StreamProcessor(db)
                    return processor.process_transaction(raw_tx)
                finally:
                    db.close()
            
            try:
                result = await run_in_threadpool(process_tx)
                
                # Update metrics
                is_fraud_pred = result["is_critical"]
                is_fraud_actual = ground_truth["is_fraud"]
                sim.update_metrics(is_fraud_pred, is_fraud_actual)
                
                # Send to frontend
                payload = {
                    "type": "transaction",
                    "data": result,
                    "metrics": sim.metrics
                }
                await websocket.send_json(payload)
            except Exception as e:
                print(f"Error processing transaction: {e}")

        sim.register_callback(callback)

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)
        if websocket in self.simulators:
            self.simulators[websocket].stop()
            del self.simulators[websocket]

manager = ConnectionManager()


def get_stream_health() -> StreamHealth:
    """Return state from the currently active local simulator, if one exists."""
    simulators = list(manager.simulators.values())
    if not simulators:
        return StreamHealth(status="stopped", running=False, paused=False, transactions_processed=0)

    sim = simulators[-1]
    status = "running" if sim.is_running and not sim.is_paused else "paused" if sim.is_paused else "stopped"
    return StreamHealth(
        status=status,
        running=sim.is_running,
        paused=sim.is_paused,
        transactions_processed=sim.metrics["total_processed"],
        current_speed=sim.speed,
        current_mode=sim.mode,
        throughput_per_second=sim.throughput_per_second(),
    )

@router.websocket("/live")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            data = await websocket.receive_text()
            message = json.loads(data)
            action = message.get("action")
            sim = manager.simulators.get(websocket)
            
            if not sim: continue

            if action == "START":
                sim.start()
                await websocket.send_json({"type": "status", "data": "Running"})
            elif action == "PAUSE":
                sim.pause()
                await websocket.send_json({"type": "status", "data": "Paused"})
            elif action == "STOP":
                sim.stop()
                await websocket.send_json({"type": "status", "data": "Stopped"})
            elif action == "SET_SPEED":
                speed = float(message.get("speed", 1.0))
                sim.set_speed(speed)
            elif action == "SET_MODE":
                mode = message.get("mode", "Sequential")
                scenario = message.get("scenario")
                sim.set_mode(mode, scenario)
                
    except WebSocketDisconnect:
        manager.disconnect(websocket)
    except Exception as e:
        print(f"WebSocket Error: {e}")
        manager.disconnect(websocket)

import asyncio
import pandas as pd
import numpy as np
import os
from typing import Dict, Any, Callable
from datetime import datetime

class StreamSimulator:
    def __init__(self, filepath: str):
        self.filepath = filepath
        self.df = None
        self.is_running = False
        self.is_paused = False
        self.speed = 1.0
        self.mode = "Sequential"
        self.scenario = None
        self.current_idx = 0
        self._task = None
        self.callbacks = []
        self.metrics = {
            "true_positives": 0,
            "false_positives": 0,
            "true_negatives": 0,
            "false_negatives": 0,
            "total_processed": 0
        }
        self.load_data()

    def load_data(self):
        if not os.path.exists(self.filepath):
            raise FileNotFoundError(f"Dataset not found at {self.filepath}")
        self.df = pd.read_csv(self.filepath)
        # Sort by timestamp to ensure chronological order initially
        if 'timestamp' in self.df.columns:
            self.df['timestamp'] = pd.to_datetime(self.df['timestamp'])
            self.df = self.df.sort_values('timestamp').reset_index(drop=True)

    def register_callback(self, callback: Callable[[Dict[str, Any], Dict[str, Any]], None]):
        """Callback takes (raw_transaction, ground_truth)"""
        self.callbacks.append(callback)

    def start(self):
        if self.is_running and not self.is_paused:
            return
        if not self.is_running:
            self.is_running = True
            self.is_paused = False
            self.current_idx = 0
            self._task = asyncio.create_task(self._run_loop())
        elif self.is_paused:
            self.is_paused = False

    def pause(self):
        self.is_paused = True

    def stop(self):
        self.is_running = False
        self.is_paused = False
        if self._task:
            self._task.cancel()
            self._task = None

    def set_speed(self, speed: float):
        self.speed = speed

    def set_mode(self, mode: str, scenario: str = None):
        self.mode = mode
        self.scenario = scenario
        self.current_idx = 0
        
        if self.mode == "Random":
            self.df = self.df.sample(frac=1).reset_index(drop=True)
        elif self.mode == "Scenario" and self.scenario:
            # Simple simulation: filter by category
            if self.scenario == "Card Testing":
                # Ensure we have both legit and card testing fraud
                legit = self.df[self.df['is_fraud'] == 0]
                fraud = self.df[self.df['fraud_category'].str.contains('CARD_TESTING', na=False, case=False)]
                self.df = pd.concat([legit.sample(min(len(legit), 50)), fraud]).sample(frac=1).reset_index(drop=True)
            elif self.scenario == "Velocity Attack":
                legit = self.df[self.df['is_fraud'] == 0]
                fraud = self.df[self.df['fraud_category'].str.contains('VELOCITY', na=False, case=False)]
                self.df = pd.concat([legit.sample(min(len(legit), 50)), fraud]).sample(frac=1).reset_index(drop=True)
            else:
                self.df = self.df.sort_values('timestamp').reset_index(drop=True)
        else:
            self.df = self.df.sort_values('timestamp').reset_index(drop=True)

    def update_metrics(self, is_fraud_pred: bool, is_fraud_actual: bool):
        if is_fraud_pred and is_fraud_actual:
            self.metrics["true_positives"] += 1
        elif is_fraud_pred and not is_fraud_actual:
            self.metrics["false_positives"] += 1
        elif not is_fraud_pred and not is_fraud_actual:
            self.metrics["true_negatives"] += 1
        elif not is_fraud_pred and is_fraud_actual:
            self.metrics["false_negatives"] += 1
        self.metrics["total_processed"] += 1

    async def _run_loop(self):
        try:
            while self.is_running and self.current_idx < len(self.df):
                if self.is_paused:
                    await asyncio.sleep(0.5)
                    continue

                row = self.df.iloc[self.current_idx].to_dict()
                
                # Extract and remove ground truth
                ground_truth = {
                    "is_fraud": bool(row.get("is_fraud", 0)),
                    "fraud_category": row.get("fraud_category", "NONE"),
                    "fraud_subcategory": row.get("fraud_subcategory", "NONE")
                }
                
                # Cleanup keys to match TransactionCreate
                tx_dict = {k: v for k, v in row.items() if k not in ground_truth}
                
                # Map timestamp -> event_time
                if "timestamp" in tx_dict:
                    tx_dict["event_time"] = tx_dict.pop("timestamp")
                    if pd.isna(tx_dict["event_time"]):
                        tx_dict["event_time"] = datetime.utcnow().isoformat()
                    else:
                        tx_dict["event_time"] = str(tx_dict["event_time"])
                        
                if "ingestion_timestamp" in tx_dict:
                    tx_dict["ingestion_time"] = tx_dict.pop("ingestion_timestamp")
                    if pd.isna(tx_dict["ingestion_time"]):
                        tx_dict["ingestion_time"] = datetime.utcnow().isoformat()
                    else:
                        tx_dict["ingestion_time"] = str(tx_dict["ingestion_time"])

                # Handle booleans
                tx_dict["card_present"] = bool(tx_dict.get("card_present", 0))
                tx_dict["international_transaction"] = bool(tx_dict.get("international_transaction", 0))
                tx_dict["is_recurring"] = bool(tx_dict.get("is_recurring", 0))

                for cb in self.callbacks:
                    if asyncio.iscoroutinefunction(cb):
                        await cb(tx_dict, ground_truth)
                    else:
                        cb(tx_dict, ground_truth)
                
                self.current_idx += 1
                
                # Calculate sleep time based on speed. Base is 1 second per transaction for visual simulation.
                sleep_time = 1.0 / self.speed
                await asyncio.sleep(sleep_time)

            self.is_running = False
        except asyncio.CancelledError:
            pass
        except Exception as e:
            print(f"Simulator Error: {e}")
            self.is_running = False

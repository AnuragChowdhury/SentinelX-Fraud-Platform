import asyncio
import random
import time
from datetime import datetime
from typing import Dict, Any, List, Callable
from app.core.logging import logger

class RealTimeStreamSimulator:
    def __init__(self, players: List[Dict], on_alert_callback: Callable[[Dict], None] = None):
        self.players = players
        self.on_alert = on_alert_callback
        self.is_running = False
        self.event_queue = asyncio.Queue()
        self.active_connections = set()
        
    async def start_streaming(self):
        self.is_running = True
        logger.info("Real-time event stream simulator started.")
        asyncio.create_task(self._generate_mock_events())
        asyncio.create_task(self._process_events())
        
    def stop_streaming(self):
        self.is_running = False
        logger.info("Real-time event stream simulator stopped.")
        
    async def _generate_mock_events(self):
        """
        Dynamically feed fake game events: logins, match completions, trades, chat spam.
        """
        event_types = ["login", "match", "trade"]
        
        while self.is_running:
            # Sleep between events (e.g. 0.5 to 2 seconds for active stream)
            await asyncio.sleep(random.uniform(0.5, 1.5))
            
            etype = random.choices(event_types, weights=[0.40, 0.40, 0.20])[0]
            event = {}
            
            p = random.choice(self.players)
            pid = p["player_id"]
            ptype = p["player_type"]
            
            if etype == "login":
                event = {
                    "event_id": f"EVT_LGN_{int(time.time()*1000)}",
                    "event_type": "login",
                    "player_id": pid,
                    "username": p["username"],
                    "timestamp": datetime.now().isoformat(),
                    "data": {
                        "device_id": random.choice(p["devices"]),
                        "ip_address": random.choice(p["ips"]),
                        "latency": max(5.0, p["latency_avg"] + random.uniform(-10.0, 10.0) if ptype != "bot" else p["latency_avg"] + random.uniform(-0.2, 0.2))
                    }
                }
                
            elif etype == "match":
                opponents = [x for x in self.players if x["player_id"] != pid]
                opponents_sample = random.sample(opponents, 5)
                team_a = [pid] + [x["player_id"] for x in opponents_sample[:2]]
                team_b = [x["player_id"] for x in opponents_sample[2:]]
                
                # Check for collusion matching
                is_win_trading = ptype == "colluder" and random.random() < 0.6
                
                event = {
                    "event_id": f"EVT_MCH_{int(time.time()*1000)}",
                    "event_type": "match_completed",
                    "player_id": pid,
                    "username": p["username"],
                    "timestamp": datetime.now().isoformat(),
                    "data": {
                        "match_id": f"MCH_STRM_{random.randint(100000, 999999)}",
                        "team_a": team_a,
                        "team_b": team_b,
                        "winner": "TeamA" if is_win_trading or random.random() < 0.5 else "TeamB",
                        "duration_seconds": random.randint(400, 1500),
                        "rewards_gold": random.randint(100, 400),
                        "is_collusion_simulated": is_win_trading
                    }
                }
                
            elif etype == "trade":
                partner = random.choice([x for x in self.players if x["player_id"] != pid])
                is_farming = ptype == "farmer" and random.random() < 0.7
                
                amount = random.randint(3000, 12000) if is_farming else random.randint(100, 800)
                
                event = {
                    "event_id": f"EVT_TRD_{int(time.time()*1000)}",
                    "event_type": "trade_executed",
                    "player_id": pid,
                    "username": p["username"],
                    "timestamp": datetime.now().isoformat(),
                    "data": {
                        "trade_id": f"TRD_STRM_{random.randint(10000, 99999)}",
                        "receiver_id": partner["player_id"],
                        "receiver_name": partner["username"],
                        "amount_gold": amount,
                        "is_unbalanced": amount > 1500
                    }
                }
                
            await self.event_queue.put(event)
            
    async def _process_events(self):
        while self.is_running:
            event = await self.event_queue.get()
            
            # Sub-second pipeline execution (latency tracking)
            start_time = time.perf_counter()
            
            pid = event["player_id"]
            etype = event["event_type"]
            p_profile = next((x for x in self.players if x["player_id"] == pid), None)
            
            if not p_profile:
                self.event_queue.task_done()
                continue
                
            # Perform instant online risk evaluation (simulated)
            # In a live production system, we fetch features from Redis Feature Store 
            # and evaluate the Risk Engine within milliseconds.
            
            risk_score = 0.05
            details = []
            
            # Risk logic based on simulated events
            if etype == "login":
                lat = event["data"]["latency"]
                if p_profile["player_type"] == "bot":
                    risk_score = 0.88
                    details.append("Repetitive high-frequency login profile with negligible latency variance.")
                elif p_profile["player_type"] == "multi_account":
                    risk_score = 0.65
                    details.append("Device/IP footprint matching multiple flagged hardware UUID profiles.")
                    
            elif etype == "match_completed":
                is_collusion = event["data"].get("is_collusion_simulated", False)
                if is_collusion or p_profile["player_type"] == "colluder":
                    risk_score = 0.92
                    details.append("Elevated teammate overlap frequency; match outcomes matching win-trading criteria.")
                elif p_profile["player_type"] == "smurf":
                    risk_score = 0.74
                    details.append("Hyper-acceleration in matchmaking MMR over low-age account profile.")
                    
            elif etype == "trade_executed":
                is_unbalanced = event["data"].get("is_unbalanced", False)
                if is_unbalanced or p_profile["player_type"] == "farmer":
                    risk_score = 0.85
                    details.append(f"Highly asymmetrical gold drainage transfer ({event['data']['amount_gold']} gold) to a hub account.")
                    
            # Set general risk scale
            risk_level = "LOW"
            if risk_score >= 0.85:
                risk_level = "CRITICAL"
            elif risk_score >= 0.60:
                risk_level = "HIGH"
            elif risk_score >= 0.30:
                risk_level = "MEDIUM"
                
            latency_ms = (time.perf_counter() - start_time) * 1000.0
            
            # Trigger alert if risk is HIGH or CRITICAL
            if risk_level in ["HIGH", "CRITICAL"]:
                alert = {
                    "alert_id": f"ALT_{int(time.time()*1000)}",
                    "player_id": pid,
                    "username": p_profile["username"],
                    "event_type": etype,
                    "risk_score": float(round(risk_score * 100, 1)),
                    "risk_level": risk_level,
                    "details": details,
                    "latency_ms": float(round(latency_ms, 3)),
                    "timestamp": datetime.now().isoformat()
                }
                
                if self.on_alert:
                    self.on_alert(alert)
                    
            self.event_queue.task_done()

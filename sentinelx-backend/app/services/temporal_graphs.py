import numpy as np
import pandas as pd
import networkx as nx
from datetime import datetime, timedelta
from typing import Dict, List, Tuple, Any
from app.core.logging import logger

class TemporalGraphManager:
    def __init__(self, matches: List[Dict], trades: List[Dict], decay_rate: float = 0.05):
        """
        decay_rate (lambda): Exponential decay coefficient per day.
        """
        self.matches = matches
        self.trades = trades
        self.decay_rate = decay_rate
        
    def build_decayed_graphs(self, target_time: datetime = None) -> Tuple[nx.Graph, nx.DiGraph]:
        """
        Builds match and trade networks where edge weights decay exponentially 
        relative to their elapsed time from the target_time (default: now).
        weight = base_weight * exp(-lambda * delta_t_days)
        """
        if target_time is None:
            target_time = datetime.now()
            
        m_g = nx.Graph()
        t_g = nx.DiGraph()
        
        # 1. Match co-play with decay
        for match in self.matches:
            m_time = datetime.fromisoformat(match["timestamp"])
            delta_days = (target_time - m_time).total_seconds() / 86400.0
            
            # Avoid negative days (events in future relative to snapshot)
            if delta_days < 0:
                continue
                
            # Time-decay multiplier
            decay_factor = np.exp(-self.decay_rate * delta_days)
            
            players = match["team_a"] + match["team_b"]
            for i, p1 in enumerate(players):
                for p2 in players[i+1:]:
                    w = 1.0 * decay_factor
                    if m_g.has_edge(p1, p2):
                        m_g[p1][p2]["weight"] += w
                    else:
                        m_g.add_edge(p1, p2, weight=w)
                        
        # 2. Trades with decay
        for trade in self.trades:
            t_time = datetime.fromisoformat(trade["timestamp"])
            delta_days = (target_time - t_time).total_seconds() / 86400.0
            
            if delta_days < 0:
                continue
                
            decay_factor = np.exp(-self.decay_rate * delta_days)
            sender = trade["sender_id"]
            receiver = trade["receiver_id"]
            gold = trade["amount_gold"]
            
            w = gold * decay_factor
            if t_g.has_edge(sender, receiver):
                t_g[sender][receiver]["weight"] += w
            else:
                t_g.add_edge(sender, receiver, weight=w)
                
        return m_g, t_g
        
    def compute_risk_momentum(self, historical_scores: Dict[str, List[Tuple[str, float]]]) -> Dict[str, Dict[str, float]]:
        """
        historical_scores maps player_id -> list of (timestamp_string, score_value)
        Computes velocity (slope) and acceleration (curvature) of risk trajectory.
        """
        momentum_results = {}
        
        for pid, history in historical_scores.items():
            if len(history) < 2:
                momentum_results[pid] = {"velocity": 0.0, "acceleration": 0.0, "burst_score": 0.0}
                continue
                
            # Sort history by time
            sorted_history = sorted(history, key=lambda x: datetime.fromisoformat(x[0]))
            
            # Get latest scores
            t_curr, val_curr = sorted_history[-1]
            t_prev, val_prev = sorted_history[-2]
            
            dt = (datetime.fromisoformat(t_curr) - datetime.fromisoformat(t_prev)).total_seconds() / 3600.0 # in hours
            dt = max(0.1, dt) # Avoid division by zero
            
            velocity = (val_curr - val_prev) / dt
            
            acceleration = 0.0
            if len(sorted_history) >= 3:
                t_prev2, val_prev2 = sorted_history[-3]
                dt_prev = (datetime.fromisoformat(t_prev) - datetime.fromisoformat(t_prev2)).total_seconds() / 3600.0
                dt_prev = max(0.1, dt_prev)
                
                prev_velocity = (val_prev - val_prev2) / dt_prev
                acceleration = (velocity - prev_velocity) / dt
                
            # Burst score represents rapid acceleration spikes in risk
            burst_score = float(max(0.0, velocity * 10.0 + acceleration * 5.0))
            
            momentum_results[pid] = {
                "velocity": float(velocity),
                "acceleration": float(acceleration),
                "burst_score": burst_score
            }
            
        return momentum_results
        
    def generate_sliding_snapshots(self, num_snapshots: int = 5) -> List[Dict[str, Any]]:
        """
        Extract snapshots representing historical graph states to support dashboard playback.
        """
        logger.info(f"Generating {num_snapshots} sliding temporal graph snapshots...")
        snapshots = []
        
        now = datetime.now()
        for i in range(num_snapshots):
            # Step back in time (e.g. increments of 2 days)
            snap_time = now - timedelta(days=(num_snapshots - 1 - i) * 2)
            m_g, t_g = self.build_decayed_graphs(snap_time)
            
            # Simple metrics per snapshot
            # Cap computation to avoid exponential clique explosion on dense graphs
            if m_g.number_of_nodes() > 0 and m_g.number_of_edges() < 2500:
                cliques = list(nx.find_cliques(m_g))
                large_cliques = sum(1 for c in cliques if len(c) >= 4)
            else:
                # Fast fallback heuristic based on high-degree nodes for dense graphs
                large_cliques = sum(1 for d in m_g.degree() if d[1] >= 5) // 4
            
            snapshots.append({
                "snapshot_index": i,
                "timestamp": snap_time.isoformat(),
                "node_count": m_g.number_of_nodes(),
                "edge_count": m_g.number_of_edges(),
                "match_density": nx.density(m_g) if m_g.number_of_nodes() > 0 else 0.0,
                "detected_cliques_count": large_cliques,
                "trade_gold_volume": float(sum(data.get("weight", 0.0) for _, _, data in t_g.edges(data=True)))
            })
            
        return snapshots

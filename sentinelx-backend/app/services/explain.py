import pandas as pd
import numpy as np
from typing import Dict, Any, List
from app.models.supervised import SupervisedRiskModel

class ExplainabilityLayer:
    def __init__(self, supervised_model: SupervisedRiskModel):
        self.supervised_model = supervised_model
        
    def generate_explanation(self, player_id: str, df: pd.DataFrame, collusion_rings: List[Dict], farming_groups: List[Dict]) -> Dict[str, Any]:
        """
        Generate localized explanation for a specific player ID.
        """
        player_row = df[df["player_id"] == player_id]
        if player_row.empty:
            return {"error": "Player not found"}
            
        row = player_row.iloc[0]
        risk_score = float(row["risk_score"])
        risk_level = row["risk_level"]
        player_type = row["player_type"]
        
        # Get XGBoost feature importances to determine global weights
        importances = self.supervised_model.get_feature_importances()
        
        # Calculate local contributions (mocking SHAP values by weighting local feature deviation from mean)
        local_contributions = []
        
        # Feature list for SHAP waterfall rendering
        feature_labels = {
            "session_entropy": "Login Schedule Entropy",
            "graph_device_sharing_degree": "Shared Devices & IPs",
            "feat_trade_asymmetry": "Trade Asymmetry Ratio",
            "winrate_recent": "Recent Win Rate",
            "feat_mmr_velocity": "MMR Spike Velocity",
            "graph_match_pagerank": "Co-match Centrality (PageRank)",
            "latency_var": "Network Latency Variance",
            "mmr": "Player MMR Level"
        }
        
        for feat, label in feature_labels.items():
            if feat not in df.columns:
                continue
            val = row[feat]
            mean_val = df[feat].mean()
            std_val = df[feat].std() + 1e-6
            
            # Z-score represents deviation
            z_score = (val - mean_val) / std_val
            
            # Weight deviation by model's feature importance
            importance = importances.get(feat, 0.05)
            
            # For features where HIGHER value is risky (e.g. device sharing)
            if feat in ["graph_device_sharing_degree", "feat_trade_asymmetry", "feat_mmr_velocity", "graph_match_pagerank"]:
                contrib = z_score * importance
            # For features where LOWER value is risky (e.g. entropy, purchase power)
            elif feat in ["session_entropy", "latency_var"]:
                contrib = -z_score * importance
            # For winrate (where either extreme can be suspicious, e.g., low for bots/farmers, high for smurfs)
            elif feat == "winrate_recent":
                contrib = abs(z_score) * importance
            else:
                contrib = z_score * importance
                
            local_contributions.append({
                "feature": label,
                "value": float(val),
                "contribution": float(contrib)
            })
            
        # Sort contributions by absolute impact
        local_contributions = sorted(local_contributions, key=lambda x: abs(x["contribution"]), reverse=True)[:5]
        
        # Generate Natural Language Narratives
        narratives = []
        
        # Check if in win-trading ring
        ring_member = False
        ring_id = None
        for ring in collusion_rings:
            if player_id in ring["members"]:
                ring_member = True
                ring_id = ring["ring_id"]
                break
                
        # Check if in farming group
        farmer_member = False
        farmer_role = ""
        for group in farming_groups:
            if player_id == group["hub_player_id"]:
                farmer_member = True
                farmer_role = "Receiver/Mule Hub"
                break
            elif player_id in group["farmer_ids"]:
                farmer_member = True
                farmer_role = "Worker Account"
                break
                
        # 1. Device sharing flag
        if row["graph_device_sharing_degree"] > 0:
            narratives.append(
                f"Shared Device/IP network detected: Account is linked to {int(row['graph_device_sharing_degree'])} other active account(s) on the same hardware UUID or IP address."
            )
            
        # 2. Bot timing flag
        if row["session_entropy"] < 0.4:
            narratives.append(
                f"Programmatic play pattern: Login interval entropy is extremely low ({row['session_entropy']:.2f}), indicating rigid, automated, and non-human scheduling."
            )
            
        # 3. Trade Asymmetry (Farmers)
        if row["feat_trade_asymmetry"] > 5.0:
            narratives.append(
                f"Asymmetric currency transfer: Account drains gold outwards with an asymmetry ratio of {row['feat_trade_asymmetry']:.1f}x relative to receipts."
            )
            
        # 4. Smurfing
        if row["feat_mmr_velocity"] > 5.0 and row["winrate_recent"] > 0.80:
            narratives.append(
                f"Smurf / Boosting Profile: Sudden MMR acceleration ({row['feat_mmr_velocity']:.1f} pts/day) paired with an elite recent win rate of {row['winrate_recent']*100:.1f}%."
            )
            
        # 5. Collusion rings
        if ring_member:
            narratives.append(
                f"Collusion network active: Identified as a core member of Win-Trading Ring '{ring_id}' with elevated co-match play frequency."
            )
            
        if farmer_member:
            narratives.append(
                f"Farming Syndicate: Flagged as a '{farmer_role}' within a detected Gold Farming Ring."
            )
            
        # Fallback if no narrative triggered but risk is high
        if len(narratives) == 0 and risk_score > 0.5:
            narratives.append(
                "Aggregated Behavioral Flags: General anomaly in play intervals, high match co-occurrence, and irregular latency profiles."
            )
            
        return {
            "player_id": player_id,
            "username": row["username"],
            "risk_score": float(round(risk_score * 100, 1)),
            "risk_level": risk_level,
            "simulated_ground_truth": player_type,
            "narratives": narratives,
            "waterfall_contributions": local_contributions
        }

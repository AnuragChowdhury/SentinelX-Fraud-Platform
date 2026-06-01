import numpy as np
import pandas as pd
from typing import Dict, Any, List
from app.core.config import settings

class UnifiedRiskScorer:
    def __init__(self):
        self.w_graph = settings.WEIGHT_GRAPH
        self.w_behavioral = settings.WEIGHT_BEHAVIORAL
        self.w_device = settings.WEIGHT_DEVICE
        self.w_transaction = settings.WEIGHT_TRANSACTION
        
    def score_players(self, df: pd.DataFrame, supervised_probs: np.ndarray, unsupervised_scores: np.ndarray, gcn_probs: np.ndarray) -> pd.DataFrame:
        """
        Fuses predictions and engineers distinct risk pillars.
        """
        scored_df = df.copy()
        
        # Risk pillar calculation
        # 1. Graph Risk: combination of GCN predictions and structural centrality
        scored_df["risk_graph_raw"] = gcn_probs * 0.70 + scored_df["graph_match_pagerank"] * 0.30
        # Normalize to 0-1 range
        g_max = scored_df["risk_graph_raw"].max()
        g_min = scored_df["risk_graph_raw"].min()
        scored_df["risk_graph"] = (scored_df["risk_graph_raw"] - g_min) / (g_max - g_min + 1e-6)
        
        # 2. Behavioral Risk: combination of session entropy, latency variance, winrate anomalies, and XGBoost predictions
        # Lower session entropy (bots) increase behavioral risk
        # Extreme winrate (smurfs) increase behavioral risk
        entropy_risk = 1.0 - scored_df["session_entropy"]
        winrate_risk = np.abs(scored_df["winrate_recent"] - 0.50) * 2.0
        
        scored_df["risk_behavioral_raw"] = (supervised_probs * 0.40 + 
                                            unsupervised_scores * 0.30 + 
                                            entropy_risk * 0.20 + 
                                            winrate_risk * 0.10)
        b_max = scored_df["risk_behavioral_raw"].max()
        b_min = scored_df["risk_behavioral_raw"].min()
        scored_df["risk_behavioral"] = (scored_df["risk_behavioral_raw"] - b_min) / (b_max - b_min + 1e-6)
        
        # 3. Device Risk: sharing count, shared IPs/devices
        scored_df["risk_device_raw"] = scored_df["feat_device_risk_score"] + (scored_df["graph_device_sharing_degree"] * 0.2)
        d_max = scored_df["risk_device_raw"].max()
        d_min = scored_df["risk_device_raw"].min()
        scored_df["risk_device"] = (scored_df["risk_device_raw"] - d_min) / (d_max - d_min + 1e-6)
        # Ensure that if they don't share devices, risk is exactly 0
        scored_df.loc[scored_df["graph_device_sharing_degree"] == 0, "risk_device"] = 0.0
        
        # 4. Transaction Risk: trade asymmetry and volume
        scored_df["risk_transaction_raw"] = scored_df["feat_trade_asymmetry"] * 0.60 + scored_df["graph_trade_pagerank"] * 0.40
        t_max = scored_df["risk_transaction_raw"].max()
        t_min = scored_df["risk_transaction_raw"].min()
        scored_df["risk_transaction"] = (scored_df["risk_transaction_raw"] - t_min) / (t_max - t_min + 1e-6)
        # Ensure that if they don't trade, risk is exactly 0
        scored_df.loc[(scored_df["graph_trade_in_gold"] == 0) & (scored_df["graph_trade_out_gold"] == 0), "risk_transaction"] = 0.0
        
        # FUSED UNIFIED RISK SCORE
        scored_df["risk_score"] = (scored_df["risk_graph"] * self.w_graph + 
                                   scored_df["risk_behavioral"] * self.w_behavioral + 
                                   scored_df["risk_device"] * self.w_device + 
                                   scored_df["risk_transaction"] * self.w_transaction)
        
        # Clamp to 0.0 - 1.0
        scored_df["risk_score"] = scored_df["risk_score"].clip(0.0, 1.0)
        
        # Categorize
        conditions = [
            (scored_df["risk_score"] >= settings.RISK_THRESHOLD_CRITICAL),
            (scored_df["risk_score"] >= settings.RISK_THRESHOLD_HIGH),
            (scored_df["risk_score"] >= settings.RISK_THRESHOLD_MEDIUM),
        ]
        choices = ["CRITICAL", "HIGH", "MEDIUM"]
        scored_df["risk_level"] = np.select(conditions, choices, default="LOW")
        
        return scored_df

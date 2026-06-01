import numpy as np
import pandas as pd
from sklearn.ensemble import IsolationForest
from typing import Dict, Any, List
from app.core.logging import logger

class UnsupervisedAnomalyModel:
    def __init__(self):
        self.iso_forest = None
        self.feature_cols = [
            "mmr", "account_age_days", "play_frequency", "winrate_recent",
            "purchase_power", "latency_avg", "latency_var", "graph_match_degree",
            "graph_match_pagerank", "graph_trade_in_gold", "graph_trade_out_gold",
            "graph_trade_pagerank", "graph_social_degree", "graph_social_clustering",
            "graph_device_sharing_degree", "session_entropy", "feat_trade_asymmetry",
            "feat_mmr_velocity", "feat_device_risk_score", "feat_teammate_overlap_ratio"
        ]
        
    def train(self, df: pd.DataFrame):
        logger.info("Training unsupervised anomaly model (Isolation Forest)...")
        # Train only on legitimate players to learn the normal behavior profile (semi-supervised/anomaly style)
        legit_data = df[df["player_type"] == "legitimate"][self.feature_cols].values
        
        if len(legit_data) < 10:
            # Fallback if too few legit players
            legit_data = df[self.feature_cols].values
            
        self.iso_forest = IsolationForest(
            n_estimators=100,
            contamination=0.08, # Assume 8% anomalies out of baseline normal
            random_state=42
        )
        self.iso_forest.fit(legit_data)
        logger.info("Isolation Forest trained successfully.")
        
    def predict_anomaly_score(self, feature_vector: np.ndarray) -> float:
        """
        Predict anomaly score. Invert/normalize it so 1 is highly anomalous and 0 is normal.
        """
        if self.iso_forest is None:
            return 0.1
            
        if feature_vector.ndim == 1:
            feature_vector = feature_vector.reshape(1, -1)
            
        # decision_function returns raw anomaly score (lower is more anomalous, range ~ -0.5 to 0.5)
        raw_score = self.iso_forest.decision_function(feature_vector)[0]
        
        # Map raw score to 0 to 1 risk score
        # Since lower score means more anomalous:
        # If raw_score = -0.5 (very anomalous) -> risk = 1.0
        # If raw_score = 0.3 (very normal) -> risk = 0.0
        normalized_risk = 1.0 - (raw_score + 0.5) / 0.8
        normalized_risk = max(0.0, min(normalized_risk, 1.0))
        
        return float(normalized_risk)

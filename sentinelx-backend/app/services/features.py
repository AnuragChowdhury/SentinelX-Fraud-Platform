import numpy as np
import pandas as pd
from typing import Dict, List, Tuple
from app.core.logging import logger
from app.services.generator import SyntheticDataGenerator
from app.services.graph_builder import GraphBuilder

class FeaturePipeline:
    def __init__(self, generator: SyntheticDataGenerator, graph_builder: GraphBuilder):
        self.generator = generator
        self.graph_builder = graph_builder
        self.feature_df = pd.DataFrame()
        
    def extract_all_features(self) -> pd.DataFrame:
        logger.info("Extracting advanced behavioral, temporal, and graph features...")
        
        # 1. Base Player Attributes
        player_list = []
        for p in self.generator.players:
            # Account age in days
            created_dt = pd.to_datetime(p["created_at"])
            account_age_days = max(1.0, (pd.Timestamp.now() - created_dt).days)
            
            player_list.append({
                "player_id": p["player_id"],
                "username": p["username"],
                "player_type": p["player_type"],
                "mmr": p["mmr"],
                "account_age_days": account_age_days,
                "play_frequency": p["play_frequency"],
                "winrate_recent": p["winrate_recent"],
                "purchase_power": 1 if p["purchase_behavior"] == "whale" else (2 if p["purchase_behavior"] == "dolphin" else (3 if p["purchase_behavior"] == "minnow" else 4)),
                "latency_avg": p["latency_avg"],
                "latency_var": p["latency_var"]
            })
        base_df = pd.DataFrame(player_list)
        
        # 2. Graph Metrics
        graph_metrics_df = self.graph_builder.compute_metrics()
        
        # Merge
        merged_df = pd.merge(base_df, graph_metrics_df, on="player_id", how="left")
        
        # 3. Behavioral Temporal Entropy Feature (from login logs)
        entropy_list = []
        login_df = pd.DataFrame(self.generator.login_logs)
        
        if not login_df.empty:
            login_df["timestamp"] = pd.to_datetime(login_df["timestamp"])
            
            for pid, group in login_df.groupby("player_id"):
                if len(group) < 3:
                    entropy_list.append({"player_id": pid, "session_entropy": 1.0})
                    continue
                    
                # Calculate time differences between successive logins (in hours)
                sorted_times = group["timestamp"].sort_values()
                intervals = sorted_times.diff().dropna().dt.total_seconds() / 3600.0
                
                # Compute Shannon entropy of the intervals
                # Let's bin intervals into 8 bins between 0 and 48 hours
                hist, _ = np.histogram(intervals, bins=8, range=(0, 48))
                probs = hist / hist.sum()
                # Filter out zero probabilities to avoid log(0)
                probs = probs[probs > 0]
                entropy = -np.sum(probs * np.log2(probs)) / np.log2(8) # Normalized entropy
                entropy_list.append({"player_id": pid, "session_entropy": float(entropy)})
        else:
            for p in self.generator.players:
                entropy_list.append({"player_id": p["player_id"], "session_entropy": 1.0})
                
        entropy_df = pd.DataFrame(entropy_list)
        merged_df = pd.merge(merged_df, entropy_df, on="player_id", how="left").fillna(1.0)
        
        # 4. Computed Composite Fraud Indicator Features
        # - Trade Asymmetry: Gold sent / (Gold received + 1)
        merged_df["feat_trade_asymmetry"] = merged_df["graph_trade_out_gold"] / (merged_df["graph_trade_in_gold"] + 1.0)
        
        # - Repeated Teammate Overlap: How dense is the play degree relative to play count?
        # Colluders play with a very small set of distinct players repeatedly.
        # So, play_degree / total_matches will be low, while match_pagerank is high!
        # Let's approximate: MMR Velocity = MMR / Account Age
        merged_df["feat_mmr_velocity"] = (merged_df["mmr"] - 1500.0) / merged_df["account_age_days"]
        
        # - Device sharing risk
        # Any device sharing degree > 0 is suspicious in a fair multiplayer game
        merged_df["feat_device_risk_score"] = merged_df["graph_device_sharing_degree"] * 0.4
        
        # - Teammate overlap approximation
        # Colluders will have high match pagerank relative to match degree
        merged_df["feat_teammate_overlap_ratio"] = merged_df["graph_match_pagerank"] / (merged_df["graph_match_degree"] + 1.0)
        
        self.feature_df = merged_df
        logger.info(f"Feature matrix engineered: {self.feature_df.shape[0]} player rows, {self.feature_df.shape[1]} features.")
        return self.feature_df

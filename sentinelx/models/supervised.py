import os
import joblib
import pandas as pd
import numpy as np
from typing import Dict, Tuple, Any
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import precision_recall_fscore_support, accuracy_score, confusion_matrix
import xgboost as xgb
from sentinelx.core.logging import logger

class SupervisedRiskModel:
    def __init__(self):
        self.xgb_model = None
        self.rf_model = None
        self.feature_cols = [
            "mmr", "account_age_days", "play_frequency", "winrate_recent", "purchase_power",
            "latency_avg", "latency_var", "graph_match_degree", "graph_match_pagerank",
            "graph_trade_in_gold", "graph_trade_out_gold", "graph_trade_pagerank",
            "graph_social_degree", "graph_social_clustering", "graph_device_sharing_degree",
            "session_entropy", "feat_trade_asymmetry", "feat_mmr_velocity",
            "feat_device_risk_score", "feat_teammate_overlap_ratio"
        ]
        
    def prepare_data(self, df: pd.DataFrame) -> Tuple[np.ndarray, np.ndarray, np.ndarray, np.ndarray]:
        # Target: 0 if legitimate, 1 if any fraud type (bot, colluder, smurf, farmer, multi_account)
        y = (df["player_type"] != "legitimate").astype(int).values
        X = df[self.feature_cols].values
        
        return train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)
        
    def train(self, df: pd.DataFrame) -> Dict[str, Any]:
        logger.info("Training supervised models (XGBoost & Random Forest)...")
        X_train, X_test, y_train, y_test = self.prepare_data(df)
        
        # 1. XGBoost
        self.xgb_model = xgb.XGBClassifier(
            n_estimators=100,
            max_depth=5,
            learning_rate=0.08,
            random_state=42,
            eval_metric="logloss"
        )
        self.xgb_model.fit(X_train, y_train)
        
        # 2. Random Forest
        self.rf_model = RandomForestClassifier(
            n_estimators=100,
            max_depth=8,
            random_state=42
        )
        self.rf_model.fit(X_train, y_train)
        
        # Evaluate XGBoost
        xgb_preds = self.xgb_model.predict(X_test)
        precision, recall, f1, _ = precision_recall_fscore_support(y_test, xgb_preds, average="binary")
        acc = accuracy_score(y_test, xgb_preds)
        
        tn, fp, fn, tp = confusion_matrix(y_test, xgb_preds).ravel()
        fpr = fp / (tn + fp) if (tn + fp) > 0 else 0.0
        
        logger.info(f"XGBoost Evaluation -> Acc: {acc:.4f}, Prec: {precision:.4f}, Rec: {recall:.4f}, F1: {f1:.4f}, FPR: {fpr:.4f}")
        
        return {
            "accuracy": float(acc),
            "precision": float(precision),
            "recall": float(recall),
            "f1_score": float(f1),
            "fpr": float(fpr),
            "confusion_matrix": {"tn": int(tn), "fp": int(fp), "fn": int(fn), "tp": int(tp)}
        }
        
    def predict_risk(self, feature_vector: np.ndarray) -> float:
        """
        Predict probability of being a fraudster.
        """
        if self.xgb_model is None:
            # Fallback mock if not trained
            return 0.05
            
        if feature_vector.ndim == 1:
            feature_vector = feature_vector.reshape(1, -1)
            
        prob = self.xgb_model.predict_proba(feature_vector)[0, 1]
        return float(prob)
        
    def get_feature_importances(self) -> Dict[str, float]:
        if self.xgb_model is None:
            return {col: 0.05 for col in self.feature_cols}
            
        importances = self.xgb_model.feature_importances_
        return {self.feature_cols[i]: float(importances[i]) for i in range(len(self.feature_cols))}

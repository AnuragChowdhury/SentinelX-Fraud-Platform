import asyncio
import numpy as np
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Query, HTTPException
from typing import List, Dict, Any, Optional
from app.core.config import settings
from app.core.logging import logger
from app.core.plugins import plugin_registry
from app.services.generator import generator_instance
from app.services.graph_builder import GraphBuilder
from app.services.features import FeaturePipeline
from app.models.supervised import SupervisedRiskModel
from app.models.unsupervised import UnsupervisedAnomalyModel
from app.models.graph_ml import GraphMLModel
from app.models.gat_model import GraphAttentionModel
from app.models.risk_scorer import UnifiedRiskScorer
from app.services.collusion import CollusionDetector
from app.services.temporal_graphs import TemporalGraphManager
from app.services.explainability_engine import AdvancedExplainabilityEngine
from app.services.stream import RealTimeStreamSimulator

router = APIRouter()

# Instantiate core engines globally on start
logger.info("Initializing SentinelX V2 Research-Grade Pipelines...")

# 1. Generator and Graph Builders
generator = generator_instance
graph_builder = GraphBuilder(
    generator.players, generator.matches, generator.trades, 
    generator.social_edges, generator.login_logs
)
m_g, t_g, s_g, d_g = graph_builder.build_all_graphs()

# 2. Extract features
pipeline = FeaturePipeline(generator, graph_builder)
features_df = pipeline.extract_all_features()

# 3. Train models
supervised_model = SupervisedRiskModel()
supervised_metrics = supervised_model.train(features_df)

unsupervised_model = UnsupervisedAnomalyModel()
unsupervised_model.train(features_df)

# GCN Fallback logic handled natively inside graph_ml.py
graph_ml_model = GraphMLModel(in_features=len(supervised_model.feature_cols))
gnn_metrics = graph_ml_model.train_graph_gcn(features_df, m_g)

# GAT Model (Graph Attention Network)
gat_model = GraphAttentionModel(in_features=len(supervised_model.feature_cols))
gat_metrics = gat_model.train_gat(features_df, m_g)

# 4. Score Risk
scorer = UnifiedRiskScorer()
supervised_probs = np.array([supervised_model.predict_risk(row) for row in features_df[supervised_model.feature_cols].values])
unsupervised_scores = np.array([unsupervised_model.predict_anomaly_score(row) for row in features_df[supervised_model.feature_cols].values])
gcn_probs = graph_ml_model.predict_graph_risks(features_df, m_g)

scored_df = scorer.score_players(features_df, supervised_probs, unsupervised_scores, gcn_probs)

# 5. Collusion Engines
collusion_detector = CollusionDetector(m_g, t_g, s_g)
win_trading_rings = collusion_detector.detect_win_trading_rings()
farming_groups = collusion_detector.detect_farming_groups()

# 6. Temporal Graph Manager
temporal_manager = TemporalGraphManager(generator.matches, generator.trades)
temporal_snapshots = temporal_manager.generate_sliding_snapshots(num_snapshots=5)

# 7. Explainability Aggregators
explainability_engine = AdvancedExplainabilityEngine(supervised_model, gat_model)

# WebSockets Coordinator
class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []
        
    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)
        logger.info(f"Dashboard WS client connected. Total Active: {len(self.active_connections)}")
        
    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)
            logger.info(f"Client disconnected. Active: {len(self.active_connections)}")
            
    async def broadcast(self, message: Dict[str, Any]):
        for connection in self.active_connections:
            try:
                await connection.send_json(message)
            except Exception as e:
                pass

manager = ConnectionManager()

def handle_live_alert(alert: Dict[str, Any]):
    asyncio.create_task(manager.broadcast(alert))

streamer = RealTimeStreamSimulator(generator.players, on_alert_callback=handle_live_alert)

# ======================================================
# SentinelX V2 - NEW ENDPOINTS
# ======================================================

@router.get("/business-intelligence")
def get_bi_analytics():
    """
    Returns data for the Executive BI dashboard.
    """
    total_players = len(scored_df)
    flagged_players = len(scored_df[scored_df["risk_level"] != "LOW"])
    
    # Hour-by-hour match integrity index over 24 hours (simulated cycle)
    hourly_integrity = [
        {"hour": f"{h:02d}:00", "integrity": float(round(100.0 - np.random.exponential(0.8), 2))}
        for h in range(24)
    ]
    
    # Dynamic saving estimator based on dynamic plugin configuration
    cumulative_trade_vol = sum(t["amount_gold"] for t in generator.trades)
    inflation_prevented = float(round(cumulative_trade_vol * 1.25, 2))
    rewards_saved = float(flagged_players * 150)
    total_savings = inflation_prevented + rewards_saved
    
    # Sliding Precision-Recall curves based on Threshold Tuning Sliders (mock model stats)
    # We generate a list of thresholds from 0.1 to 0.9 to plot on charts
    pr_curve = []
    for t in np.linspace(0.1, 0.9, 9):
        # As threshold increases, precision goes up, recall goes down
        prec = 0.5 + (t * 0.5) - (0.1 if plugin_registry.drift_active else 0.0)
        rec = 1.0 - (t * 0.5) - (0.2 if plugin_registry.drift_active else 0.0)
        f1 = 2 * (prec * rec) / (prec + rec + 1e-6)
        pr_curve.append({
            "threshold": float(round(t, 2)),
            "precision": float(round(prec * 100, 1)),
            "recall": float(round(rec * 100, 1)),
            "f1_score": float(round(f1 * 100, 1))
        })
        
    # Get current thresholds and active drift metrics
    drift_data = plugin_registry.get_drift_metrics()
    
    return {
        "cumulative_savings_usd": total_savings,
        "hourly_match_integrity": hourly_integrity,
        "precision_recall_curves": pr_curve,
        "system_drift_metrics": drift_data,
        "risk_weights": plugin_registry.weights,
        "current_thresholds": plugin_registry.thresholds
    }

@router.post("/business-intelligence/thresholds")
def post_update_thresholds(medium: float, high: float, critical: float):
    plugin_registry.update_thresholds(medium, high, critical)
    # Dynamic scored categories change on standard scoring matrix
    scored_df.loc[scored_df["risk_score"] >= critical, "risk_level"] = "CRITICAL"
    scored_df.loc[(scored_df["risk_score"] >= high) & (scored_df["risk_score"] < critical), "risk_level"] = "HIGH"
    scored_df.loc[(scored_df["risk_score"] >= medium) & (scored_df["risk_score"] < high), "risk_level"] = "MEDIUM"
    scored_df.loc[scored_df["risk_score"] < medium, "risk_level"] = "LOW"
    return {"message": "System threat thresholds dynamically tuned.", "thresholds": plugin_registry.thresholds}

@router.post("/business-intelligence/weights")
def post_update_weights(graph: float, behavioral: float, device: float, transaction: float):
    plugin_registry.update_weights(graph, behavioral, device, transaction)
    # Trigger global rescoring based on updated dynamic pillar weights
    global scored_df
    scorer.w_graph = plugin_registry.weights["graph"]
    scorer.w_behavioral = plugin_registry.weights["behavioral"]
    scorer.w_device = plugin_registry.weights["device"]
    scorer.w_transaction = plugin_registry.weights["transaction"]
    
    scored_df = scorer.score_players(features_df, supervised_probs, unsupervised_scores, gcn_probs)
    return {"message": "Pillar scorer weights dynamically recalculated.", "weights": plugin_registry.weights}

@router.post("/business-intelligence/drift/activate")
def post_activate_drift():
    plugin_registry.activate_concept_drift()
    return {"message": "Concept Drift injection successful.", "metrics": plugin_registry.get_drift_metrics()}

@router.post("/business-intelligence/drift/retrain")
def post_retrain_drift():
    plugin_registry.trigger_online_retraining()
    return {"message": "Online Retraining successfully completed.", "metrics": plugin_registry.get_drift_metrics()}

@router.get("/temporal-analysis")
def get_temporal_analysis():
    return {
        "snapshots": temporal_snapshots,
        "decay_rate_lambda": temporal_manager.decay_rate
    }

@router.get("/players/{player_id}/investigate")
def get_investigation_dossier(player_id: str):
    dossier = explainability_engine.compile_investigation_dossier(player_id, scored_df)
    if "error" in dossier:
        raise HTTPException(status_code=404, detail=dossier["error"])
    return dossier

@router.post("/players/{player_id}/intervene")
def post_intervention(player_id: str, action: str):
    allowed_actions = ["quarantine", "shadow_ban", "whitelist", "freeze_economy", "escalate"]
    if action.lower() not in allowed_actions:
        raise HTTPException(status_code=400, detail=f"Action '{action}' is not configured.")
        
    logger.info(f"INTELLIGENCE ACTION issued for {player_id}: {action.upper()}")
    # Update active df profile state
    scored_df.loc[scored_df["player_id"] == player_id, "status"] = f"action_{action}"
    
    return {
        "status": "success",
        "player_id": player_id,
        "action_taken": action.upper(),
        "intervention_timestamp": datetime.now().isoformat()
    }

# ======================================================
# V1 Endpoints retained for UI retrocompatibility
# ======================================================

@router.get("/overview")
def get_overview():
    total_players = len(scored_df)
    flagged_players = len(scored_df[scored_df["risk_level"] != "LOW"])
    critical_players = len(scored_df[scored_df["risk_level"] == "CRITICAL"])
    high_risk_players = len(scored_df[scored_df["risk_level"] == "HIGH"])
    
    total_matches = len(generator.matches)
    collusion_matches = sum(1 for m in generator.matches if m.get("is_collusion_flag", False))
    match_integrity = float(round((1.0 - collusion_matches / total_matches) * 100, 2)) if total_matches > 0 else 100.0
    
    revenue_saved = 15280 + (flagged_players * 125)
    counts = scored_df["player_type"].value_counts().to_dict()
    
    return {
        "total_players": total_players,
        "flagged_players": flagged_players,
        "critical_players": critical_players,
        "high_risk_players": high_risk_players,
        "match_integrity_score": match_integrity,
        "estimated_revenue_saved_usd": revenue_saved,
        "collusion_rings_count": len(win_trading_rings),
        "farming_syndicates_count": len(farming_groups),
        "distribution_simulated": counts,
        "model_performance": supervised_metrics
    }

@router.get("/players")
def get_players(
    page: int = 1,
    limit: int = 25,
    search: Optional[str] = None,
    risk_level: Optional[str] = None,
    player_type: Optional[str] = None
):
    df_filtered = scored_df.copy()
    
    if search:
        df_filtered = df_filtered[
            df_filtered["username"].str.contains(search, case=False) |
            df_filtered["player_id"].str.contains(search, case=False)
        ]
        
    if risk_level:
        df_filtered = df_filtered[df_filtered["risk_level"] == risk_level.upper()]
        
    if player_type:
        df_filtered = df_filtered[df_filtered["player_type"] == player_type.lower()]
        
    total_count = len(df_filtered)
    start = (page - 1) * limit
    end = start + limit
    paginated_df = df_filtered.iloc[start:end]
    
    cols = ["player_id", "username", "player_type", "mmr", "risk_score", "risk_level", "graph_device_sharing_degree", "winrate_recent"]
    players_list = paginated_df[cols].to_dict(orient="records")
    
    for p in players_list:
        p["risk_score"] = float(round(p["risk_score"] * 100, 1))
        p["winrate_recent"] = float(round(p["winrate_recent"] * 100, 1))
        p["mmr"] = int(p["mmr"])
        
    return {
        "total": total_count,
        "page": page,
        "limit": limit,
        "players": players_list
    }

@router.get("/players/{player_id}")
def get_player_detail(player_id: str):
    player_row = scored_df[scored_df["player_id"] == player_id]
    if player_row.empty:
        raise HTTPException(status_code=404, detail="Player not found")
        
    p_dict = player_row.iloc[0].to_dict()
    p_dict["risk_score"] = float(round(p_dict["risk_score"] * 100, 1))
    p_dict["risk_graph"] = float(round(p_dict["risk_graph"] * 100, 1))
    p_dict["risk_behavioral"] = float(round(p_dict["risk_behavioral"] * 100, 1))
    p_dict["risk_device"] = float(round(p_dict["risk_device"] * 100, 1))
    p_dict["risk_transaction"] = float(round(p_dict["risk_transaction"] * 100, 1))
    p_dict["winrate_recent"] = float(round(p_dict["winrate_recent"] * 100, 1))
    return p_dict

@router.get("/players/{player_id}/explain")
def get_player_explain(player_id: str):
    dossier = explainability_engine.compile_investigation_dossier(player_id, scored_df)
    if "error" in dossier:
        raise HTTPException(status_code=404, detail=dossier["error"])
        
    return {
        "player_id": player_id,
        "username": dossier["username"],
        "risk_score": dossier["risk_score"],
        "risk_level": dossier["risk_level"],
        "simulated_ground_truth": dossier["ground_truth"],
        "narratives": [
            f"Significant contribution in factor: {f['factor']} (weight: +{f['weight']:.2f})"
            for f in dossier["shap_contributions"] if f["weight"] > 0.05
        ],
        "waterfall_contributions": [
            {"feature": f["factor"], "value": f["value"], "contribution": f["weight"]}
            for f in dossier["shap_contributions"]
        ]
    }

@router.get("/collusion")
def get_collusion_rings():
    return {
        "win_trading_rings": win_trading_rings,
        "farming_groups": farming_groups
    }

@router.get("/graph/subgraph")
def get_subgraph(ring_id: Optional[str] = None):
    nodes_to_extract = []
    
    if ring_id:
        ring = next((r for r in win_trading_rings if r["ring_id"] == ring_id), None)
        if ring:
            nodes_to_extract = ring["members"]
    else:
        high_risk = scored_df[scored_df["risk_level"].isin(["CRITICAL", "HIGH"])].sort_values(by="risk_score", reverse=True)
        nodes_to_extract = high_risk["player_id"].head(25).tolist()
        
        extra_nodes = set()
        for u in nodes_to_extract:
            if u in d_g:
                extra_nodes.update(list(d_g.neighbors(u))[:3])
            if u in t_g:
                extra_nodes.update(list(t_g.neighbors(u))[:3])
        nodes_to_extract = list(set(nodes_to_extract).union(extra_nodes))[:60]
        
    if not nodes_to_extract:
        return {"elements": []}
        
    subgraph_data = collusion_detector.extract_subgraph_json(nodes_to_extract)
    
    for el in subgraph_data["elements"]:
        if el["data"]["type"] == "player":
            pid = el["data"]["id"]
            p_row = scored_df[scored_df["player_id"] == pid]
            if not p_row.empty:
                el["data"]["username"] = p_row.iloc[0]["username"]
                el["data"]["risk_level"] = p_row.iloc[0]["risk_level"]
                el["data"]["risk_score"] = float(round(p_row.iloc[0]["risk_score"] * 100, 1))
                el["data"]["player_type"] = p_row.iloc[0]["player_type"]
                
    return subgraph_data

@router.websocket("/stream/alerts")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            data = await websocket.receive_text()
            await websocket.send_json({"type": "heartbeat"})
    except WebSocketDisconnect:
        manager.disconnect(websocket)

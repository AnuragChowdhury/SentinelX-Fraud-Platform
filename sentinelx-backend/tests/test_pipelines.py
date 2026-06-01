import os
import sys
import pytest
import pandas as pd
import numpy as np

# Ensure backend app paths are in sys.path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.services.generator import SyntheticDataGenerator
from app.services.graph_builder import GraphBuilder
from app.services.features import FeaturePipeline
from app.models.risk_scorer import UnifiedRiskScorer

@pytest.fixture
def sample_generator():
    # Mini-scale generator for testing speed
    gen = SyntheticDataGenerator(num_players=100, fraud_ratio=0.10)
    gen.generate_all()
    return gen

def test_synthetic_data_generator(sample_generator):
    assert len(sample_generator.players) == 100
    assert len(sample_generator.guilds) > 0
    assert len(sample_generator.matches) > 0
    
    # Check that we have correct player type assignments
    legit_count = sum(1 for p in sample_generator.players if p["player_type"] == "legitimate")
    fraud_count = sum(1 for p in sample_generator.players if p["player_type"] != "legitimate")
    
    assert legit_count == 90
    assert fraud_count == 10
    
    # Check properties
    for p in sample_generator.players:
        assert "player_id" in p
        assert "username" in p
        assert "mmr" in p
        assert len(p["devices"]) >= 1

def test_graph_builder(sample_generator):
    builder = GraphBuilder(
        sample_generator.players,
        sample_generator.matches,
        sample_generator.trades,
        sample_generator.social_edges,
        sample_generator.login_logs
    )
    
    m_g, t_g, s_g, d_g = builder.build_all_graphs()
    
    # Check nodes match total players
    assert m_g.number_of_nodes() == 100
    assert t_g.number_of_nodes() == 100
    
    # Compute metrics
    metrics_df = builder.compute_metrics()
    assert len(metrics_df) == 100
    assert "graph_match_pagerank" in metrics_df.columns
    assert "graph_trade_in_gold" in metrics_df.columns

def test_feature_pipeline(sample_generator):
    builder = GraphBuilder(
        sample_generator.players,
        sample_generator.matches,
        sample_generator.trades,
        sample_generator.social_edges,
        sample_generator.login_logs
    )
    builder.build_all_graphs()
    
    pipeline = FeaturePipeline(sample_generator, builder)
    features_df = pipeline.extract_all_features()
    
    assert len(features_df) == 100
    assert "feat_trade_asymmetry" in features_df.columns
    assert "session_entropy" in features_df.columns
    
    # Ensure no NaN values exist in key features
    assert features_df["session_entropy"].isnull().sum() == 0
    assert features_df["feat_trade_asymmetry"].isnull().sum() == 0

def test_risk_scorer():
    scorer = UnifiedRiskScorer()
    
    # Mock data
    df = pd.DataFrame([
        {
            "player_id": "PLY_00001",
            "graph_device_sharing_degree": 0,
            "graph_trade_in_gold": 0,
            "graph_trade_out_gold": 0,
            "graph_match_degree": 5,
            "graph_match_pagerank": 0.01,
            "winrate_recent": 0.50,
            "session_entropy": 0.8,
            "feat_device_risk_score": 0.0,
            "feat_trade_asymmetry": 0.0,
            "graph_trade_pagerank": 0.00
        }
    ])
    
    supervised_probs = np.array([0.05])
    unsupervised_scores = np.array([0.08])
    gcn_probs = np.array([0.04])
    
    scored_df = scorer.score_players(df, supervised_probs, unsupervised_scores, gcn_probs)
    
    assert len(scored_df) == 1
    risk_score = scored_df.iloc[0]["risk_score"]
    assert 0.0 <= risk_score <= 1.0
    assert scored_df.iloc[0]["risk_level"] == "LOW"

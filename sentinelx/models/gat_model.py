import numpy as np
import pandas as pd
import networkx as nx
from typing import Dict, List, Tuple, Any
from sentinelx.core.logging import logger

import os

if "RENDER" in os.environ or "PORT" in os.environ:
    HAS_TORCH = False
else:
    try:
        import torch
        import torch.nn as nn
        import torch.nn.functional as F
        HAS_TORCH = True
    except ImportError:
        HAS_TORCH = False

if HAS_TORCH:
    class GATLayer(nn.Module):
        def __init__(self, in_features: int, out_features: int, alpha: float = 0.2, concat: bool = True):
            super(GATLayer, self).__init__()
            self.in_features = in_features
            self.out_features = out_features
            self.alpha = alpha
            self.concat = concat

            # Weight parameters
            self.W = nn.Parameter(torch.zeros(size=(in_features, out_features)))
            nn.init.xavier_uniform_(self.W.data, gain=1.414)
            
            # Attention parameters
            self.a = nn.Parameter(torch.zeros(size=(2 * out_features, 1)))
            nn.init.xavier_uniform_(self.a.data, gain=1.414)

            self.leakyrelu = nn.LeakyReLU(self.alpha)

        def forward(self, h: torch.Tensor, adj_dense: torch.Tensor) -> Tuple[torch.Tensor, torch.Tensor]:
            # Linear transformation: Wh (N x F_out)
            Wh = torch.mm(h, self.W)
            n = Wh.size()[0]

            # Self-attention score calculation
            # Wh_i || Wh_j -> concats Wh_i with Wh_j for all node pairs
            Wh_i = Wh.repeat_interleave(n, dim=0) # N^2 x F_out
            Wh_j = Wh.repeat(n, 1)                # N^2 x F_out
            a_input = torch.cat([Wh_i, Wh_j], dim=1).view(n, n, 2 * self.out_features) # N x N x 2F_out
            
            # Matmul with attention parameter a
            e = self.leakyrelu(torch.matmul(a_input, self.a).squeeze(2)) # N x N

            # Mask out non-neighbors
            zero_vec = -9e15 * torch.ones_like(e)
            attention_scores = torch.where(adj_dense > 0, e, zero_vec)
            
            # Softmax to get normalized attention coefficients
            attention_coefs = F.softmax(attention_scores, dim=1) # N x N
            
            # Dropout attention weights
            attention_coefs = F.dropout(attention_coefs, p=0.1, training=self.training)

            # Neighborhood aggregation
            h_prime = torch.matmul(attention_coefs, Wh)

            if self.concat:
                return F.elu(h_prime), attention_coefs
            else:
                return h_prime, attention_coefs

    class PyTorchGAT(nn.Module):
        def __init__(self, in_features: int, hidden_dim: int = 8, num_heads: int = 2):
            super(PyTorchGAT, self).__init__()
            # Multi-head attention layer
            self.heads = nn.ModuleList([
                GATLayer(in_features, hidden_dim, concat=True) for _ in range(num_heads)
            ])
            # Output aggregator layer
            self.out_layer = GATLayer(hidden_dim * num_heads, 2, concat=False)

        def forward(self, x: torch.Tensor, adj_dense: torch.Tensor) -> Tuple[torch.Tensor, torch.Tensor]:
            # Concat head outputs
            head_outs = []
            head_coefs = []
            for head in self.heads:
                h_prime, coefs = head(x, adj_dense)
                head_outs.append(h_prime)
                head_coefs.append(coefs)
                
            h_concat = torch.cat(head_outs, dim=1)
            logits, out_coefs = self.out_layer(h_concat, adj_dense)
            
            # Return final classification logits and final head attention weights
            return logits, out_coefs

class GraphAttentionModel:
    def __init__(self, in_features: int = 20):
        self.in_features = in_features
        self.use_fallback = not HAS_TORCH
        
        if HAS_TORCH:
            self.gat_net = PyTorchGAT(in_features=in_features)
        else:
            self.gat_net = None
            
        self.feature_cols = [
            "mmr", "account_age_days", "play_frequency", "winrate_recent",
            "purchase_power", "latency_avg", "latency_var", "graph_match_degree",
            "graph_match_pagerank", "graph_trade_in_gold", "graph_trade_out_gold",
            "graph_trade_pagerank", "graph_social_degree", "graph_social_clustering",
            "graph_device_sharing_degree", "session_entropy", "feat_trade_asymmetry",
            "feat_mmr_velocity", "feat_device_risk_score", "feat_teammate_overlap_ratio"
        ]
        
    def train_gat(self, df: pd.DataFrame, G: nx.Graph, epochs: int = 30) -> Dict[str, Any]:
        """
        Train Graph Attention Network or register fallback.
        """
        if self.use_fallback:
            logger.info("Registering Fallback Graph Attention Network (SciPy Topological GAT)...")
            # Calculate topological approximate attention using trade asymmetry and co-plays
            # Fallback coefficients: PageRank * teammate overlap ratio
            self.player_ids = df["player_id"].tolist()
            self.player_idx = {pid: i for i, pid in enumerate(self.player_ids)}
            n = len(self.player_ids)
            
            # Build mock N x N attention matrix
            self.attention_matrix = np.zeros((n, n))
            for u, v, data in G.edges(data=True):
                if u in self.player_idx and v in self.player_idx:
                    i, j = self.player_idx[u], self.player_idx[v]
                    # Attention is proportional to play frequency weight
                    w = data.get("weight", 1.0)
                    self.attention_matrix[i, j] = w
                    self.attention_matrix[j, i] = w
                    
            # Normalize rows to sum to 1.0 (softmax style)
            row_sums = self.attention_matrix.sum(axis=1, keepdims=True)
            self.attention_matrix = np.divide(self.attention_matrix, row_sums, where=row_sums>0)
            
            # Predict fallback risk score
            df["feat_gat_risk"] = df["graph_match_pagerank"] * 0.8 + df["feat_device_risk_score"] * 0.2
            
            logger.info("Fallback Topological Graph Attention successfully loaded.")
            return {"gat_loss": 0.0, "engine": "fallback_topological_gat"}
            
        logger.info("Training Custom Graph Attention Network (GAT)...")
        n = len(df)
        self.player_ids = df["player_id"].tolist()
        self.player_idx = {pid: i for i, pid in enumerate(self.player_ids)}
        
        # Build dense adjacency matrix (required for simple dense GAT implementation)
        adj_dense = nx.to_numpy_array(G, weight="weight")
        # Add self-loops to dense adjacency matrix
        adj_dense += np.eye(n)
        
        # Convert to PyTorch tensors
        adj_tensor = torch.from_numpy(adj_dense).float()
        features = torch.from_numpy(df[self.feature_cols].values).float()
        y = (df["player_type"] != "legitimate").astype(int).values
        labels = torch.from_numpy(y).long()
        
        optimizer = torch.optim.Adam(self.gat_net.parameters(), lr=0.01, weight_decay=5e-4)
        criterion = nn.CrossEntropyLoss()
        
        # Train split
        indices = np.arange(n)
        np.random.shuffle(indices)
        train_size = int(n * 0.6)
        train_idx = indices[:train_size]
        
        self.gat_net.train()
        losses = []
        for epoch in range(epochs):
            optimizer.zero_grad()
            logits, self.attention_matrix_tensor = self.gat_net(features, adj_tensor)
            loss = criterion(logits[train_idx], labels[train_idx])
            loss.backward()
            optimizer.step()
            losses.append(loss.item())
            
        logger.info(f"GAT training completed. Final Epoch Loss: {losses[-1]:.4f}")
        
        # Save final evaluation attention matrix in numpy
        self.gat_net.eval()
        with torch.no_grad():
            logits, attention_tensor = self.gat_net(features, adj_tensor)
            probs = F.softmax(logits, dim=1)[:, 1].numpy()
            self.attention_matrix = attention_tensor.numpy()
            
        df["feat_gat_risk"] = probs
        return {"gat_loss": float(losses[-1]), "engine": "pytorch_gat"}
        
    def get_influential_neighbors(self, player_id: str, top_k: int = 3) -> List[Dict[str, Any]]:
        """
        Identify top K most influential neighbors for a target player using GAT attention weights.
        """
        if player_id not in self.player_idx:
            return []
            
        idx = self.player_idx[player_id]
        
        # Get attention weights sent from neighbor j to target player i (row idx of attention matrix)
        attn_weights = self.attention_matrix[idx]
        
        neighbors_list = []
        for j, weight in enumerate(attn_weights):
            if j == idx or weight < 0.01:
                continue
            neighbors_list.append({
                "neighbor_id": self.player_ids[j],
                "attention_coefficient": float(round(weight * 100, 2))
            })
            
        return sorted(neighbors_list, key=lambda x: x["attention_coefficient"], reverse=True)[:top_k]

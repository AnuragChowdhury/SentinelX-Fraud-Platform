import networkx as nx
import pandas as pd
from typing import List, Dict, Set, Tuple
from app.core.logging import logger

class CollusionDetector:
    def __init__(self, match_graph: nx.Graph, trade_graph: nx.DiGraph, social_graph: nx.Graph):
        self.match_graph = match_graph
        self.trade_graph = trade_graph
        self.social_graph = social_graph
        
    def detect_win_trading_rings(self, min_clique_size: int = 3, min_match_weight: int = 3) -> List[Dict]:
        """
        Find cliques of players who play matches together repeatedly.
        Filters out edges that don't meet the minimum match frequency.
        """
        logger.info("Detecting win-trading cliques...")
        
        # 1. Filter match graph to only include frequent play partners
        frequent_match_graph = nx.Graph()
        frequent_match_graph.add_nodes_from(self.match_graph.nodes())
        
        for u, v, data in self.match_graph.edges(data=True):
            if data.get("weight", 0) >= min_match_weight:
                frequent_match_graph.add_edge(u, v, weight=data["weight"])
                
        # 2. Find cliques
        cliques = list(nx.find_cliques(frequent_match_graph))
        
        # 3. Filter cliques of sufficient size
        rings = []
        for clique in cliques:
            if len(clique) >= min_clique_size:
                # Check if they also trade resources within the clique
                trades_within = 0
                for u in clique:
                    for v in clique:
                        if u != v and self.trade_graph.has_edge(u, v):
                            trades_within += 1
                            
                rings.append({
                    "ring_id": f"RING_{len(rings)+1:03d}",
                    "members": list(clique),
                    "size": len(clique),
                    "trades_within_clique": trades_within,
                    "avg_coplay_weight": float(sum(
                        frequent_match_graph[u][v]["weight"]
                        for i, u in enumerate(clique)
                        for v in clique[i+1:]
                    ) / (len(clique) * (len(clique) - 1) / 2))
                })
                
        logger.info(f"Detected {len(rings)} potential win-trading rings.")
        return sorted(rings, key=lambda x: x["avg_coplay_weight"], reverse=True)
        
    def detect_farming_groups(self, asymmetry_threshold: float = 5.0) -> List[Dict]:
        """
        Detect gold farming star networks: multiple worker nodes transferring 
        wealth to a single central receiver (mule or buyer account).
        """
        logger.info("Detecting reward farming networks...")
        farming_groups = []
        
        # Find hub nodes in the trade network with high in-degree and low out-degree
        for node in self.trade_graph.nodes():
            in_weight = sum(data.get("weight", 0) for _, _, data in self.trade_graph.in_edges(node, data=True))
            out_weight = sum(data.get("weight", 0) for _, _, data in self.trade_graph.out_edges(node, data=True))
            
            # Hub condition: receives a lot of gold, sends almost nothing
            if in_weight > 5000 and (out_weight == 0 or (in_weight / out_weight) > asymmetry_threshold):
                # Nodes sending to this hub
                senders = [u for u, _ in self.trade_graph.in_edges(node)]
                
                # Filter senders: must be primarily outgoing senders
                active_farmers = []
                for s in senders:
                    s_in = sum(d.get("weight", 0) for _, _, d in self.trade_graph.in_edges(s, data=True))
                    s_out = sum(d.get("weight", 0) for _, _, d in self.trade_graph.out_edges(s, data=True))
                    if s_out > 1500 and (s_in == 0 or (s_out / (s_in + 1)) > asymmetry_threshold):
                        active_farmers.append(s)
                        
                if len(active_farmers) >= 2:
                    farming_groups.append({
                        "hub_player_id": node,
                        "receiver_gold": float(in_weight),
                        "farmer_count": len(active_farmers),
                        "farmer_ids": active_farmers
                    })
                    
        logger.info(f"Detected {len(farming_groups)} active reward farming networks.")
        return farming_groups
        
    def extract_subgraph_json(self, nodes: List[str]) -> Dict[str, List[Dict]]:
        """
        Extract Cytoscape-compatible JSON elements for a specific list of player nodes.
        """
        elements = []
        node_set = set(nodes)
        
        # Add player nodes
        for node in node_set:
            elements.append({
                "data": {
                    "id": node,
                    "label": node,
                    "type": "player"
                }
            })
            
        # Add match edges
        for u in node_set:
            for v in node_set:
                if u < v and self.match_graph.has_edge(u, v):
                    w = self.match_graph[u][v].get("weight", 1)
                    elements.append({
                        "data": {
                            "id": f"edge_match_{u}_{v}",
                            "source": u,
                            "target": v,
                            "weight": int(w),
                            "type": "match"
                        }
                    })
                    
        # Add trade edges
        for u in node_set:
            for v in node_set:
                if self.trade_graph.has_edge(u, v):
                    w = self.trade_graph[u][v].get("weight", 0)
                    elements.append({
                        "data": {
                            "id": f"edge_trade_{u}_{v}",
                            "source": u,
                            "target": v,
                            "weight": float(w),
                            "type": "trade"
                        }
                    })
                    
        return {"elements": elements}

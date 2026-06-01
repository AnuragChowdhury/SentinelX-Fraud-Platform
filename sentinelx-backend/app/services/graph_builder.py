import networkx as nx
import pandas as pd
import numpy as np
from typing import Dict, List, Tuple, Any
from app.core.logging import logger

class GraphBuilder:
    def __init__(self, players: List[Dict], matches: List[Dict], trades: List[Dict], social_edges: List[Dict], login_logs: List[Dict]):
        self.players = players
        self.matches = matches
        self.trades = trades
        self.social_edges = social_edges
        self.login_logs = login_logs
        
        # Networks
        self.match_graph = nx.Graph()       # Played together
        self.trade_graph = nx.DiGraph()     # Directed trade flows
        self.social_graph = nx.Graph()      # Friends and guilds
        self.device_graph = nx.Graph()      # Shared devices/IPs
        
        self.metrics_df = pd.DataFrame()
        
    def build_all_graphs(self) -> Tuple[nx.Graph, nx.DiGraph, nx.Graph, nx.Graph]:
        logger.info("Building NetworkX multi-layered graphs...")
        
        # 1. Initialize nodes (players)
        pids = [p["player_id"] for p in self.players]
        self.match_graph.add_nodes_from(pids)
        self.trade_graph.add_nodes_from(pids)
        self.social_graph.add_nodes_from(pids)
        self.device_graph.add_nodes_from(pids)
        
        # 2. Populate Match Graph (Played together)
        for match in self.matches:
            # All combinations of teammates and opponents in this match
            players_in_match = match["team_a"] + match["team_b"]
            for i, p1 in enumerate(players_in_match):
                for p2 in players_in_match[i+1:]:
                    if self.match_graph.has_edge(p1, p2):
                        self.match_graph[p1][p2]["weight"] += 1
                    else:
                        self.match_graph.add_edge(p1, p2, weight=1)
                        
        # 3. Populate Trade Graph
        for trade in self.trades:
            sender = trade["sender_id"]
            receiver = trade["receiver_id"]
            amount = trade["amount_gold"]
            if self.trade_graph.has_edge(sender, receiver):
                self.trade_graph[sender][receiver]["weight"] += amount
                self.trade_graph[sender][receiver]["count"] += 1
            else:
                self.trade_graph.add_edge(sender, receiver, weight=amount, count=1)
                
        # 4. Populate Social Graph
        for edge in self.social_edges:
            p1 = edge["player_id_1"]
            p2 = edge["player_id_2"]
            self.social_graph.add_edge(p1, p2)
            
        # 5. Populate Device/IP Sharing Graph
        # Group logins by device and IP to find shared connections
        login_df = pd.DataFrame(self.login_logs)
        if not login_df.empty:
            # Account shares per device
            device_groups = login_df.groupby("device_id")["player_id"].unique()
            for players_shared in device_groups:
                if len(players_shared) > 1:
                    for i, p1 in enumerate(players_shared):
                        for p2 in players_shared[i+1:]:
                            if self.device_graph.has_edge(p1, p2):
                                self.device_graph[p1][p2]["weight"] += 1
                            else:
                                self.device_graph.add_edge(p1, p2, weight=1)
                                
            # Account shares per IP
            ip_groups = login_df.groupby("ip_address")["player_id"].unique()
            for players_shared in ip_groups:
                if len(players_shared) > 1:
                    for i, p1 in enumerate(players_shared):
                        for p2 in players_shared[i+1:]:
                            if self.device_graph.has_edge(p1, p2):
                                self.device_graph[p1][p2]["weight"] += 1
                            else:
                                self.device_graph.add_edge(p1, p2, weight=1)
                                
        logger.info("All NetworkX graphs constructed successfully.")
        return self.match_graph, self.trade_graph, self.social_graph, self.device_graph
        
    def compute_metrics(self) -> pd.DataFrame:
        logger.info("Computing topological graph metrics...")
        pids = [p["player_id"] for p in self.players]
        
        # 1. Match Graph Metrics
        # PageRank (influence in game sessions)
        try:
            match_pagerank = nx.pagerank(self.match_graph, weight="weight")
        except Exception:
            match_pagerank = {pid: 0.0 for pid in pids}
            
        match_degrees = dict(self.match_graph.degree())
        
        # 2. Trade Graph Metrics
        trade_in_degree = dict(self.trade_graph.in_degree(weight="weight")) # Gold received
        trade_out_degree = dict(self.trade_graph.out_degree(weight="weight")) # Gold sent
        trade_pagerank = nx.pagerank(self.trade_graph, weight="weight")
        
        # 3. Social Graph Metrics
        social_degrees = dict(self.social_graph.degree())
        clustering_coeff = nx.clustering(self.social_graph)
        
        # 4. Device Sharing Metrics
        device_degrees = dict(self.device_graph.degree())
        
        # 5. Community Detection using NetworkX Louvain
        # Use match_graph or social_graph for community detection
        try:
            communities = nx.community.louvain_communities(self.match_graph, weight="weight")
            community_map = {}
            for comm_idx, comm in enumerate(communities):
                for member in comm:
                    community_map[member] = comm_idx
        except Exception as e:
            logger.warn(f"Community detection fallback: {e}")
            community_map = {pid: 0 for pid in pids}
            
        # Compile into a DataFrame
        metrics_list = []
        for pid in pids:
            metrics_list.append({
                "player_id": pid,
                "graph_match_degree": match_degrees.get(pid, 0),
                "graph_match_pagerank": float(match_pagerank.get(pid, 0.0)),
                "graph_trade_in_gold": float(trade_in_degree.get(pid, 0.0)),
                "graph_trade_out_gold": float(trade_out_degree.get(pid, 0.0)),
                "graph_trade_pagerank": float(trade_pagerank.get(pid, 0.0)),
                "graph_social_degree": social_degrees.get(pid, 0),
                "graph_social_clustering": float(clustering_coeff.get(pid, 0.0)),
                "graph_device_sharing_degree": device_degrees.get(pid, 0),
                "graph_community_id": community_map.get(pid, 0)
            })
            
        self.metrics_df = pd.DataFrame(metrics_list)
        logger.info(f"Topological graph metrics computed for {len(self.metrics_df)} player nodes.")
        return self.metrics_df

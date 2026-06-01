import random
import uuid
import numpy as np
import pandas as pd
from datetime import datetime, timedelta
from typing import Dict, List, Tuple
from app.core.config import settings
from app.core.logging import logger

class SyntheticDataGenerator:
    def __init__(self, num_players: int = settings.NUM_PLAYERS, fraud_ratio: float = settings.FRAUD_RATIO):
        self.num_players = num_players
        self.fraud_ratio = fraud_ratio
        
        # Internal state
        self.players = []
        self.guilds = []
        self.matches = []
        self.trades = []
        self.social_edges = []
        self.login_logs = []
        
        # Lookups
        self.player_map = {}
        self.device_pool = [str(uuid.uuid4()) for _ in range(int(num_players * 0.9))]
        self.ip_pool = [f"192.168.1.{random.randint(2, 254)}" for _ in range(int(num_players * 0.85))]
        
    def generate_all(self):
        logger.info(f"Starting synthetic data generation for {self.num_players} players...")
        self._generate_guilds()
        self._generate_players()
        self._generate_social_network()
        self._generate_matches_and_trades()
        self._generate_logins()
        logger.info("Synthetic data generation completed successfully!")
        
    def _generate_guilds(self):
        # Generate ~1 guild per 30 players
        num_guilds = max(5, int(self.num_players / 30))
        guild_names = ["ApexPredators", "ShadowClan", "EliteVanguard", "PhoenixForce", "FrostBite", 
                       "TitanGaming", "NexusRebels", "CelestialDawn", "IronWolves", "VoidWalkers",
                       "Nightstalkers", "GoldRushers", "ChaosReign", "CrimsonOaths", "ValiantGuard"]
        
        for i in range(num_guilds):
            guild_id = f"GLD_{i:04d}"
            name = f"{random.choice(guild_names)} {random.randint(1, 99)}"
            self.guilds.append({
                "guild_id": guild_id,
                "guild_name": name,
                "created_at": (datetime.now() - timedelta(days=random.randint(30, 365))).isoformat()
            })
            
    def _generate_players(self):
        num_fraud = int(self.num_players * self.fraud_ratio)
        num_legit = self.num_players - num_fraud
        
        # Fraud types
        fraud_types = ["bot", "colluder", "smurf", "farmer", "multi_account"]
        
        # Pre-assign fraud labels to guarantee correct ratios
        player_types = ["legitimate"] * num_legit
        for i in range(num_fraud):
            player_types.append(random.choice(fraud_types))
        random.shuffle(player_types)
        
        # Shared pools for collusion and multi-accounts
        collusion_teams = [[f"PLY_{random.randint(0, self.num_players-1):05d}" for _ in range(5)] for _ in range(10)]
        shared_devices = [str(uuid.uuid4()) for _ in range(15)]
        shared_ips = [f"10.0.0.{random.randint(2, 254)}" for _ in range(12)]
        
        names_list = ["Shadow", "Sniper", "Viper", "Rex", "Wolf", "Alpha", "Blade", "Rogue", "Ghost", "Titan",
                      "Neon", "Cyber", "Dark", "Frost", "Void", "Crimson", "Blaze", "Nova", "Zenith", "Apex"]
        suffix_list = ["Slayer", "Hunter", "Knight", "Master", "Ranger", "Striker", "Storm", "Drifter", "Nexus", "Zero"]

        for i in range(self.num_players):
            player_id = f"PLY_{i:05d}"
            ptype = player_types[i]
            
            # Base stats
            username = f"{random.choice(names_list)}{random.choice(suffix_list)}{random.randint(10, 999)}"
            guild = random.choice(self.guilds) if random.random() < 0.4 else None
            guild_id = guild["guild_id"] if guild else None
            
            created_days_ago = random.randint(10, 365)
            
            # Default values (legitimate player)
            mmr = float(np.random.normal(1500, 300))
            mmr = max(500.0, min(mmr, 3000.0))
            
            play_frequency = float(np.random.gamma(shape=3.0, scale=1.5)) # Sessions per day
            purchase_behavior = random.choices(["f2p", "minnow", "dolphin", "whale"], weights=[0.70, 0.20, 0.08, 0.02])[0]
            
            # Latency (ms)
            latency_avg = float(random.uniform(20.0, 150.0))
            latency_var = float(random.uniform(2.0, 20.0))
            
            devices = [random.choice(self.device_pool)]
            ips = [random.choice(self.ip_pool)]
            behavioral_style = random.choice(["casual", "hardcore", "grinder", "erratic"])
            winrate_recent = float(random.uniform(0.40, 0.60))
            
            # SPECIFIC BEHAVIORS PER FRAUD TYPE
            if ptype == "bot":
                username = f"GamerBot_{random.randint(1000, 9999)}"
                play_frequency = float(random.uniform(15.0, 24.0)) # Plays constantly
                behavioral_style = "grinder"
                purchase_behavior = "f2p"
                latency_avg = float(random.uniform(10.0, 30.0))  # Consistent high-speed server response
                latency_var = float(random.uniform(0.1, 0.5))    # Negligible variance
                winrate_recent = float(random.uniform(0.45, 0.52)) # Extremely flat winrate
                
            elif ptype == "colluder":
                # Part of boosting or win-trading rings
                mmr = float(random.uniform(2200, 2800)) # Often high-tier due to boosting
                play_frequency = float(random.uniform(2.0, 8.0))
                behavioral_style = "erratic"
                # Shared devices/IPs with other colluders occasionally
                if random.random() < 0.4:
                    devices.append(random.choice(shared_devices))
                    ips.append(random.choice(shared_ips))
                winrate_recent = float(random.uniform(0.70, 0.95)) # Suspiciously high winrate in traded matches
                
            elif ptype == "smurf":
                # High skill, low account age
                created_days_ago = random.randint(1, 8) # Brand new account
                mmr = float(random.uniform(2300, 2900)) # Placed extremely high or rising fast
                winrate_recent = float(random.uniform(0.85, 0.98)) # Obliterating standard matchmaking
                play_frequency = float(random.uniform(5.0, 12.0))
                behavioral_style = "hardcore"
                purchase_behavior = "f2p" # Rarely purchase on secondary smurf accounts
                
            elif ptype == "farmer":
                # Low skill, high playtime, trades everything away
                play_frequency = float(random.uniform(12.0, 20.0))
                behavioral_style = "grinder"
                mmr = float(random.uniform(600, 1100)) # Intentionally low MMR to farm easy matches
                purchase_behavior = "f2p"
                winrate_recent = float(random.uniform(0.35, 0.48))
                
            elif ptype == "multi_account":
                # Shares exact device and IP with many accounts
                devices = [random.choice(shared_devices[:5])]
                ips = [random.choice(shared_ips[:4])]
                play_frequency = float(random.uniform(1.0, 4.0))
                behavioral_style = "casual"
                purchase_behavior = "f2p"
                
            # Keep created_at consistent
            created_at = (datetime.now() - timedelta(days=created_days_ago)).isoformat()
            
            p_profile = {
                "player_id": player_id,
                "username": username,
                "player_type": ptype,
                "guild_id": guild_id,
                "mmr": mmr,
                "created_at": created_at,
                "play_frequency": play_frequency,
                "purchase_behavior": purchase_behavior,
                "latency_avg": latency_avg,
                "latency_var": latency_var,
                "devices": devices,
                "ips": ips,
                "behavioral_style": behavioral_style,
                "winrate_recent": winrate_recent,
                "status": "active" if ptype == "legitimate" or random.random() > 0.15 else "flagged"
            }
            
            self.players.append(p_profile)
            self.player_map[player_id] = p_profile

    def _generate_social_network(self):
        # Generate friendship edges
        # Legitimate players have random friendships
        # Colluders form tight cliques
        # Farmers have few friends
        # Bots have zero friends
        
        # 1. Random social network for legit players
        legit_players = [p for p in self.players if p["player_type"] == "legitimate"]
        for p in legit_players:
            num_friends = random.randint(1, 10)
            friends = random.sample(legit_players, min(num_friends, len(legit_players)))
            for f in friends:
                if p["player_id"] != f["player_id"]:
                    self.social_edges.append({
                        "player_id_1": p["player_id"],
                        "player_id_2": f["player_id"],
                        "edge_type": "friend",
                        "created_at": (datetime.now() - timedelta(days=random.randint(1, 100))).isoformat()
                    })
                    
        # 2. Collusion Rings (tight social cliques)
        colluders = [p for p in self.players if p["player_type"] == "colluder"]
        if len(colluders) >= 5:
            # Group colluders into rings of size 4-7
            rings = [colluders[i:i+5] for i in range(0, len(colluders), 5)]
            for ring in rings:
                if len(ring) < 2:
                    continue
                # Make a fully connected clique
                for p1 in ring:
                    for p2 in ring:
                        if p1["player_id"] != p2["player_id"]:
                            self.social_edges.append({
                                "player_id_1": p1["player_id"],
                                "player_id_2": p2["player_id"],
                                "edge_type": "friend",
                                "created_at": (datetime.now() - timedelta(days=random.randint(1, 30))).isoformat()
                            })

    def _generate_matches_and_trades(self):
        # We will simulate 10 matches per player on average to construct the graphs
        num_matches = self.num_players * 8
        logger.info(f"Simulating {num_matches} match completions & trade interactions...")
        
        # Separate players by types
        colluders = [p for p in self.players if p["player_type"] == "colluder"]
        farmers = [p for p in self.players if p["player_type"] == "farmer"]
        legit_and_others = [p for p in self.players if p["player_type"] not in ["colluder", "farmer"]]
        
        # "Mule" or "Receiver" account for reward farmers
        # Let's assign 2 elite players to be the receivers of farmer trades
        receivers = random.sample(legit_and_others, min(3, len(legit_and_others)))
        receiver_ids = [r["player_id"] for r in receivers]
        
        for match_idx in range(num_matches):
            match_id = f"MCH_{match_idx:06d}"
            
            # Select game mode (e.g. 3v3 or 5v5)
            team_size = random.choice([3, 5])
            
            # Determine if this match is a Win-Trading match
            is_win_trading = False
            match_players = []
            
            if len(colluders) >= team_size * 2 and random.random() < 0.25:
                # Win trading collusion match
                is_win_trading = True
                # Pick a specific ring of colluders
                ring_players = random.sample(colluders, team_size * 2)
                match_players = [p["player_id"] for p in ring_players]
            else:
                # Standard match
                match_players = [p["player_id"] for p in random.sample(self.players, team_size * 2)]
                
            # Divide into Team A and Team B
            team_a = match_players[:team_size]
            team_b = match_players[team_size:]
            
            # Winner selection
            if is_win_trading:
                # Team A is boosted, Team B throws intentionally
                winner = "TeamA"
            else:
                # Higher average MMR has a higher chance to win
                mmr_a = np.mean([self.player_map[pid]["mmr"] for pid in team_a])
                mmr_b = np.mean([self.player_map[pid]["mmr"] for pid in team_b])
                prob_a = 1.0 / (1.0 + 10.0 ** ((mmr_b - mmr_a) / 400.0))
                winner = "TeamA" if random.random() < prob_a else "TeamB"
                
            duration = random.randint(300, 1800) # seconds
            rewards = random.randint(50, 500)    # in-game gold
            
            match_time = (datetime.now() - timedelta(days=random.randint(0, 14), hours=random.randint(0, 23))).isoformat()
            
            self.matches.append({
                "match_id": match_id,
                "team_a": team_a,
                "team_b": team_b,
                "winner": winner,
                "duration_seconds": duration,
                "rewards_gold": rewards,
                "timestamp": match_time,
                "is_collusion_flag": is_win_trading
            })
            
            # TRADING NETWORK SIMULATION
            # Trigger trades during or after matches
            # Reward farmers trade large volumes to main accounts (receivers)
            # Legit players trade minor things bilaterally
            if random.random() < 0.15:
                # A trade occurred!
                trade_id = f"TRD_{len(self.trades):06d}"
                
                # Check if a farmer is doing the trade
                sender_id = None
                receiver_id = None
                amount = 0
                
                if len(farmers) > 0 and random.random() < 0.40:
                    # Farmer sending gold/items to mule receiver
                    sender_id = random.choice(farmers)["player_id"]
                    receiver_id = random.choice(receiver_ids)
                    amount = random.randint(2000, 15000) # Unbalanced large reward transfer
                else:
                    # Legitimate or other player trading normally
                    sender_id = random.choice(match_players)
                    receiver_id = random.choice([p for p in match_players if p != sender_id])
                    amount = random.randint(100, 800) # Small balanced trade
                    
                self.trades.append({
                    "trade_id": trade_id,
                    "sender_id": sender_id,
                    "receiver_id": receiver_id,
                    "amount_gold": amount,
                    "timestamp": match_time,
                    "is_unbalanced": amount > 1500
                })
                
    def _generate_logins(self):
        # Generate login logs for players to analyze behavioral patterns and session entropy
        for p in self.players:
            pid = p["player_id"]
            ptype = p["player_type"]
            freq = p["play_frequency"]
            
            # Legitimate players: active during day, resting at night (natural session entropy)
            # Bots: active continuously, flat interval patterns (extremely low entropy)
            num_logins = int(freq * 10)
            
            last_login = datetime.now() - timedelta(days=20)
            for _ in range(num_logins):
                # Bot timings are highly rigid
                if ptype == "bot":
                    interval = timedelta(hours=24.0 / freq) # Exactly spaced out
                    login_time = last_login + interval
                    latency = p["latency_avg"] + np.random.normal(0, p["latency_var"])
                else:
                    interval = timedelta(hours=random.uniform(0.5, 48.0 / freq))
                    login_time = last_login + interval
                    # Dynamic latency
                    latency = p["latency_avg"] + np.random.normal(0, p["latency_var"])
                    
                # Ensure we don't simulate into the future
                if login_time > datetime.now():
                    break
                    
                last_login = login_time
                
                self.login_logs.append({
                    "player_id": pid,
                    "timestamp": login_time.isoformat(),
                    "device_id": random.choice(p["devices"]),
                    "ip_address": random.choice(p["ips"]),
                    "latency": max(5.0, float(latency))
                })

# Global instance for FastAPI endpoints
generator_instance = SyntheticDataGenerator()
# Run initial generation in global space to speed up server boot
generator_instance.generate_all()

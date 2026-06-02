# SentinelX: Unified Anti-Fraud & Collusion Command Board

🛡️ **SentinelX** is a research-grade, unified anti-fraud command console and multiplayer collusion detection platform designed for large-scale gaming ecosystems (similar to security intelligence setups at Riot Games, Epic Games, Electronic Arts, and EA).

SentinelX V2 consolidates the entire feature extraction, multi-layered NetworkX graph builders, PyTorch-fallback Graph Neural Networks (GNN/GAT), localized Z-score explainability attributions, and dynamic executive command sliders into a single, high-performance, responsive **Streamlit Cloud Dashboard**.

---

## 🏗️ 1. Platform Architecture

The system utilizes an in-memory cached reactive design to coordinate machine learning predictions and state mutations in real-time, eliminating the latency and overhead of split-process architectures:

```
+---------------------------------------------------------------------------------+
|                         GAME LOGS & TELEMETRY SYSTEMS                           |
|       (Generates Logins, Match Completions, and Market Trade Data Streams)      |
+---------------------------------------------------------------------------------+
                                         │
                                         ▼ (Cached Resource Loader)
+---------------------------------------------------------------------------------+
|                        DYNAMIC INTERACTION GRAPH BUILDER                        |
|       Engineers 4 core player relationship layers using NetworkX:               |
|                                                                                 |
|   1. MATCH GRAPH      2. TRANSACTION GRAPH    3. FRIEND GRAPH   4. DEVICE GRAPH |
|   (Undirected co-play)  (Directed cash flows)  (Social circles)  (IP/UUID sharing)|
+---------------------------------------------------------------------------------+
         │                                                        │
         ▼ (Extract topological centralities)                     ▼ (Pass Graph Edges)
+------------------------------------+          +---------------------------------+
|       FEATURE EXTRACTION ENGINE    |          |     GRAPH NEURAL NETWORKS       |
|  - Login Interval Shannon Entropy  |          |  - Topological PageRank GCN     |
|  - Financial Asymmetry Index       |          |  - Exploded 2-head GAT          |
|  - Teammate Overlap & MMR Velocity |          |    (Attention Coefficients)     |
+------------------------------------+          +---------------------------------+
         │                                                        │
         ▼ (Formulate player feature matrix)                      ▼ (Predict Node Risks)
+---------------------------------------------------------------------------------+
|                            ENSEMBLE RISK SCORE FUSION                           |
|  Fuses (Topological features + GNN risks + XGBoost supervised probabilities +   |
|         Isolation Forest anomaly coefficients) using configurable weights.      |
+---------------------------------------------------------------------------------+
                                         │
                                         ▼ (In-Memory Session State)
+---------------------------------------------------------------------------------+
|                        UNIFIED STREAMLIT COMMAND CONSOLE                        |
|   - Interactive SHAP waterfall Z-score charts & chronological timelines        |
|   - Real-time threat weight recalculations & enforcements (Quarantines, bans)  |
+---------------------------------------------------------------------------------+
```

---

## 📈 2. Temporal Graph Pipeline

Static graphs capture historical structural relationships but fail to track the high-velocity evolution of modern botnets and collusion syndicates. SentinelX V2 introduces **Temporal Graph Intelligence** to track behavioral and network evolution.

### A. Exponential Edge Decay
To ensure the platform automatically prioritizes recent player interactions while retaining historical context, edge weights decay exponentially over time:

$$W_{ij}(t) = \beta_{ij} \times e^{-\lambda \times \Delta t_d}$$

*   **$\beta_{ij}$**: Base interaction magnitude (e.g., number of co-played matches, gold quantity traded).
*   **$\lambda$**: Evasion decay coefficient (default `0.05` per day), governing the memory footprint of past relations.
*   **$\Delta t_d$**: Time delta in days between the telemetry timestamp and the target snapshot epoch.

This pipeline operates inside `sentinelx/services/temporal_graphs.py` to construct time-series graph slices.

### B. Risk Momentum & Curve Velocity
SentinelX calculates the **velocity (slope)** and **acceleration (curvature)** of player threat levels to flag rapid escalations before they damage the ecosystem:

$$\text{Risk Velocity} = \frac{R_t - R_{t-1}}{\Delta t}$$

$$\text{Risk Acceleration} = \frac{\text{Velocity}_t - \text{Velocity}_{t-1}}{\Delta t}$$

$$\text{Burst Activity Score} = \max\left(0, 10 \times \text{Velocity} + 5 \times \text{Acceleration}\right)$$

This allows the UI's Case Investigation Center to track threat trajectories and alert security teams to rapid escalation spikes.

---

## 🧠 3. Explainable GAT Workflow

To solve the "black box" problem of Graph Neural Networks, SentinelX incorporates a **Graph Attention Network (GAT)** to deliver explainable, localized structural risk attributions.

### A. Graph Self-Attention Mechanism
The system implements multi-head self-attention to calculate normalized attention coefficients ($\alpha_{ij}$) between a player node $i$ and its neighboring nodes $j \in \mathcal{N}_i$:

$$\alpha_{ij} = \frac{\exp\left(\text{LeakyReLU}\left(\mathbf{a}^\top \left[ \mathbf{W}\vec{h}_i \,||\, \mathbf{W}\vec{h}_j \right]\right)\right)}{\sum_{k \in \mathcal{N}_i} \exp\left(\text{LeakyReLU}\left(\mathbf{a}^\top \left[ \mathbf{W}\vec{h}_i \,||\, \mathbf{W}\vec{h}_k \right]\right)\right)}$$

*   **$\mathbf{W}$**: Shared weight parameter matrix projecting node behavioral features to high-dimensional spaces.
*   **$\mathbf{a}$**: Weight vector parameterized by attention heads.
*   **$||$**: Concatenation operator fusing neighbor vectors.

---

## 🛡️ 4. Streamlit Dashboard Console Modules

### 🎯 Tab 1: Executive Command Board (Overview & BI)
*   **Reactive KPI Indicators**: Metric tiles tracking Total Audited Accounts, Flagged Risk Levels, Match Integrity curves, and Mitigated Revenue blockages calculated reactively.
*   **Threshold Calibrator Sliders**: Dynamically tune Medium, High, and Critical thresholds to instantly re-classify the database in memory.
*   **Scorer Weight Recalculation**: Adjust Graph, Behavioral, Hardware, and Market weights and click **"Recalculate Scorer Models"** to re-score the entire active player database instantly!
*   **Evasion Drift Sandbox**: Simulate concept drift and run model retraining, plotting dynamic Precision-Recall Plotly curves.

### 🔎 Tab 2: Case Investigation Center (Dossier Search)
*   **Search Directory**: Filter the active database by usernames, IDs, or risk levels.
*   **Attribution Waterfall (SHAP)**: Renders a horizontal Plotly bar chart showing positive (risk-increasing) and negative (risk-decreasing) behavioral attributions.
*   **Chronological Timelines**: Vertically-styled HTML timeline card showing the account's historical audit triggers leading to the alert.
*   **GAT Peer coefficients**: Displays multi-head peer attention weights from co-play win-trading cliques.
*   **Banning & Interventions**: Click **Quarantine**, **Shadow-Ban**, or **Whitelist** to instantly modify player state in `st.session_state`.

### 👥 Tab 3: Win-Trading & Collusion
*   **Ring Explorer**: Select detected win-trading rings to view members, winrates, and trade activities.
*   **Clique Subgraphs**: Plots visual NetworkX subgraphs with node colors mapped to risk classes and node sizes mapped to PageRank centralities.

---

## 💻 5. Consolidated Technical Stack
*   **Front/Back Dashboard**: Streamlit (Reactive `st.session_state` workflow)
*   **Graph Framework**: NetworkX (multi-graph metrics, Louvain clustering partitions)
*   **Machine Learning**: XGBoost (Supervised Classifiers), Scikit-Learn (Isolation Forest Anomalies)
*   **Attributions**: Localized Z-score & SHAP-Attribution mathematical modeling
*   **Visualization**: Plotly Express, Matplotlib

---

## 🚀 6. Developer & Run Guide

### 1. Run Dashboard Locally

Make sure Python (3.10 to 3.12) is installed:

```bash
# Navigate to project root directory
cd Fraud_Detection

# Activate virtual environment
# Windows:
.venv\Scripts\activate
# macOS/Linux:
source .venv/bin/activate

# Install requirements
pip install -r requirements.txt

# Launch Streamlit app
streamlit run app.py
```
The console dashboard will open instantly on **`http://localhost:8501`**.

### 2. Run Automated Verification Tests
Verify the complete data generators, NetworkX multi-graphs, and unified risk scorer integrity:
```bash
pytest tests/
```

---

## 🌌 7. Streamlit Cloud 1-Click Deployment Guide

Streamlit Cloud pulls directly from GitHub, handles Python virtual environments out-of-the-box, and hosts applications for free:

1.  Push all clean files to your GitHub repository:
    ```bash
    git add .
    git commit -m "feat: complete unified Streamlit transition"
    git push origin main
    ```
2.  Go to [share.streamlit.io](https://share.streamlit.io) and log in using your GitHub account.
3.  Click **New App** in the top right.
4.  Configure the application settings:
    *   **Repository**: `AnuragChowdhury/SentinelX-Fraud-Platform`
    *   **Branch**: `main`
    *   **Main file path**: `app.py`
5.  Click **Deploy!**

Streamlit Cloud will automatically parse `requirements.txt`, install your machine learning libraries, compile the topological fallbacks, and launch your anti-fraud dashboard in **under 30 seconds**!

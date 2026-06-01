import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Cpu, 
  Activity, 
  GitFork, 
  Terminal, 
  Info, 
  Sparkles, 
  Layers, 
  TrendingUp, 
  BookOpen, 
  Code,
  CheckCircle,
  HelpCircle,
  DollarSign
} from 'lucide-react';

function PlatformGuide() {
  const [guideSubTab, setGuideSubTab] = useState('overview');

  const getSubTabColor = (tab) => {
    return guideSubTab === tab ? 'var(--neon-cyan)' : 'var(--text-secondary)';
  };

  return (
    <div style={{ padding: '1.5rem 2rem', paddingBottom: '3rem', maxWidth: '1200px', margin: '0 auto' }}>
      
      {/* 1. COMPONENT HEADER */}
      <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <span className="badge low" style={{ color: 'var(--neon-cyan)', border: '1px solid rgba(0,240,255,0.2)', background: 'rgba(0,240,255,0.05)', fontSize: '0.62rem', letterSpacing: '0.5px', marginBottom: '0.5rem' }}>
            KNOWLEDGE BASE & SPECIFICATIONS
          </span>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.75rem', fontWeight: 800 }}>SentinelX V2 Interactive Guide</h1>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
            Deep dive into the operational mechanics, multi-layered Graph Neural Network architectures, and math-driven feature scoring.
          </p>
        </div>

        {/* Dynamic Icon */}
        <div style={{ background: 'rgba(0, 240, 255, 0.05)', color: 'var(--neon-cyan)', border: '1px solid rgba(0, 240, 255, 0.2)', borderRadius: '8px', padding: '0.65rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem' }}>
          <BookOpen size={16} />
          <span>Research-Grade Platform</span>
        </div>
      </div>

      {/* 2. SUB-NAVIGATION FOR GUIDE */}
      <div className="glass-card" style={{ padding: '0.35rem', display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', background: 'rgba(15, 17, 26, 0.7)', border: '1px solid var(--border-color)', borderRadius: '8px' }}>
        <button 
          onClick={() => setGuideSubTab('overview')}
          style={{
            flexGrow: 1, padding: '0.6rem', border: 'none', borderRadius: '6px', cursor: 'pointer',
            background: guideSubTab === 'overview' ? 'rgba(0, 240, 255, 0.08)' : 'transparent',
            color: getSubTabColor('overview'), fontWeight: 'bold', fontSize: '0.78rem', transition: 'all 0.2s ease',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.45rem'
          }}
        >
          <Info size={14} /> Platform Overview
        </button>
        <button 
          onClick={() => setGuideSubTab('architecture')}
          style={{
            flexGrow: 1, padding: '0.6rem', border: 'none', borderRadius: '6px', cursor: 'pointer',
            background: guideSubTab === 'architecture' ? 'rgba(0, 240, 255, 0.08)' : 'transparent',
            color: getSubTabColor('architecture'), fontWeight: 'bold', fontSize: '0.78rem', transition: 'all 0.2s ease',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.45rem'
          }}
        >
          <Layers size={14} /> Interactive Architecture
        </button>
        <button 
          onClick={() => setGuideSubTab('features')}
          style={{
            flexGrow: 1, padding: '0.6rem', border: 'none', borderRadius: '6px', cursor: 'pointer',
            background: guideSubTab === 'features' ? 'rgba(0, 240, 255, 0.08)' : 'transparent',
            color: getSubTabColor('features'), fontWeight: 'bold', fontSize: '0.78rem', transition: 'all 0.2s ease',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.45rem'
          }}
        >
          <Code size={14} /> Mathematical Pillars
        </button>
        <button 
          onClick={() => setGuideSubTab('walkthroughs')}
          style={{
            flexGrow: 1, padding: '0.6rem', border: 'none', borderRadius: '6px', cursor: 'pointer',
            background: guideSubTab === 'walkthroughs' ? 'rgba(0, 240, 255, 0.08)' : 'transparent',
            color: getSubTabColor('walkthroughs'), fontWeight: 'bold', fontSize: '0.78rem', transition: 'all 0.2s ease',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.45rem'
          }}
        >
          <Terminal size={14} /> Interactive Walkthroughs
        </button>
      </div>

      {/* 3. DYNAMIC CONTENT RENDERING */}
      
      {/* SUBTAB 1: PLATFORM OVERVIEW */}
      {guideSubTab === 'overview' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          <div className="glass-card" style={{ padding: '1.5rem', borderLeft: '3px solid var(--neon-cyan)', display: 'flex', gap: '1.25rem', alignItems: 'flex-start' }}>
            <div style={{ background: 'rgba(0,240,255,0.06)', padding: '0.75rem', borderRadius: '8px', color: 'var(--neon-cyan)' }}>
              <ShieldCheck size={32} />
            </div>
            <div>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.5rem' }}>What is SentinelX V2?</h2>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '0.75rem' }}>
                SentinelX V2 is a **production-inspired anti-cheat and multiplayer ecosystem security suite**. 
                It transitions security from standard localized database filters into **explainable graph intelligence**. 
                By monitoring three core categories of multiplayer interactions, SentinelX protects live economies and matches in sub-milliseconds.
              </p>
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
                <span className="badge low" style={{ background: 'rgba(0,240,255,0.04)', borderColor: 'var(--neon-cyan)', color: 'var(--neon-cyan)', fontSize: '0.7rem' }}>🔒 Anti-RMT & Farms</span>
                <span className="badge low" style={{ background: 'rgba(255,0,85,0.04)', borderColor: 'var(--neon-red)', color: 'var(--neon-red)', fontSize: '0.7rem' }}>👥 Win-Trading Clique Blocks</span>
                <span className="badge low" style={{ background: 'rgba(0,255,136,0.04)', borderColor: 'var(--neon-green)', color: 'var(--neon-green)', fontSize: '0.7rem' }}>🚜 Anti-Bot Scheduling</span>
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.2rem' }}>
            
            {/* CARD A: THE CHALLENGE */}
            <div className="glass-card" style={{ padding: '1.2rem', display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              <span style={{ fontSize: '0.65rem', textTransform: 'uppercase', color: 'var(--neon-red)', fontWeight: 'bold' }}>01 / THE CHALLENGE</span>
              <h3 style={{ fontSize: '1rem', fontWeight: 'bold' }}>Multiplayer Fraud Tactics</h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                Win-trading cliques trade losses in lobbies to boost ranks. Gold farm bots flood trading marketplaces to sell currency, causing severe in-game inflation and player churn.
              </p>
            </div>

            {/* CARD B: OUR RESPONSE */}
            <div className="glass-card" style={{ padding: '1.2rem', display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              <span style={{ fontSize: '0.65rem', textTransform: 'uppercase', color: 'var(--neon-green)', fontWeight: 'bold' }}>02 / OUR SOLUTION</span>
              <h3 style={{ fontSize: '1rem', fontWeight: 'bold' }}>Explainable Graph AI</h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                Rather than auditing isolated events, SentinelX builds complex interaction topologies. It runs custom PyTorch GNNs, multi-head GAT attention, and SHAP calculators to explain exactly *why* a node is a risk.
              </p>
            </div>

            {/* CARD C: BUSINESS TARGET */}
            <div className="glass-card" style={{ padding: '1.2rem', display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              <span style={{ fontSize: '0.65rem', textTransform: 'uppercase', color: 'var(--neon-cyan)', fontWeight: 'bold' }}>03 / THE METRICS</span>
              <h3 style={{ fontSize: '1rem', fontWeight: 'bold' }}>Revenue & Fairplay ROI</h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                The Business Impact dashboard computes chargebacks prevented, gold inflation suppressed, and cohort day-30 retention gains ($+4.8\%$), mapping anti-cheat metrics directly to company revenues.
              </p>
            </div>

          </div>

        </div>
      )}

      {/* SUBTAB 2: INTERACTIVE ARCHITECTURE */}
      {guideSubTab === 'architecture' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          <div className="glass-card" style={{ padding: '1.25rem' }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', fontWeight: 800, marginBottom: '0.35rem' }}>Interactive System Architecture</h2>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
              Click any of the architectural layers in the diagram to inspect its pipeline detail, input/output data vectors, and structural processes.
            </p>

            {/* PIPELINE CONTAINER */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
              
              {/* Layer 1: Ingestion */}
              <div 
                className="glass-card" 
                style={{ 
                  padding: '0.85rem 1.25rem', border: '1px solid rgba(0, 240, 255, 0.15)', cursor: 'pointer',
                  background: 'rgba(0, 240, 255, 0.02)', transition: 'transform 0.2s ease', display: 'flex',
                  justifyContent: 'space-between', alignItems: 'center'
                }}
                onClick={() => alert("Layer 1: Telemetry Stream Ingestion\n\nInput: Logins, Match Logs, Marketplace Trades\nLatency: <2ms ingestion queue\nProcess: Websocket routing and dynamic feature parsing.")}
                onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = 'none'; }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span style={{ background: 'var(--neon-cyan)', color: 'var(--bg-primary)', fontWeight: 'bold', width: '22px', height: '22px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem' }}>1</span>
                  <div>
                    <h4 style={{ fontSize: '0.82rem', fontWeight: 'bold' }}>Telemetry Stream Ingestion Layer</h4>
                    <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>WebSocket Broker & Async Event Loop Broker</span>
                  </div>
                </div>
                <span className="badge low" style={{ borderColor: 'var(--neon-cyan)', color: 'var(--neon-cyan)', fontSize: '0.62rem' }}>Input Events</span>
              </div>

              {/* Layer 2: Graph Builder */}
              <div 
                className="glass-card" 
                style={{ 
                  padding: '0.85rem 1.25rem', border: '1px solid rgba(0, 255, 136, 0.15)', cursor: 'pointer',
                  background: 'rgba(0, 255, 136, 0.02)', transition: 'transform 0.2s ease', display: 'flex',
                  justifyContent: 'space-between', alignItems: 'center'
                }}
                onClick={() => alert("Layer 2: NetworkX Multi-Network Builder\n\nInput: Live event queues\nProcess: Compiles 4 interactive graphs (Match, Trade, Friend, Device sharing).\nOutput: Extracted Louvain communities, PageRank, clustering coefficients, and adjacency lists.")}
                onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = 'none'; }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span style={{ background: 'var(--neon-green)', color: 'var(--bg-primary)', fontWeight: 'bold', width: '22px', height: '22px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem' }}>2</span>
                  <div>
                    <h4 style={{ fontSize: '0.82rem', fontWeight: 'bold' }}>Dynamic Multi-Network Graph Builder</h4>
                    <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>NetworkX PageRank, Louvain Clique Finder & Decay Rates</span>
                  </div>
                </div>
                <span className="badge low" style={{ borderColor: 'var(--neon-green)', color: 'var(--neon-green)', fontSize: '0.62rem' }}>Topological Matrices</span>
              </div>

              {/* Layer 3: ML Ensembles */}
              <div 
                className="glass-card" 
                style={{ 
                  padding: '0.85rem 1.25rem', border: '1px solid rgba(255, 184, 0, 0.15)', cursor: 'pointer',
                  background: 'rgba(255, 184, 0, 0.02)', transition: 'transform 0.2s ease', display: 'flex',
                  justifyContent: 'space-between', alignItems: 'center'
                }}
                onClick={() => alert("Layer 3: Graph AI & Machine Learning Ensembles\n\nInput: Adjacency graphs and feature vectors\nModels: PyTorch GCN, PyTorch GAT self-attention heads, Supervised XGBoost, Unsupervised Isolation Forests.\nOutput: Head-wise attention coefficients, anomaly quotients, threat logits.")}
                onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = 'none'; }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span style={{ background: 'var(--neon-yellow)', color: 'var(--bg-primary)', fontWeight: 'bold', width: '22px', height: '22px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem' }}>3</span>
                  <div>
                    <h4 style={{ fontSize: '0.82rem', fontWeight: 'bold' }}>Explainable Machine Learning Ensembles</h4>
                    <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Multi-Head PyTorch GAT + XGBoost + Isolation Forest Anomaly Engine</span>
                  </div>
                </div>
                <span className="badge low" style={{ borderColor: 'var(--neon-yellow)', color: 'var(--neon-yellow)', fontSize: '0.62rem' }}>Graph AI Inference</span>
              </div>

              {/* Layer 4: Control Room */}
              <div 
                className="glass-card" 
                style={{ 
                  padding: '0.85rem 1.25rem', border: '1px solid rgba(255, 0, 85, 0.15)', cursor: 'pointer',
                  background: 'rgba(255, 0, 85, 0.02)', transition: 'transform 0.2s ease', display: 'flex',
                  justifyContent: 'space-between', alignItems: 'center'
                }}
                onClick={() => alert("Layer 4: Unified Threat Score & Command Center\n\nInput: Model logits & weights\nProcess: Computes Weighted pillar sum and triggers WebSocket events.\nCommand Options: Quarantine, Shadow-ban, Economy freeze, Dismiss.")}
                onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = 'none'; }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span style={{ background: 'var(--neon-red)', color: 'var(--bg-primary)', fontWeight: 'bold', width: '22px', height: '22px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem' }}>4</span>
                  <div>
                    <h4 style={{ fontSize: '0.82rem', fontWeight: 'bold' }}>Unified Security Operations Command Room</h4>
                    <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>BI calibrations, SHAP waterfall dossiers, WebSocket live notifications</span>
                  </div>
                </div>
                <span className="badge critical" style={{ borderColor: 'var(--neon-red)', color: 'var(--neon-red)', fontSize: '0.62rem' }}>Operator Interventions</span>
              </div>

            </div>

          </div>

        </div>
      )}

      {/* SUBTAB 3: MATHEMATICAL PILLARS */}
      {guideSubTab === 'features' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          <div className="dashboard-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
            
            {/* PILLAR 1: EXPONENTIAL TIME DECAY */}
            <div className="glass-card" style={{ padding: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.75rem' }}>
                <TrendingUp size={16} color="var(--neon-cyan)" />
                <h4 style={{ fontSize: '0.88rem', fontWeight: 'bold' }}>1. Exponential Edge Time-Decay</h4>
              </div>
              <p style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', lineHeight: 1.4, marginBottom: '0.85rem' }}>
                Prevents stale historical records from distorting active collusion scoring. Edges decay based on day increments from snapshot target epochs:
              </p>
              
              <div style={{ background: 'var(--bg-primary)', padding: '0.75rem', borderRadius: '6px', textAlign: 'center', marginBottom: '0.85rem' }}>
                <code style={{ fontSize: '0.9rem', color: 'var(--neon-cyan)', fontFamily: 'monospace', fontWeight: 'bold' }}>
                  W_ij(t) = β_ij * exp(-λ * Δt_days)
                </code>
              </div>
              
              <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                * λ acts as the evasion decay coefficient (default 0.05). Δt marks the age of match/trade events.
              </span>
            </div>

            {/* PILLAR 2: SHANNON LOGIN ENTROPY */}
            <div className="glass-card" style={{ padding: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.75rem' }}>
                <Cpu size={16} color="var(--neon-cyan)" />
                <h4 style={{ fontSize: '0.88rem', fontWeight: 'bold' }}>2. Shannon Login Schedule Entropy</h4>
              </div>
              <p style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', lineHeight: 1.4, marginBottom: '0.85rem' }}>
                Measures intervals spacing between consecutive logins. Bots scheduled on rigid intervals yield low entropy, distinguishing them from erratic human diurnal spikes:
              </p>
              
              <div style={{ background: 'var(--bg-primary)', padding: '0.75rem', borderRadius: '6px', textAlign: 'center', marginBottom: '0.85rem' }}>
                <code style={{ fontSize: '0.9rem', color: 'var(--neon-cyan)', fontFamily: 'monospace', fontWeight: 'bold' }}>
                  H(X) = - Σ (p(x_i) * log2(p(x_i)))
                </code>
              </div>
              
              <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                * Normalized schedule probabilities p(x_i). Bots scheduling hit low rates (e.g. H &lt; 0.35).
              </span>
            </div>

            {/* PILLAR 3: GAT MULTI-HEAD ATTENTION */}
            <div className="glass-card" style={{ padding: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.75rem' }}>
                <Layers size={16} color="var(--neon-red)" />
                <h4 style={{ fontSize: '0.88rem', fontWeight: 'bold' }}>3. Graph Multi-Head Attention</h4>
              </div>
              <p style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', lineHeight: 1.4, marginBottom: '0.85rem' }}>
                Self-attention calculates normalized coefficients (α_ij) identifying structural collusion linkages:
              </p>
              
              <div style={{ background: 'var(--bg-primary)', padding: '0.75rem', borderRadius: '6px', textAlign: 'center', marginBottom: '0.85rem' }}>
                <code style={{ fontSize: '0.82rem', color: 'var(--neon-red)', fontFamily: 'monospace', fontWeight: 'bold' }}>
                  α_ij = Softmax(LeakyReLU(a^T [W h_i || W h_j]))
                </code>
              </div>
              
              <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                * Projects node vectors h_i via linear transformation W, concatenating parameters onto attention head a.
              </span>
            </div>

            {/* PILLAR 4: BUSINESS SAVINGS MODEL */}
            <div className="glass-card" style={{ padding: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.75rem' }}>
                <DollarSign size={16} color="var(--neon-green)" />
                <h4 style={{ fontSize: '0.88rem', fontWeight: 'bold' }}>4. Ecosystem Saved Revenue Estimates</h4>
              </div>
              <p style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', lineHeight: 1.4, marginBottom: '0.85rem' }}>
                Projections calculated dynamically based on flagged volumes and sandbox cheat quarantine frequencies:
              </p>
              
              <div style={{ background: 'var(--bg-primary)', padding: '0.75rem', borderRadius: '6px', textAlign: 'center', marginBottom: '0.85rem' }}>
                <code style={{ fontSize: '0.85rem', color: 'var(--neon-green)', fontFamily: 'monospace', fontWeight: 'bold' }}>
                  Saved = Σ (Trade_Vol * Exploit_Mult + Blocked_Hrs * Safe_Rate)
                </code>
              </div>
              
              <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                * Default trade exploit multiplier of 1.25 (RMT inflation bounds) and safety value rate of $150/critical ban.
              </span>
            </div>

          </div>

        </div>
      )}

      {/* SUBTAB 4: INTERACTIVE WALKTHROUGHS */}
      {guideSubTab === 'walkthroughs' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          <div className="glass-card" style={{ padding: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.75rem' }}>
              <Terminal size={18} color="var(--neon-cyan)" />
              <h4 style={{ fontSize: '1rem', fontWeight: 'bold' }}>SentinelX Terminal Verification Console</h4>
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
              Simulate operational testing command scripts directly below. Click one of the verification scripts to execute simulated terminal workflows.
            </p>

            <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem' }}>
              <button 
                className="cyber-button"
                style={{ fontSize: '0.75rem', borderColor: 'var(--neon-cyan)' }}
                onClick={() => {
                  const logEl = document.getElementById('terminal-log-output');
                  logEl.innerHTML = "> Running PyTest validation suite...\n" +
                                    "> pytest tests/\n" +
                                    "[INFO] Ingesting Synthetic Match Logs: SUCCESS (schema valid)\n" +
                                    "[INFO] Building page topological matrices: SUCCESS (1500 nodes, 12000 edges)\n" +
                                    "[INFO] Executing Ensemble Scorer weights: SUCCESS (Unified risk clamping correct)\n" +
                                    "-------------------------------------------\n" +
                                    "=== 14 PASSED, 0 FAILED in 1.45s ===";
                }}
              >
                Simulate PyTests validation
              </button>

              <button 
                className="cyber-button"
                style={{ fontSize: '0.75rem', borderColor: 'var(--neon-yellow)' }}
                onClick={() => {
                  const logEl = document.getElementById('terminal-log-output');
                  logEl.innerHTML = "> Auditing GAT Self-Attention weights...\n" +
                                    "> python models/gat_model.py --audit --node PLY_00009\n" +
                                    "[GAT Heads] Invoking 2-head PyTorch linear projections...\n" +
                                    "[GAT Node PLY_00009] Local Neighbors: ['PLY_00006', 'PLY_00087', 'PLY_00175']\n" +
                                    "[GAT Attentions] α_00009_00006 -> 1.64% (boost overlap)\n" +
                                    "[GAT Attentions] α_00009_00087 -> 1.64% (boosting mule)\n" +
                                    "[GAT Attentions] α_00009_00175 -> 1.64% (boosting mule)\n" +
                                    "Audit complete. Attention matrices successfully exported to client dossier.";
                }}
              >
                Simulate GAT attention audits
              </button>

              <button 
                className="cyber-button"
                style={{ fontSize: '0.75rem', borderColor: 'var(--neon-red)' }}
                onClick={() => {
                  const logEl = document.getElementById('terminal-log-output');
                  logEl.innerHTML = "";
                }}
              >
                Clear Console
              </button>
            </div>

            {/* MOCK TERMINAL DISPLAY */}
            <div style={{
              background: 'rgba(9, 10, 15, 0.95)',
              border: '1px solid var(--border-color)',
              borderRadius: '6px',
              padding: '1rem',
              fontFamily: 'monospace',
              fontSize: '0.78rem',
              color: 'var(--neon-green)',
              minHeight: '160px',
              whiteSpace: 'pre-wrap',
              boxShadow: 'inset 0 0 10px rgba(0,0,0,0.8)'
            }} id="terminal-log-output">
              &gt; Choose a command script above to inspect operational logs...
            </div>

          </div>

        </div>
      )}

    </div>
  );
}

export default PlatformGuide;

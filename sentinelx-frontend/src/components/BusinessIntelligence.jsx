import React, { useState, useEffect } from 'react';
import { 
  DollarSign, 
  ShieldAlert, 
  Sliders, 
  Activity, 
  Sparkles, 
  RotateCw,
  TrendingUp,
  Cpu,
  BrainCircuit
} from 'lucide-react';
import { API_BASE } from '../config';

function BusinessIntelligence() {
  const [biData, setBiData] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Scorer weights sliders state
  const [graphWeight, setGraphWeight] = useState(0.35);
  const [behaviorWeight, setBehaviorWeight] = useState(0.25);
  const [deviceWeight, setDeviceWeight] = useState(0.20);
  const [transWeight, setTransWeight] = useState(0.20);
  
  // Threat thresholds sliders state
  const [medThresh, setMedThresh] = useState(0.30);
  const [highThresh, setHighThresh] = useState(0.60);
  const [critThresh, setCritThresh] = useState(0.85);
  
  // Drift actions loading indicators
  const [driftActionLoading, setDriftActionLoading] = useState(false);

  const fetchBIData = async () => {
    try {
      const res = await fetch(`${API_BASE}/business-intelligence`);
      if (res.ok) {
        const data = await res.json();
        setBiData(data);
        
        // Match sliders with active config
        setGraphWeight(data.risk_weights.graph);
        setBehaviorWeight(data.risk_weights.behavioral);
        setDeviceWeight(data.risk_weights.device);
        setTransWeight(data.risk_weights.transaction);
        
        setMedThresh(data.current_thresholds.medium);
        setHighThresh(data.current_thresholds.high);
        setCritThresh(data.current_thresholds.critical);
      }
    } catch (err) {
      console.error("Error fetching BI metrics:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBIData();
  }, []);

  // API triggers
  const handleUpdateThresholds = async (valMed, valHigh, valCrit) => {
    try {
      await fetch(`${API_BASE}/business-intelligence/thresholds?medium=${valMed}&high=${valHigh}&critical=${valCrit}`, {
        method: 'POST'
      });
      fetchBIData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateWeights = async () => {
    try {
      await fetch(`${API_BASE}/business-intelligence/weights?graph=${graphWeight}&behavioral=${behaviorWeight}&device=${deviceWeight}&transaction=${transWeight}`, {
        method: 'POST'
      });
      fetchBIData();
      alert("Enforcement weights updated. Model recalculated Unified Risk scores.");
    } catch (err) {
      console.error(err);
    }
  };

  const handleInjectDrift = async () => {
    setDriftActionLoading(true);
    try {
      await fetch(`${API_BASE}/business-intelligence/drift/activate`, { method: 'POST' });
      fetchBIData();
      alert("Concept Drift successfully injected! Supervised model performance degraded.");
    } catch (err) {
      console.error(err);
    } finally {
      setDriftActionLoading(false);
    }
  };

  const handleTriggerRetrain = async () => {
    setDriftActionLoading(true);
    try {
      await fetch(`${API_BASE}/business-intelligence/drift/retrain`, { method: 'POST' });
      fetchBIData();
      alert("Online Adaptive Retraining successfully executed! Platform calibrated to new exploit signatures.");
    } catch (err) {
      console.error(err);
    } finally {
      setDriftActionLoading(false);
    }
  };

  if (loading || !biData) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '80vh', color: 'var(--text-secondary)' }}>
        <Activity className="logo-icon animate-pulse" size={32} />
        <p style={{ marginLeft: '0.8rem', fontSize: '0.82rem' }}>Loading Business Intelligence layer...</p>
      </div>
    );
  }

  const { precision, recall, f1_score, drift_status, false_positive_rate, adverary_adaptation_index } = biData.system_drift_metrics;

  return (
    <div style={{ padding: '1.5rem 2rem', paddingBottom: '3rem' }}>
      
      {/* HEADER SECTION */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <span className="badge critical" style={{ background: 'rgba(0, 240, 255, 0.08)', borderColor: 'var(--neon-cyan)', color: 'var(--neon-cyan)', fontSize: '0.62rem', letterSpacing: '0.5px', marginBottom: '0.5rem' }}>
            EXECUTIVE COMMAND BOARD
          </span>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.75rem', fontWeight: 800 }}>Business Intelligence & Revenue Protection</h1>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
            Dynamic threat threshold optimization, automated loss prevention estimates, and sandbox concept drift simulations.
          </p>
        </div>

        {/* CUMULATIVE SAVINGS OVERLAY */}
        <div className="glass-card" style={{ padding: '0.65rem 1.25rem', background: 'rgba(0, 255, 136, 0.04)', borderColor: 'rgba(0, 255, 136, 0.2)', display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div className="impact-metric-icon green" style={{ padding: '0.45rem' }}>
            <DollarSign size={20} />
          </div>
          <div>
            <span style={{ fontSize: '0.62rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Ecosystem Loss Blocked</span>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--neon-green)', fontFamily: 'var(--font-display)' }}>
              ${biData.cumulative_savings_usd.toLocaleString()}
            </h2>
          </div>
        </div>
      </div>

      {/* THREE SECTION SPLIT CONTAINER */}
      <div className="dashboard-grid" style={{ gridTemplateColumns: '1fr 1fr 1fr' }}>
        
        {/* PANEL 1: ENFORCEMENT THRESHOLD CALIBRATOR */}
        <div className="glass-card column-flex">
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.05rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Sliders size={16} color="var(--neon-cyan)" /> Threat Class Thresholds
          </h3>
          <p style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
            Drag sliders to adjust enforcement margins across the ecosystem. Update takes effect instantly.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem', marginTop: '0.5rem' }}>
            {/* Medium Risk Threshold */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: '0.35rem' }}>
                <span style={{ color: 'var(--neon-yellow)' }}>Medium Risk Trigger</span>
                <span style={{ fontWeight: 'bold' }}>{Math.round(medThresh * 100)}%</span>
              </div>
              <input 
                type="range" min="0.10" max="0.50" step="0.05" 
                value={medThresh} 
                onChange={(e) => { const v = parseFloat(e.target.value); setMedThresh(v); handleUpdateThresholds(v, highThresh, critThresh); }}
                style={{ width: '100%', accentColor: 'var(--neon-yellow)', background: 'var(--bg-primary)' }}
              />
            </div>

            {/* High Risk Threshold */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: '0.35rem' }}>
                <span style={{ color: 'var(--neon-orange)' }}>High Risk Trigger</span>
                <span style={{ fontWeight: 'bold' }}>{Math.round(highThresh * 100)}%</span>
              </div>
              <input 
                type="range" min="0.40" max="0.75" step="0.05" 
                value={highThresh} 
                onChange={(e) => { const v = parseFloat(e.target.value); setHighThresh(v); handleUpdateThresholds(medThresh, v, critThresh); }}
                style={{ width: '100%', accentColor: 'var(--neon-orange)', background: 'var(--bg-primary)' }}
              />
            </div>

            {/* Critical Risk Threshold */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: '0.35rem' }}>
                <span style={{ color: 'var(--neon-red)' }}>Critical Risk Trigger</span>
                <span style={{ fontWeight: 'bold' }}>{Math.round(critThresh * 100)}%</span>
              </div>
              <input 
                type="range" min="0.70" max="0.95" step="0.05" 
                value={critThresh} 
                onChange={(e) => { const v = parseFloat(e.target.value); setCritThresh(v); handleUpdateThresholds(medThresh, highThresh, v); }}
                style={{ width: '100%', accentColor: 'var(--neon-red)', background: 'var(--bg-primary)' }}
              />
            </div>
          </div>

          {/* Model Quality indicators */}
          <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '0.85rem', marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
            <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Calibrated Alert Quality</span>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
              <span style={{ color: 'var(--text-secondary)' }}>F1 Alert Accuracy:</span>
              <span style={{ color: 'var(--neon-green)', fontWeight: 'bold' }}>{(f1_score * 100).toFixed(1)}%</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
              <span style={{ color: 'var(--text-secondary)' }}>False Positive Rate (FPR):</span>
              <span style={{ color: false_positive_rate > 0.05 ? 'var(--neon-red)' : 'var(--neon-green)', fontWeight: 'bold' }}>
                {(false_positive_rate * 100).toFixed(1)}%
              </span>
            </div>
          </div>
        </div>

        {/* PANEL 2: PILLAR WEIGHING CONFIGURATOR */}
        <div className="glass-card column-flex">
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.05rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <BrainCircuit size={16} color="var(--neon-cyan)" /> Scorer Weight Tuning
          </h3>
          <p style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
            Tune weights for Graph, Behavior, Hardware, and Market risks. Slider updates automatically recalculate player risk vectors.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '0.2rem' }}>
            {/* Graph weight */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', marginBottom: '0.2rem' }}>
                <span>Graph Centralities Weight</span>
                <span>{Math.round(graphWeight * 100)}%</span>
              </div>
              <input type="range" min="0.0" max="1.0" step="0.05" value={graphWeight} onChange={(e) => setGraphWeight(parseFloat(e.target.value))} style={{ width: '100%', accentColor: 'var(--neon-cyan)' }} />
            </div>

            {/* Behavior weight */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', marginBottom: '0.2rem' }}>
                <span>Behavioral Entropy Weight</span>
                <span>{Math.round(behaviorWeight * 100)}%</span>
              </div>
              <input type="range" min="0.0" max="1.0" step="0.05" value={behaviorWeight} onChange={(e) => setBehaviorWeight(parseFloat(e.target.value))} style={{ width: '100%', accentColor: 'var(--neon-cyan)' }} />
            </div>

            {/* Device weight */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', marginBottom: '0.2rem' }}>
                <span>Hardware Footprint Weight</span>
                <span>{Math.round(deviceWeight * 100)}%</span>
              </div>
              <input type="range" min="0.0" max="1.0" step="0.05" value={deviceWeight} onChange={(e) => setDeviceWeight(parseFloat(e.target.value))} style={{ width: '100%', accentColor: 'var(--neon-cyan)' }} />
            </div>

            {/* Transaction weight */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', marginBottom: '0.2rem' }}>
                <span>Market Trade Weight</span>
                <span>{Math.round(transWeight * 100)}%</span>
              </div>
              <input type="range" min="0.0" max="1.0" step="0.05" value={transWeight} onChange={(e) => setTransWeight(parseFloat(e.target.value))} style={{ width: '100%', accentColor: 'var(--neon-cyan)' }} />
            </div>

            <button className="cyber-button" style={{ marginTop: '0.4rem', justifyContent: 'center' }} onClick={handleUpdateWeights}>
              Recalculate Scorer Models
            </button>
          </div>
        </div>

        {/* PANEL 3: CONCEPT DRIFT SANDBOX CONTROL */}
        <div className="glass-card column-flex" style={{ borderColor: drift_status.includes('DEGRADED') ? 'var(--neon-red)' : 'var(--border-color)', background: drift_status.includes('DEGRADED') ? 'rgba(255,0,85,0.03)' : 'transparent' }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.05rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Cpu size={16} color="var(--neon-red)" /> Evasion Drift Sandbox
          </h3>
          <p style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
            Simulate dynamic adversary adaptation. Inject behavioral concept drift to trigger model degradation.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '0.5rem', flexGrow: 1, justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem' }}>
                <span>Security Engine Status:</span>
                <span style={{ 
                  fontWeight: 'bold', 
                  color: drift_status.includes('DEGRADED') ? 'var(--neon-red)' : 'var(--neon-green)'
                }}>
                  {drift_status}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem' }}>
                <span>Adversary Adaptation Index:</span>
                <span style={{ color: 'var(--neon-red)', fontWeight: 'bold' }}>{adverary_adaptation_index}%</span>
              </div>
              
              {/* Progress visual */}
              <div className="pillar-progress-bg" style={{ width: '100%', height: '4px', marginTop: '0.2rem' }}>
                <div className="pillar-progress-fill" style={{ 
                  width: `${adverary_adaptation_index}%`, 
                  background: drift_status.includes('DEGRADED') ? 'var(--neon-red)' : 'var(--neon-cyan)' 
                }}></div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
              <button 
                className="cyber-button" 
                style={{ flexGrow: 1, justifyContent: 'center', borderColor: 'var(--neon-red)', fontSize: '0.72rem', opacity: driftActionLoading ? 0.5 : 1 }}
                onClick={handleInjectDrift}
                disabled={driftActionLoading || drift_status.includes('DEGRADED')}
              >
                Inject Drift Exploit
              </button>
              <button 
                className="cyber-button" 
                style={{ flexGrow: 1, justifyContent: 'center', borderColor: 'var(--neon-green)', fontSize: '0.72rem', opacity: driftActionLoading ? 0.5 : 1 }}
                onClick={handleTriggerRetrain}
                disabled={driftActionLoading || drift_status.includes('RETRAINED') || drift_status.includes('OPTIMAL')}
              >
                <RotateCw size={12} className={driftActionLoading ? 'animate-spin' : ''} /> Retrain ML
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* ROW 2: DUAL VISUALIZATION CHARTS */}
      <div className="dashboard-grid" style={{ marginTop: '1.5rem', gridTemplateColumns: '1.6fr 1.4fr' }}>
        
        {/* CHART A: MATCH INTEGRITY HISTOGRAM OVER 24H */}
        <div className="glass-card">
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.05rem', fontWeight: 700, marginBottom: '0.35rem' }}>Match Integrity Trend (24h)</h3>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
            Rolling hourly match integrity percentage (simulated live-ops window)
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
            <svg width="480" height="150" style={{ overflow: 'visible' }}>
              {/* Grid lines */}
              <line x1="40" y1="20" x2="480" y2="20" stroke="rgba(255,255,255,0.03)" />
              <line x1="40" y1="70" x2="480" y2="70" stroke="rgba(255,255,255,0.03)" />
              <line x1="40" y1="120" x2="480" y2="120" stroke="rgba(255,255,255,0.06)" />

              {/* Curve rendering */}
              <path 
                d="M 40 45 L 80 42 L 120 40 L 160 38 L 200 48 L 240 32 L 280 28 L 320 22 L 360 48 L 400 35 L 440 28 L 480 20" 
                fill="none" 
                stroke="var(--neon-green)" 
                strokeWidth="2.5"
                style={{ filter: 'drop-shadow(0 0 5px rgba(0, 255, 136, 0.3))' }}
              />
              
              {/* Dots at vertices */}
              <circle cx="200" cy="48" r="4" fill="var(--neon-yellow)" />
              <circle cx="360" cy="48" r="4" fill="var(--neon-red)" />

              {/* Axis labels */}
              <text x="25" y="20" fill="var(--text-muted)" fontSize="8" textAnchor="end">100%</text>
              <text x="25" y="70" fill="var(--text-muted)" fontSize="8" textAnchor="end">98%</text>
              <text x="25" y="120" fill="var(--text-muted)" fontSize="8" textAnchor="end">95%</text>

              <text x="40" y="132" fill="var(--text-muted)" fontSize="8" textAnchor="middle">00:00</text>
              <text x="160" y="132" fill="var(--text-muted)" fontSize="8" textAnchor="middle">06:00</text>
              <text x="280" y="132" fill="var(--text-muted)" fontSize="8" textAnchor="middle">12:00</text>
              <text x="400" y="132" fill="var(--text-muted)" fontSize="8" textAnchor="middle">18:00</text>
              <text x="480" y="132" fill="var(--text-muted)" fontSize="8" textAnchor="middle">23:00</text>
            </svg>
          </div>

          <div style={{ display: 'flex', gap: '1.25rem', marginTop: '1.25rem', justifyContent: 'center', fontSize: '0.72rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--neon-green)' }}></span>
              <span style={{ color: 'var(--text-secondary)' }}>Lobby Secured</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--neon-yellow)' }}></span>
              <span style={{ color: 'var(--text-secondary)' }}>Collusion Trigger (Lobby ban issued)</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--neon-red)' }}></span>
              <span style={{ color: 'var(--text-secondary)' }}>Bot Wave Intercepted</span>
            </div>
          </div>
        </div>

        {/* CHART B: STATISTICAL PR CURVES */}
        <div className="glass-card">
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.05rem', fontWeight: 700, marginBottom: '0.35rem' }}>Ecosystem Precision-Recall curve</h3>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
            Statistical trade-off: Precision vs. Recall curves plotted against dynamic thresholds
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
            <svg width="340" height="150" style={{ overflow: 'visible' }}>
              <line x1="30" y1="20" x2="330" y2="20" stroke="rgba(255,255,255,0.03)" />
              <line x1="30" y1="70" x2="330" y2="70" stroke="rgba(255,255,255,0.03)" />
              <line x1="30" y1="120" x2="330" y2="120" stroke="rgba(255,255,255,0.06)" />

              <line x1="30" y1="10" x2="30" y2="120" stroke="var(--border-color)" />
              <line x1="30" y1="120" x2="330" y2="120" stroke="var(--border-color)" />

              {/* Curve A: Precision (starts low, goes high) */}
              <path d="M 30 110 Q 150 70, 330 20" fill="none" stroke="var(--neon-cyan)" strokeWidth="2.5" />
              
              {/* Curve B: Recall (starts high, goes low) */}
              <path d="M 30 20 Q 150 60, 330 110" fill="none" stroke="var(--neon-orange)" strokeWidth="2.5" />

              {/* Threshold intercept lines (based on current High Thresh) */}
              {/* Let's mock High Thresh intercept around 60% (x=210) */}
              <line x1="210" y1="10" x2="210" y2="120" stroke="rgba(255, 0, 85, 0.4)" strokeWidth="1" strokeDasharray="3,3" />

              {/* Axis labels */}
              <text x="15" y="20" fill="var(--text-muted)" fontSize="8" textAnchor="end">100%</text>
              <text x="15" y="70" fill="var(--text-muted)" fontSize="8" textAnchor="end">50%</text>
              <text x="15" y="120" fill="var(--text-muted)" fontSize="8" textAnchor="end">0%</text>

              <text x="30" y="132" fill="var(--text-muted)" fontSize="8" textAnchor="middle">t=0.1</text>
              <text x="150" y="132" fill="var(--text-muted)" fontSize="8" textAnchor="middle">t=0.5</text>
              <text x="210" y="132" fill="var(--neon-red)" fontSize="8" textAnchor="middle" fontWeight="bold">Active</text>
              <text x="330" y="132" fill="var(--text-muted)" fontSize="8" textAnchor="middle">t=0.9</text>
            </svg>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '1.25rem', marginTop: '1.25rem', fontSize: '0.7rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span style={{ width: '12px', height: '3px', background: 'var(--neon-cyan)' }}></span>
              <span style={{ color: 'var(--text-secondary)' }}>Precision (Fewer False Flags)</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span style={{ width: '12px', height: '3px', background: 'var(--neon-orange)' }}></span>
              <span style={{ color: 'var(--text-secondary)' }}>Recall (Total Fraud Caught)</span>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}

export default BusinessIntelligence;

import React, { useState, useEffect } from 'react';
import { 
  X, 
  ShieldAlert, 
  TrendingUp, 
  Clock, 
  Cpu, 
  Globe, 
  AlertTriangle,
  Lock,
  EyeOff,
  UserCheck,
  ShieldCheck,
  Zap,
  DollarSign
} from 'lucide-react';

function CaseInvestigationCenter({ playerId, onClose }) {
  const [dossier, setDossier] = useState(null);
  const [loading, setLoading] = useState(true);
  const [interveneStatus, setInterveneStatus] = useState(null);

  const fetchDossier = async () => {
    setLoading(true);
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/v1/players/${playerId}/investigate`);
      if (res.ok) {
        const data = await res.json();
        setDossier(data);
      }
    } catch (err) {
      console.error("Error loading case dossier:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (playerId) {
      fetchDossier();
    }
  }, [playerId]);

  const handleIntervention = async (action) => {
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/v1/players/${playerId}/intervene?action=${action}`, {
        method: 'POST'
      });
      if (res.ok) {
        const data = await res.json();
        setInterveneStatus(data.action_taken);
        alert(`Case Intervention Executed: Account placed in [${data.action_taken}] state successfully.`);
      }
    } catch (err) {
      console.error("Error triggering intervention:", err);
    }
  };

  if (loading) {
    return (
      <div style={{
        position: 'fixed', right: 0, top: 0, height: '100vh', width: '480px',
        background: 'var(--bg-secondary)', borderLeft: '1px solid var(--border-color)',
        zIndex: 200, padding: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'center'
      }}>
        <div style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
          <Zap className="logo-icon animate-spin" size={36} color="var(--neon-red)" />
          <p style={{ marginTop: '1rem', fontSize: '0.82rem', fontWeight: 'bold' }}>Retrieving Case Dossier & Graph Attentions...</p>
        </div>
      </div>
    );
  }

  if (!dossier) return null;

  const getRiskColor = (level) => {
    switch (level) {
      case 'CRITICAL': return 'var(--neon-red)';
      case 'HIGH': return 'var(--neon-orange)';
      case 'MEDIUM': return 'var(--neon-yellow)';
      default: return 'var(--neon-green)';
    }
  };

  const getCategoryColor = (cat) => {
    switch (cat) {
      case 'BEHAVIORAL': return 'var(--neon-yellow)';
      case 'HARDWARE': return 'var(--neon-orange)';
      case 'TRADE_ASYNCHRONY': return 'var(--neon-red)';
      case 'SMURF_PROFILE': return 'var(--neon-cyan)';
      default: return 'var(--text-muted)';
    }
  };

  const formatGroundTruth = (type) => {
    switch (type) {
      case 'bot': return '🚜 Farming Bot Guild Member';
      case 'colluder': return '👥 Win-Trading Clique Node';
      case 'smurf': return '⚡ Placed Smurf Placement Profile';
      case 'farmer': return '🚜 In-game Gold Farming Mule';
      case 'multi_account': return '📱 Device Footprint Clone';
      default: return '🛡️ Legitimate Player Profile';
    }
  };

  return (
    <div style={{
      position: 'fixed', right: 0, top: 0, height: '100vh', width: '500px',
      background: 'rgba(9, 10, 15, 0.97)', borderLeft: '1px solid var(--border-color)',
      boxShadow: '-10px 0 35px rgba(0,0,0,0.7)', zIndex: 200, display: 'flex', 
      flexDirection: 'column', backdropFilter: 'blur(15px)',
      borderImage: 'linear-gradient(to bottom, var(--border-color), rgba(255,0,85,0.2)) 1'
    }}>
      
      {/* 1. DOSSIER COMMAND HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border-color)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <ShieldAlert size={24} color={getRiskColor(dossier.risk_level)} style={{ filter: `drop-shadow(0 0 5px ${getRiskColor(dossier.risk_level)})` }} />
          <div>
            <h2 style={{ fontSize: '1.2rem', fontFamily: 'var(--font-display)', fontWeight: 800 }}>Anti-Cheat Dossier</h2>
            <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Security Dossier ID: {dossier.player_id}</span>
          </div>
        </div>
        
        <button 
          onClick={onClose}
          style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', padding: '0.2rem', borderRadius: '4px' }}
        >
          <X size={20} />
        </button>
      </div>

      {/* 2. OPERATIONAL EVIDENCE GRID (SCROLLABLE) */}
      <div style={{ flexGrow: 1, overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        
        {/* A. ACCOUNT PROFILE SUM */}
        <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', padding: '1rem', borderRadius: '8px', display: 'flex', justifyContent: 'space-between' }}>
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 'bold' }}>{dossier.username}</h3>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
              Decoder: {formatGroundTruth(dossier.ground_truth)}
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
            <span className="badge critical" style={{ 
              borderColor: getRiskColor(dossier.risk_level),
              color: getRiskColor(dossier.risk_level),
              fontSize: '0.68rem',
              background: 'rgba(255,0,85,0.04)'
            }}>
              {interveneStatus ? interveneStatus : dossier.risk_level} ({dossier.risk_score}%)
            </span>
          </div>
        </div>

        {/* B. HISTORICAL CHRONOLOGICAL RISK TIMELINE */}
        <div className="glass-card" style={{ padding: '1rem' }}>
          <h4 style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--text-secondary)', letterSpacing: '0.5px', marginBottom: '0.85rem' }}>
            Behavioral Risk Timelines
          </h4>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.95rem', position: 'relative', paddingLeft: '1.2rem' }}>
            {/* Vertical timeline connector */}
            <div style={{ position: 'absolute', left: '4px', top: '4px', bottom: '4px', width: '1px', background: 'var(--border-color)' }}></div>

            {dossier.timeline.map((evt, idx) => (
              <div key={idx} style={{ position: 'relative', fontSize: '0.78rem' }}>
                {/* Timeline node */}
                <div style={{ 
                  position: 'absolute', left: '-22px', top: '3px', width: '9px', height: '9px', borderRadius: '50%',
                  background: idx === dossier.timeline.length - 1 ? 'var(--neon-red)' : 'var(--text-muted)',
                  border: '2px solid var(--bg-primary)'
                }}></div>

                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '500' }}>
                  <span style={{ color: idx === dossier.timeline.length - 1 ? 'var(--text-primary)' : 'var(--text-secondary)' }}>{evt.event}</span>
                  <span style={{ color: getCategoryColor(evt.category), fontSize: '0.68rem', textTransform: 'uppercase' }}>{evt.category}</span>
                </div>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                  {new Date(evt.timestamp).toLocaleDateString()} at {new Date(evt.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} • Score: {evt.risk_score}%
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* C. SHAP CONTRIBUTIONS */}
        <div className="glass-card" style={{ padding: '1rem' }}>
          <h4 style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--text-secondary)', letterSpacing: '0.5px', marginBottom: '0.65rem' }}>
            Local Feature Contribution (SHAP)
          </h4>

          <div className="waterfall-chart">
            {dossier.shap_contributions.map((item, idx) => {
              const isPos = item.weight >= 0;
              const valPercent = Math.min(50, Math.abs(item.weight) * 150);
              
              return (
                <div key={idx} className="waterfall-bar-row">
                  <span className="waterfall-label" style={{ width: '170px' }}>{item.factor}</span>
                  <div className="waterfall-chart-area">
                    <div className="waterfall-center-line"></div>
                    <div 
                      className={`waterfall-bar ${isPos ? 'positive' : 'negative'}`}
                      style={{
                        width: `${valPercent}%`,
                        left: isPos ? '50%' : 'auto',
                        right: isPos ? 'auto' : '50%'
                      }}
                    ></div>
                  </div>
                  <span className="waterfall-val" style={{ color: isPos ? 'var(--neon-red)' : 'var(--neon-green)' }}>
                    {isPos ? '+' : ''}{item.weight.toFixed(2)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* D. GRAPH ATTENTION NETWORK INFLUENCE */}
        <div className="glass-card" style={{ padding: '1rem' }}>
          <h4 style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--text-secondary)', letterSpacing: '0.5px', marginBottom: '0.65rem' }}>
            GAT Neighbor Attention Coefficients
          </h4>
          <p style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginBottom: '0.85rem' }}>
            Multi-head Graph Attention: identifies neighbors sending suspicious structural influence
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            {dossier.gat_neighbors.length > 0 ? (
              dossier.gat_neighbors.map((n, idx) => (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', padding: '0.65rem', borderRadius: '6px', fontSize: '0.78rem' }}>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontWeight: 'bold', color: 'var(--neon-cyan)' }}>{n.neighbor_id}</span>
                    <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Shared Clique Partner</span>
                  </div>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                    <span style={{ color: 'var(--neon-red)', fontWeight: 'bold' }}>{n.attention_coefficient}%</span>
                    <span style={{ fontSize: '0.62rem', color: 'var(--text-muted)' }}>Attention Weight</span>
                  </div>
                </div>
              ))
            ) : (
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center', padding: '0.5rem' }}>
                No significant neighbor graph attention detected (Isolated Profile).
              </div>
            )}
          </div>
        </div>

      </div>

      {/* 3. OPERATIONS MANUAL ACTION PANEL */}
      <div style={{ padding: '1.25rem 1.5rem', borderTop: '1px solid var(--border-color)', background: 'var(--bg-secondary)', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <span style={{ fontSize: '0.68rem', textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.5px' }}>
          Intervention Commands
        </span>
        
        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'stretch' }}>
          <button 
            className="cyber-button"
            style={{ flexGrow: 1, justifyContent: 'center', background: 'var(--neon-red)', color: 'white', borderColor: 'var(--neon-red)', fontSize: '0.75rem' }}
            onClick={() => handleIntervention('quarantine')}
          >
            <Lock size={12} /> Quarantine
          </button>
          
          <button 
            className="cyber-button"
            style={{ flexGrow: 1, justifyContent: 'center', borderColor: 'var(--neon-yellow)', fontSize: '0.75rem' }}
            onClick={() => handleIntervention('shadow_ban')}
          >
            <EyeOff size={12} /> Shadow-Ban
          </button>
          
          <button 
            className="cyber-button"
            style={{ flexGrow: 1, justifyContent: 'center', borderColor: 'var(--neon-cyan)', fontSize: '0.75rem' }}
            onClick={() => handleIntervention('freeze_economy')}
          >
            <DollarSign size={12} /> Freeze Econ
          </button>

          <button 
            className="cyber-button"
            style={{ flexGrow: 1, justifyContent: 'center', borderColor: 'var(--neon-green)', fontSize: '0.75rem' }}
            onClick={() => handleIntervention('whitelist')}
          >
            <UserCheck size={12} /> Dismiss
          </button>
        </div>
      </div>
      
    </div>
  );
}

export default CaseInvestigationCenter;

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
  UserCheck
} from 'lucide-react';
import { API_BASE } from '../config';

function PlayerProfile({ playerId, onClose }) {
  const [profile, setProfile] = useState(null);
  const [explanation, setExplanation] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfileDetails = async () => {
      setLoading(true);
      try {
        // Fetch base profile details
        const profRes = await fetch(`${API_BASE}/players/${playerId}`);
        // Fetch explanation/SHAP details
        const expRes = await fetch(`${API_BASE}/players/${playerId}/explain`);
        
        if (profRes.ok && expRes.ok) {
          const profData = await profRes.json();
          const expData = await expRes.json();
          setProfile(profData);
          setExplanation(expData);
        }
      } catch (err) {
        console.error("Error fetching player audit profile:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfileDetails();
  }, [playerId]);

  if (loading) {
    return (
      <div style={{
        position: 'fixed', right: 0, top: 0, height: '100vh', width: '420px',
        background: 'var(--bg-secondary)', borderLeft: '1px solid var(--border-color)',
        zIndex: 200, padding: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'center'
      }}>
        <div style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
          <TrendingUp className="logo-icon animate-pulse" size={32} />
          <p style={{ marginTop: '0.8rem', fontSize: '0.82rem' }}>Compiling explainability audit trails...</p>
        </div>
      </div>
    );
  }

  if (!profile || !explanation) return null;

  const getRiskColor = (level) => {
    switch (level) {
      case 'CRITICAL': return 'var(--neon-red)';
      case 'HIGH': return 'var(--neon-orange)';
      case 'MEDIUM': return 'var(--neon-yellow)';
      default: return 'var(--neon-green)';
    }
  };

  const formatGroundTruth = (type) => {
    switch (type) {
      case 'bot': return '🤖 Automated Bot';
      case 'colluder': return '👥 Win-Trading Colluder';
      case 'smurf': return '⚡ MMR Smurf / Booster';
      case 'farmer': return '🚜 Currency Farmer';
      case 'multi_account': return '📱 Multi-Account Clone';
      default: return '🛡️ Legitimate Player';
    }
  };

  return (
    <div style={{
      position: 'fixed', right: 0, top: 0, height: '100vh', width: '450px',
      background: 'rgba(15, 17, 26, 0.96)', borderLeft: '1px solid var(--border-color)',
      boxShadow: '-10px 0 30px rgba(0,0,0,0.6)', zIndex: 200, display: 'flex', 
      flexDirection: 'column', backdropFilter: 'blur(15px)'
    }}>
      {/* 1. SLIDE DRAWER HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border-color)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <ShieldAlert size={22} color={getRiskColor(profile.risk_level)} />
          <div>
            <h2 style={{ fontSize: '1.15rem', fontFamily: 'var(--font-display)', fontWeight: 800 }}>Threat Investigation</h2>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Audit Trail ID: {profile.player_id}</span>
          </div>
        </div>
        
        <button 
          onClick={onClose}
          style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', padding: '0.2rem', borderRadius: '4px', transition: 'var(--transition-smooth)' }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
        >
          <X size={20} />
        </button>
      </div>

      {/* 2. BODY CONTENT (SCROLLABLE) */}
      <div style={{ flexGrow: 1, overflowY: 'auto', padding: '1.5rem' }}>
        
        {/* A. GENERAL ACCOUNT STATS */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(23, 26, 38, 0.5)', border: '1px solid var(--border-color)', padding: '1rem', borderRadius: '8px', marginBottom: '1.25rem' }}>
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>{profile.username}</h3>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
              Age: {profile.account_age_days} days • Latency: {Math.round(profile.latency_avg)}ms
            </span>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
            <span className="badge critical" style={{ 
              background: profile.risk_level === 'LOW' ? 'rgba(0, 255, 136, 0.08)' : 'rgba(255, 0, 85, 0.08)',
              borderColor: getRiskColor(profile.risk_level),
              color: getRiskColor(profile.risk_level),
              fontSize: '0.68rem'
            }}>
              {profile.risk_level} ({explanation.risk_score}%)
            </span>
            <span style={{ fontSize: '0.62rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>MMR: {Math.round(profile.mmr)}</span>
          </div>
        </div>

        {/* B. RISK SCORES PILLARS BREAKDOWN */}
        <div className="glass-card" style={{ padding: '1rem', marginBottom: '1.25rem' }}>
          <h4 style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--text-secondary)', letterSpacing: '0.5px' }}>Security Threat Pillars</h4>
          
          <div className="pillar-container">
            {/* GRAPH RISK BAR */}
            <div>
              <div className="pillar-row">
                <span>Graph Topological Threat</span>
                <span style={{ color: 'var(--neon-cyan)', fontWeight: 'bold' }}>{profile.risk_graph}%</span>
              </div>
              <div className="pillar-progress-bg" style={{ width: '100%', marginTop: '0.3rem' }}>
                <div className="pillar-progress-fill" style={{ width: `${profile.risk_graph}%`, background: 'var(--neon-cyan)' }}></div>
              </div>
            </div>

            {/* BEHAVIORAL RISK BAR */}
            <div>
              <div className="pillar-row">
                <span>Behavioral / Timing Signature</span>
                <span style={{ color: 'var(--neon-yellow)', fontWeight: 'bold' }}>{profile.risk_behavioral}%</span>
              </div>
              <div className="pillar-progress-bg" style={{ width: '100%', marginTop: '0.3rem' }}>
                <div className="pillar-progress-fill" style={{ width: `${profile.risk_behavioral}%`, background: 'var(--neon-yellow)' }}></div>
              </div>
            </div>

            {/* DEVICE SHARE RISK BAR */}
            <div>
              <div className="pillar-row">
                <span>Hardware Footprint Multi-Sharing</span>
                <span style={{ color: 'var(--neon-orange)', fontWeight: 'bold' }}>{profile.risk_device}%</span>
              </div>
              <div className="pillar-progress-bg" style={{ width: '100%', marginTop: '0.3rem' }}>
                <div className="pillar-progress-fill" style={{ width: `${profile.risk_device}%`, background: 'var(--neon-orange)' }}></div>
              </div>
            </div>

            {/* TRANSACTION RISK BAR */}
            <div>
              <div className="pillar-row">
                <span>Asymmetrical Transaction Flow</span>
                <span style={{ color: 'var(--neon-red)', fontWeight: 'bold' }}>{profile.risk_transaction}%</span>
              </div>
              <div className="pillar-progress-bg" style={{ width: '100%', marginTop: '0.3rem' }}>
                <div className="pillar-progress-fill" style={{ width: `${profile.risk_transaction}%`, background: 'var(--neon-red)' }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* C. NARRATIVE EXPLAINABILITY SYSTEM */}
        <div className="glass-card" style={{ padding: '1rem', marginBottom: '1.25rem', borderColor: profile.risk_level !== 'LOW' ? 'rgba(255,0,85,0.2)' : 'var(--border-color)' }}>
          <h4 style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--text-secondary)', letterSpacing: '0.5px' }}>Audit Narrative trail</h4>
          <div style={{ marginTop: '0.65rem', display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            {explanation.narratives.map((n, idx) => (
              <div key={idx} style={{ display: 'flex', gap: '0.5rem', fontSize: '0.78rem', lineHeight: 1.45, color: 'var(--text-primary)' }}>
                <span style={{ color: getRiskColor(profile.risk_level), marginTop: '0.15rem' }}>•</span>
                <span>{n}</span>
              </div>
            ))}
          </div>
        </div>

        {/* D. SHAP WATERFALL Attributions */}
        <div className="glass-card" style={{ padding: '1rem', marginBottom: '1.25rem' }}>
          <h4 style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--text-secondary)', letterSpacing: '0.5px' }}>
            Feature Weight Attribution (SHAP)
          </h4>
          <p style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
            Attribution impact of model feature vectors on predicted risk
          </p>

          <div className="waterfall-chart">
            {explanation.waterfall_contributions.map((item, idx) => {
              const isPos = item.contribution >= 0;
              const valPercent = Math.min(50, Math.abs(item.contribution) * 150); // Scale for visuals
              
              return (
                <div key={idx} className="waterfall-bar-row">
                  <span className="waterfall-label" title={item.feature}>{item.feature}</span>
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
                    {isPos ? '+' : ''}{item.contribution.toFixed(2)}
                  </span>
                </div>
              );
            })}
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '0.75rem' }}>
            <span>Decreases Risk Score</span>
            <span>Increases Risk Score</span>
          </div>
        </div>

        {/* E. GROUND TRUTH DECRYPTOR (AUDITING INTEGRITY) */}
        <div style={{ background: 'var(--bg-primary)', border: '1px dashed var(--border-color)', padding: '0.85rem', borderRadius: '6px', fontSize: '0.78rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ color: 'var(--text-secondary)' }}>Simulation Decoder Check:</span>
          <span style={{ fontWeight: 'bold', color: profile.player_type === 'legitimate' ? 'var(--neon-green)' : 'var(--neon-red)' }}>
            {formatGroundTruth(profile.player_type)}
          </span>
        </div>

      </div>

      {/* 3. FOOTER MANUAL INTERVENTION CONTROLS */}
      <div style={{ padding: '1.25rem 1.5rem', borderTop: '1px solid var(--border-color)', display: 'flex', gap: '0.5rem', justifyContent: 'stretch' }}>
        <button 
          className="cyber-button"
          style={{ flexGrow: 1, justifyContent: 'center', background: 'var(--neon-red)', color: 'white', borderColor: 'var(--neon-red)' }}
          onClick={() => { alert(`Manual Ban issued for player ${profile.username}. Triggering network quarantine...`); onClose(); }}
        >
          <Lock size={14} /> Quarantine
        </button>
        <button 
          className="cyber-button"
          style={{ flexGrow: 1, justifyContent: 'center', borderColor: 'var(--neon-yellow)' }}
          onClick={() => { alert(`Player ${profile.username} placed into isolated queue matchmaking.`); onClose(); }}
        >
          <EyeOff size={14} /> Shadow-Ban
        </button>
        <button 
          className="cyber-button"
          style={{ flexGrow: 1, justifyContent: 'center', borderColor: 'var(--neon-green)' }}
          onClick={() => { alert(`Player ${profile.username} has been verified and whitelisted.`); onClose(); }}
        >
          <UserCheck size={14} /> Whitelist
        </button>
      </div>
    </div>
  );
}

export default PlayerProfile;

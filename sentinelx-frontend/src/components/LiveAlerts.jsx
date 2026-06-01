import React, { useState } from 'react';
import { 
  ShieldAlert, 
  Trash2, 
  Pause, 
  Play, 
  Clock, 
  Activity,
  ArrowRight,
  TrendingDown,
  UserCheck
} from 'lucide-react';

function LiveAlerts({ alerts, setSelectedPlayerId }) {
  const [isPaused, setIsPaused] = useState(false);
  const [alertHistory, setAlertHistory] = useState([]);

  // Filter or aggregate alerts based on pause state
  const displayedAlerts = isPaused ? alertHistory : alerts;

  const handlePauseToggle = () => {
    if (!isPaused) {
      // Snapshot the current alerts when pausing
      setAlertHistory([...alerts]);
    }
    setIsPaused(!isPaused);
  };

  const getRiskClass = (level) => {
    switch (level) {
      case 'CRITICAL': return 'critical';
      case 'HIGH': return 'high';
      default: return 'medium';
    }
  };

  const formatTime = (isoString) => {
    const d = new Date(isoString);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  return (
    <div style={{ padding: '1.5rem 2rem' }}>
      {/* 1. SECTION HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <span className="badge critical" style={{ fontSize: '0.62rem', letterSpacing: '0.5px', marginBottom: '0.5rem' }}>
            SEC-OPS MONITOR
          </span>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.75rem', fontWeight: 800 }}>Real-Time Stream Alerts</h1>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
            Live gameplay matches, hardware logins, and currency trade audits flowing through online ML risk pipelines
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button 
            className={`cyber-button ${isPaused ? 'active' : ''}`}
            onClick={handlePauseToggle}
          >
            {isPaused ? <Play size={14} /> : <Pause size={14} />}
            {isPaused ? "Resume Live Ingestion" : "Pause Stream Feed"}
          </button>
        </div>
      </div>

      {/* 2. DUAL COLUMN ALERTS MAP */}
      <div className="dashboard-grid" style={{ gridTemplateColumns: '1.8fr 1.2fr' }}>
        {/* LEFT COLUMN: LIVE FLAGGED LOG FEED */}
        <div className="glass-card column-flex" style={{ maxHeight: '600px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.85rem' }}>
            <span style={{ fontSize: '0.9rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span className={`pulse-indicator ${isPaused ? '' : 'green'}`}></span>
              {isPaused ? "STREAM PAUSED (SNAPSHOT VIEW)" : "LIVE PIPELINE INGESTION ACTIVE"}
            </span>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
              Showing {displayedAlerts.length} recent flags
            </span>
          </div>

          <div style={{ flexGrow: 1, overflowY: 'auto', paddingRight: '0.2rem', marginTop: '1rem' }}>
            <div className="alert-feed">
              {displayedAlerts.length > 0 ? (
                displayedAlerts.map((a) => (
                  <div key={a.alert_id} className={`alert-feed-item ${getRiskClass(a.risk_level)}`}>
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                      <ShieldAlert size={20} color={a.risk_level === 'CRITICAL' ? 'var(--neon-red)' : 'var(--neon-orange)'} />
                      
                      <div className="alert-feed-info">
                        <div className="alert-feed-title" style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                          <span style={{ fontWeight: 'bold' }}>{a.username}</span>
                          <span style={{ fontFamily: 'monospace', fontSize: '0.72rem', color: 'var(--neon-cyan)' }}>({a.player_id})</span>
                          <span className={`badge ${getRiskClass(a.risk_level)}`} style={{ fontSize: '0.58rem', padding: '0.1rem 0.4rem' }}>
                            {a.risk_level} ({a.risk_score}%)
                          </span>
                        </div>
                        <div className="alert-feed-desc" style={{ color: 'var(--text-primary)', fontWeight: '500', marginTop: '0.2rem', fontSize: '0.8rem' }}>
                          {a.details[0]}
                        </div>
                        <div className="alert-feed-desc" style={{ color: 'var(--text-muted)', fontSize: '0.72rem' }}>
                          Event: {a.event_type.toUpperCase()} • Action Triggered: Risk Engine Flagged
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.45rem' }}>
                      <span className="alert-feed-time">{formatTime(a.timestamp)}</span>
                      <button 
                        className="cyber-button"
                        style={{ padding: '0.25rem 0.6rem', fontSize: '0.68rem', display: 'flex', alignItems: 'center', gap: '0.2rem' }}
                        onClick={() => setSelectedPlayerId(a.player_id)}
                      >
                        Investigate <ArrowRight size={10} />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '5rem 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.8rem' }}>
                  <Activity size={32} className="logo-icon" />
                  <div>
                    <h3 style={{ color: 'var(--text-primary)', marginBottom: '0.2rem' }}>Listening for Exploits...</h3>
                    <p style={{ fontSize: '0.75rem' }}>Start playing matches or transfers in the backend to stream flags</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: PIPELINE STATS & AUDIT LOGS */}
        <div className="column-flex">
          {/* STAT CARD 1: SUB-SECOND INFERENCE STATUS */}
          <div className="glass-card">
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.05rem', fontWeight: 700, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Clock size={16} color="var(--neon-cyan)" /> Pipeline Inference Speeds
            </h3>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '1.2rem' }}>
              Real-time online feature aggregation and model inference latency
            </p>

            <div style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Feature Fetch (Redis cache proxy):</span>
                <span style={{ color: 'var(--neon-green)', fontWeight: 'bold' }}>~0.082 ms</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Model Evaluation (XGBoost):</span>
                <span style={{ color: 'var(--neon-green)', fontWeight: 'bold' }}>~0.104 ms</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Graph Network Evaluation (GCN):</span>
                <span style={{ color: 'var(--neon-green)', fontWeight: 'bold' }}>~0.320 ms</span>
              </div>
              <div style={{ height: '1px', background: 'var(--border-color)' }}></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: 'bold' }}>
                <span style={{ color: 'var(--text-primary)' }}>Total Pipeline Processing:</span>
                <span style={{ color: 'var(--neon-cyan)' }}>~0.506 ms</span>
              </div>
            </div>
            
            <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.75rem', textAlign: 'center' }}>
              *Target latency: Sub-second. Current performance: 100% SLA compliant.
            </p>
          </div>

          {/* STAT CARD 2: PIPELINE MITIGATION SYSTEM */}
          <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.05rem', fontWeight: 700 }}>Autonomous Actions</h3>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              Mitigation triggers configured for High/Critical threat events
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginTop: '0.4rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(255, 0, 85, 0.05)', border: '1px solid rgba(255, 0, 85, 0.15)', padding: '0.65rem', borderRadius: '6px', fontSize: '0.78rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontWeight: 'bold', color: 'var(--neon-red)' }}>Match Interception</span>
                  <span style={{ color: 'var(--text-secondary)', fontSize: '0.68rem' }}>Cancel match dynamically on collusion</span>
                </div>
                <span style={{ color: 'var(--neon-red)', fontWeight: 'bold' }}>ARMED</span>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(255, 184, 0, 0.05)', border: '1px solid rgba(255, 184, 0, 0.15)', padding: '0.65rem', borderRadius: '6px', fontSize: '0.78rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontWeight: 'bold', color: 'var(--neon-yellow)' }}>Shadow Ban Trigger</span>
                  <span style={{ color: 'var(--text-secondary)', fontSize: '0.68rem' }}>Segregate bots into isolated pools</span>
                </div>
                <span style={{ color: 'var(--neon-yellow)', fontWeight: 'bold' }}>MONITOR</span>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(0, 255, 136, 0.05)', border: '1px solid rgba(0, 255, 136, 0.15)', padding: '0.65rem', borderRadius: '6px', fontSize: '0.78rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontWeight: 'bold', color: 'var(--neon-green)' }}>Manual Flag Review</span>
                  <span style={{ color: 'var(--text-secondary)', fontSize: '0.68rem' }}>Push to Game Security Ops board</span>
                </div>
                <span style={{ color: 'var(--neon-green)', fontWeight: 'bold' }}>AUTO-LOG</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LiveAlerts;

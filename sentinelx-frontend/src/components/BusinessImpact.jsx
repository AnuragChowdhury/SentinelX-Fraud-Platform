import React from 'react';
import { 
  DollarSign, 
  ShieldCheck, 
  TrendingUp, 
  TrendingDown, 
  Award,
  Clock,
  Sparkles,
  Users
} from 'lucide-react';

function BusinessImpact({ stats }) {
  // Hardcoded estimates representing standard large multiplayer metrics
  const baselineLossUSD = 82400; // Expected losses on exploits naively
  const protectedLossUSD = baselineLossUSD - stats.estimated_revenue_saved_usd;
  const roiMultiplier = (stats.estimated_revenue_saved_usd / 12000).toFixed(1); // 12k estimated platform deployment cost

  return (
    <div style={{ padding: '1.5rem 2rem', paddingBottom: '3rem' }}>
      {/* 1. COMPONENT HEADER */}
      <div style={{ marginBottom: '1.5rem' }}>
        <span className="badge low" style={{ color: 'var(--neon-green)', border: '1px solid rgba(0,255,136,0.2)', background: 'rgba(0,255,136,0.05)', fontSize: '0.62rem', letterSpacing: '0.5px', marginBottom: '0.5rem' }}>
          EXECUTIVE ROI MONITOR
        </span>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.75rem', fontWeight: 800 }}>Business Impact & Security ROI</h1>
        <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
          Quantifying the business value, exploits mitigated, retention improvements, and revenue saved by the SentinelX platform.
        </p>
      </div>

      {/* 2. THREE CORE SUMMARY BOXES */}
      <div style={{ display: 'flex', gap: '1.2rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
        {/* IMPACT BOX 1: REVENUE SAVED */}
        <div className="glass-card impact-metric-box" style={{ flexGrow: 1, minWidth: '240px' }}>
          <div className="impact-metric-icon green">
            <DollarSign size={24} />
          </div>
          <div>
            <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>Mitigated Revenue Drainage</span>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.65rem', fontWeight: 800, color: 'var(--neon-green)' }}>
              ${stats.estimated_revenue_saved_usd.toLocaleString()}
            </h3>
            <p style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Estimated chargeback & gold inflation saved</p>
          </div>
        </div>

        {/* IMPACT BOX 2: FAIRNESS INDEX */}
        <div className="glass-card impact-metric-box" style={{ flexGrow: 1, minWidth: '240px' }}>
          <div className="impact-metric-icon" style={{ background: 'rgba(0, 240, 255, 0.1)', color: 'var(--neon-cyan)' }}>
            <Award size={24} />
          </div>
          <div>
            <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>Fairplay Retention Index</span>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.65rem', fontWeight: 800, color: 'var(--neon-cyan)' }}>
              +{stats.match_integrity_score > 90 ? '4.8' : '2.1'}%
            </h3>
            <p style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Churn reduction due to exploit-free match lobbies</p>
          </div>
        </div>

        {/* IMPACT BOX 3: ROI MULTIPLIER */}
        <div className="glass-card impact-metric-box" style={{ flexGrow: 1, minWidth: '240px' }}>
          <div className="impact-metric-icon" style={{ background: 'rgba(255, 184, 0, 0.1)', color: 'var(--neon-yellow)' }}>
            <TrendingUp size={24} />
          </div>
          <div>
            <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>Security Platform ROI</span>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.65rem', fontWeight: 800, color: 'var(--neon-yellow)' }}>
              {roiMultiplier}x
            </h3>
            <p style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Savings multiplier vs platform pipeline cost</p>
          </div>
        </div>
      </div>

      {/* 3. DUAL GRAPH ANALYSIS PANELS */}
      <div className="business-grid">
        {/* PANEL A: EXPLOIT REVENUE DRAIN COMPARISON */}
        <div className="glass-card">
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.05rem', fontWeight: 700, marginBottom: '0.35rem' }}>Ecosystem Fraud Losses</h3>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
            Exploit and chargeback revenue drainage comparison (USD)
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginTop: '0.5rem' }}>
            {/* Baseline Loss (Unprotected) */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: '0.35rem' }}>
                <span style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <TrendingDown size={14} color="var(--neon-red)" /> Unprotected Baseline (No ML Pipelines)
                </span>
                <span style={{ fontWeight: 'bold' }}>${baselineLossUSD.toLocaleString()}</span>
              </div>
              <div style={{ height: '22px', background: 'var(--bg-primary)', borderRadius: '4px', width: '100%', overflow: 'hidden' }}>
                <div style={{ height: '100%', background: 'linear-gradient(90deg, var(--neon-red) 0%, rgba(255,0,85,0.4) 100%)', width: '100%' }}></div>
              </div>
            </div>

            {/* Protected Loss (SentinelX) */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: '0.35rem' }}>
                <span style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <TrendingUp size={14} color="var(--neon-green)" /> SentinelX Shielded Ecosystem
                </span>
                <span style={{ fontWeight: 'bold', color: 'var(--neon-green)' }}>${protectedLossUSD.toLocaleString()}</span>
              </div>
              <div style={{ height: '22px', background: 'var(--bg-primary)', borderRadius: '4px', width: '100%', overflow: 'hidden' }}>
                <div style={{ 
                  height: '100%', 
                  background: 'linear-gradient(90deg, var(--neon-green) 0%, rgba(0,255,136,0.4) 100%)', 
                  width: `${(protectedLossUSD / baselineLossUSD) * 100}%`,
                  transition: 'width 0.8s ease'
                }}></div>
              </div>
            </div>
          </div>

          <div style={{ background: 'rgba(0, 240, 255, 0.05)', border: '1px solid rgba(0, 240, 255, 0.15)', padding: '0.85rem', borderRadius: '6px', fontSize: '0.75rem', marginTop: '1.5rem', display: 'flex', gap: '0.5rem', lineHeight: 1.4 }}>
            <Sparkles size={16} color="var(--neon-cyan)" style={{ flexShrink: 0 }} />
            <span>
              <strong>Platform Insight:</strong> Deploying GNN collusion detection and unsupervised Isolation Forests reduces chargebacks by banning gold farmers before their secondary transactions flood the in-game auction houses.
            </span>
          </div>
        </div>

        {/* PANEL B: PLAYER RETENTION GRAPH */}
        <div className="glass-card">
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.05rem', fontWeight: 700, marginBottom: '0.35rem' }}>Ecosystem Retention Gains</h3>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
            Day-30 player cohort retention curve (Fairplay vs. Exploit Lobbies)
          </p>

          {/* Elegant Custom SVG Cohort Retention Chart */}
          <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
            <svg width="340" height="150" style={{ overflow: 'visible' }}>
              {/* Grid Lines */}
              <line x1="30" y1="20" x2="330" y2="20" stroke="rgba(255,255,255,0.03)" />
              <line x1="30" y1="70" x2="330" y2="70" stroke="rgba(255,255,255,0.03)" />
              <line x1="30" y1="120" x2="330" y2="120" stroke="rgba(255,255,255,0.06)" />

              {/* Axes */}
              <line x1="30" y1="10" x2="30" y2="120" stroke="var(--border-color)" />
              <line x1="30" y1="120" x2="330" y2="120" stroke="var(--border-color)" />

              {/* Curve A: Exploits (Red, low retention) */}
              {/* D1: 80%, D7: 40%, D14: 25%, D30: 12% */}
              <path 
                d="M 30 20 Q 100 80, 180 100 T 330 112" 
                fill="none" 
                stroke="var(--neon-red)" 
                strokeWidth="2.5" 
                opacity="0.5" 
                strokeDasharray="4,4"
              />
              
              {/* Curve B: Fairplay (Cyan, high retention) */}
              {/* D1: 90%, D7: 65%, D14: 55%, D30: 42% */}
              <path 
                d="M 30 10 Q 100 45, 180 65 T 330 78" 
                fill="none" 
                stroke="var(--neon-cyan)" 
                strokeWidth="3"
                style={{ filter: 'drop-shadow(0 0 4px rgba(0, 240, 255, 0.3))' }}
              />

              {/* Axis Labels */}
              <text x="15" y="20" fill="var(--text-muted)" fontSize="8" textAnchor="end">100%</text>
              <text x="15" y="70" fill="var(--text-muted)" fontSize="8" textAnchor="end">50%</text>
              <text x="15" y="120" fill="var(--text-muted)" fontSize="8" textAnchor="end">0%</text>

              <text x="30" y="132" fill="var(--text-muted)" fontSize="8" textAnchor="middle">Day 1</text>
              <text x="100" y="132" fill="var(--text-muted)" fontSize="8" textAnchor="middle">Day 7</text>
              <text x="180" y="132" fill="var(--text-muted)" fontSize="8" textAnchor="middle">Day 14</text>
              <text x="330" y="132" fill="var(--text-muted)" fontSize="8" textAnchor="middle">Day 30</text>
            </svg>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '1.25rem', marginTop: '1.25rem', fontSize: '0.7rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <svg width="14" height="4"><line x1="0" y1="2" x2="14" y2="2" stroke="var(--neon-cyan)" strokeWidth="2" /></svg>
              <span style={{ color: 'var(--text-secondary)' }}>Clean Lobbies (SentinelX)</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <svg width="14" height="4"><line x1="0" y1="2" x2="14" y2="2" stroke="var(--neon-red)" strokeWidth="2" strokeDasharray="3,3" /></svg>
              <span style={{ color: 'var(--text-secondary)' }}>Hacker Lobbies (Exploited)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BusinessImpact;

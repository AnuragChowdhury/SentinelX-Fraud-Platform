import React, { useState, useEffect } from 'react';
import { 
  Users, 
  ShieldCheck, 
  Activity, 
  TrendingUp, 
  Search, 
  Filter, 
  ArrowRight,
  ShieldAlert,
  Coins
} from 'lucide-react';

function Overview({ stats, setSelectedPlayerId, setActiveTab }) {
  const [players, setPlayers] = useState([]);
  const [search, setSearch] = useState('');
  const [riskFilter, setRiskFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 10;
  
  // Fetch players directory from API
  const fetchPlayers = async () => {
    try {
      let url = `http://127.0.0.1:8000/api/v1/players?page=${page}&limit=${limit}`;
      if (search) url += `&search=${encodeURIComponent(search)}`;
      if (riskFilter) url += `&risk_level=${encodeURIComponent(riskFilter)}`;
      if (typeFilter) url += `&player_type=${encodeURIComponent(typeFilter)}`;
      
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setPlayers(data.players);
        setTotalPages(Math.ceil(data.total / limit));
      }
    } catch (err) {
      console.error("Error fetching players:", err);
    }
  };

  useEffect(() => {
    fetchPlayers();
  }, [page, search, riskFilter, typeFilter]);

  // Handle Search input with minor delay (debounce)
  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setPage(1);
  };

  const getRiskClass = (level) => {
    switch (level) {
      case 'CRITICAL': return 'critical';
      case 'HIGH': return 'high';
      case 'MEDIUM': return 'medium';
      default: return 'low';
    }
  };

  // SVG circular progress for match integrity
  const radius = 35;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (stats.match_integrity_score / 100) * circumference;

  return (
    <div style={{ paddingBottom: '2rem' }}>
      {/* 1. TOP STATS CARDS GRID */}
      <section className="kpi-grid">
        {/* KPI CARD: ACTIVE PLAYERS */}
        <div className="glass-card kpi-card">
          <div className="kpi-title">Ecosystem Scale</div>
          <div className="kpi-value-container">
            <div className="kpi-value cyan-glow">{stats.total_players.toLocaleString()}</div>
            <Users size={22} color="var(--neon-cyan)" />
          </div>
          <div className="kpi-trend" style={{ color: 'var(--neon-cyan)' }}>
            <TrendingUp size={12} /> Live Active Nodes
          </div>
        </div>

        {/* KPI CARD: MATCH INTEGRITY INDEX */}
        <div className="glass-card kpi-card" style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', height: '125px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%', width: '60%' }}>
            <div className="kpi-title">Match Integrity Index</div>
            <div className="kpi-value green-glow" style={{ fontSize: '1.9rem', fontWeight: 800 }}>{stats.match_integrity_score}%</div>
            <div className="kpi-trend" style={{ color: 'var(--neon-green)' }}>
              <ShieldCheck size={12} /> Non-Exploited Matches
            </div>
          </div>
          {/* Circular Indicator */}
          <svg width="80" height="80" style={{ transform: 'rotate(-90deg)' }}>
            <circle cx="40" cy="40" r={radius} fill="transparent" stroke="var(--border-color)" strokeWidth="6" />
            <circle cx="40" cy="40" r={radius} fill="transparent" stroke="var(--neon-green)" strokeWidth="6" 
                    strokeDasharray={circumference} strokeDashoffset={strokeDashoffset} strokeLinecap="round"
                    style={{ transition: 'stroke-dashoffset 0.8s ease' }} />
          </svg>
        </div>

        {/* KPI CARD: COLLUSION RING BLOCKER */}
        <div className="glass-card kpi-card">
          <div className="kpi-title">Active Syndicates</div>
          <div className="kpi-value-container">
            <div className="kpi-value red-glow">{stats.collusion_rings_count + stats.farming_syndicates_count}</div>
            <ShieldAlert size={22} color="var(--neon-red)" />
          </div>
          <div className="kpi-trend" style={{ color: 'var(--neon-red)' }}>
            <Activity size={12} /> Detected Win-Rings & Farm Star Networks
          </div>
        </div>

        {/* KPI CARD: PREVENTED LOSSES */}
        <div className="glass-card kpi-card">
          <div className="kpi-title">Fraud Savings</div>
          <div className="kpi-value-container">
            <div className="kpi-value cyan-glow" style={{ color: 'var(--neon-yellow)' }}>${stats.estimated_revenue_saved_usd.toLocaleString()}</div>
            <Coins size={22} color="var(--neon-yellow)" />
          </div>
          <div className="kpi-trend" style={{ color: 'var(--neon-yellow)' }}>
            Est. Revenue Saved
          </div>
        </div>
      </section>

      {/* 2. DUAL COLUMN CONTENT AREA */}
      <section className="dashboard-grid">
        {/* LEFT COLUMN: ACTIVE THREAT DIRECTORY */}
        <div className="glass-card column-flex" style={{ minHeight: '500px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: 700 }}>Ecosystem Security Directory</h2>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Search, filter, and audit all live player profiles</p>
            </div>
            
            <button className="cyber-button" onClick={() => setActiveTab('network')}>
              Graph Analysis Map <ArrowRight size={14} />
            </button>
          </div>

          {/* SEARCH AND FILTERS */}
          <div style={{ display: 'flex', gap: '0.85rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
            <div style={{ position: 'relative', flexGrow: 1, minWidth: '180px' }}>
              <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '10px', top: '10px' }} />
              <input 
                type="text" 
                placeholder="Search username or PLY ID..." 
                value={search}
                onChange={handleSearchChange}
                style={{
                  background: 'var(--bg-primary)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-primary)',
                  padding: '0.55rem 0.55rem 0.55rem 2.2rem',
                  borderRadius: '6px',
                  width: '100%',
                  fontSize: '0.85rem',
                  outline: 'none',
                  transition: 'var(--transition-smooth)'
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {/* Risk Level Filter */}
              <div style={{ display: 'flex', alignItems: 'center', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '0 0.5rem' }}>
                <Filter size={14} color="var(--text-muted)" />
                <select 
                  value={riskFilter}
                  onChange={(e) => { setRiskFilter(e.target.value); setPage(1); }}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--text-secondary)',
                    padding: '0.55rem',
                    outline: 'none',
                    fontSize: '0.8rem',
                    cursor: 'pointer'
                  }}
                >
                  <option value="">All Risks</option>
                  <option value="CRITICAL">Critical</option>
                  <option value="HIGH">High</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="LOW">Low</option>
                </select>
              </div>

              {/* Behavior Type Filter */}
              <div style={{ display: 'flex', alignItems: 'center', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '0 0.5rem' }}>
                <select 
                  value={typeFilter}
                  onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--text-secondary)',
                    padding: '0.55rem',
                    outline: 'none',
                    fontSize: '0.8rem',
                    cursor: 'pointer'
                  }}
                >
                  <option value="">All Behaviors</option>
                  <option value="legitimate">Legitimate</option>
                  <option value="bot">Bots</option>
                  <option value="colluder">Colluders</option>
                  <option value="smurf">Smurfs</option>
                  <option value="farmer">Farmers</option>
                  <option value="multi_account">Multi-Account</option>
                </select>
              </div>
            </div>
          </div>

          {/* PLAYERS DIRECTORY TABLE */}
          <div className="custom-table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Player ID</th>
                  <th>Username</th>
                  <th>Win Rate</th>
                  <th>MMR Rating</th>
                  <th>Device Multi</th>
                  <th>Security Status</th>
                  <th style={{ textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {players.length > 0 ? (
                  players.map((p) => (
                    <tr key={p.player_id}>
                      <td style={{ fontFamily: 'monospace', color: 'var(--neon-cyan)', fontWeight: 'bold' }}>{p.player_id}</td>
                      <td style={{ fontWeight: '500' }}>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span>{p.username}</span>
                          <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'capitalize' }}>Profile: {p.player_type}</span>
                        </div>
                      </td>
                      <td style={{ fontWeight: '600' }}>{p.winrate_recent}%</td>
                      <td>{p.mmr}</td>
                      <td style={{ textAlign: 'center' }}>
                        <span style={{ color: p.graph_device_sharing_degree > 1 ? 'var(--neon-red)' : 'var(--text-secondary)' }}>
                          {p.graph_device_sharing_degree}
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${getRiskClass(p.risk_level)}`}>
                          {p.risk_level} ({p.risk_score}%)
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <button 
                          className="cyber-button"
                          style={{ padding: '0.35rem 0.75rem', fontSize: '0.72rem' }}
                          onClick={() => setSelectedPlayerId(p.player_id)}
                        >
                          Audit
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>
                      No players found matching current filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* PAGINATION CONTROLS */}
          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                Page {page} of {totalPages}
              </span>
              
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button 
                  className="cyber-button" 
                  disabled={page === 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  style={{ padding: '0.35rem 0.8rem', fontSize: '0.75rem', opacity: page === 1 ? 0.4 : 1, cursor: page === 1 ? 'not-allowed' : 'pointer' }}
                >
                  Prev
                </button>
                <button 
                  className="cyber-button" 
                  disabled={page === totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  style={{ padding: '0.35rem 0.8rem', fontSize: '0.75rem', opacity: page === totalPages ? 0.4 : 1, cursor: page === totalPages ? 'not-allowed' : 'pointer' }}
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: CYBER THREAT OVERVIEW CHARTS */}
        <div className="column-flex">
          {/* SUB-CARD 1: ANOMALY CLASSIFICATION DISTRIBUTION */}
          <div className="glass-card">
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.05rem', fontWeight: 700, marginBottom: '0.5rem' }}>Security Threat Spectrum</h3>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '1.2rem' }}>Engineered ML threat classification counts</p>
            
            {/* Custom Interactive SVG Pie/Ring representation */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', justifyContent: 'center' }}>
              <svg width="120" height="120" style={{ transform: 'rotate(-90deg)' }}>
                {/* Simulated static donut sections based on stats distribution */}
                {/* Legit (85%), Bots (5%), Colluders (4%), Smurfs (3%), Farmers (3%) */}
                <circle cx="60" cy="60" r="45" fill="transparent" stroke="var(--neon-green)" strokeWidth="12" strokeDasharray="282.7" strokeDashoffset="42.4" />
                <circle cx="60" cy="60" r="45" fill="transparent" stroke="var(--neon-red)" strokeWidth="12" strokeDasharray="282.7" strokeDashoffset="268.5" />
                <circle cx="60" cy="60" r="45" fill="transparent" stroke="var(--neon-cyan)" strokeWidth="12" strokeDasharray="282.7" strokeDashoffset="254.4" />
                <circle cx="60" cy="60" r="45" fill="transparent" stroke="var(--neon-yellow)" strokeWidth="12" strokeDasharray="282.7" strokeDashoffset="240.3" />
              </svg>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem', fontSize: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--neon-green)' }}></span>
                  <span style={{ color: 'var(--text-secondary)' }}>Legitimate: ~92%</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--neon-red)' }}></span>
                  <span style={{ color: 'var(--text-secondary)' }}>Bots / Farmers: ~4.5%</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--neon-cyan)' }}></span>
                  <span style={{ color: 'var(--text-secondary)' }}>Smurfs / Boosters: ~2.0%</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--neon-yellow)' }}></span>
                  <span style={{ color: 'var(--text-secondary)' }}>Colluders: ~1.5%</span>
                </div>
              </div>
            </div>
          </div>

          {/* SUB-CARD 2: REAL-TIME RADAR PULSE ACTION */}
          <div className="glass-card critical-alarm" style={{ background: 'linear-gradient(135deg, rgba(23, 26, 38, 0.9) 0%, rgba(255, 0, 85, 0.05) 100%)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <span className="badge critical" style={{ fontSize: '0.62rem', letterSpacing: '0.5px', marginBottom: '0.5rem' }}>
                  SEC-OPS RADAR
                </span>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', fontWeight: 700, marginTop: '0.2rem' }}>Live Alert Broadcasts</h3>
              </div>
              <span className="pulse-indicator"></span>
            </div>
            
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '0.75rem 0 1.25rem 0', lineHeight: 1.4 }}>
              Connect live streaming logs and catch exploit vectors (win-trading, reward farming bots) as they happen in milliseconds.
            </p>
            
            <button 
              className="cyber-button" 
              style={{ background: 'var(--neon-red)', color: 'white', borderColor: 'var(--neon-red)', width: '100%', justifyContent: 'center' }}
              onClick={() => setActiveTab('alerts')}
            >
              Access Streaming Feed
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Overview;

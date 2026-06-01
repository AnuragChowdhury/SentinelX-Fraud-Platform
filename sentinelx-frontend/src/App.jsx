import React, { useState, useEffect, useRef } from 'react';
import { 
  ShieldAlert, 
  Activity, 
  Users, 
  Network, 
  DollarSign, 
  TrendingUp, 
  AlertTriangle,
  User,
  Settings,
  HelpCircle,
  FileText,
  Sliders,
  FolderLock
} from 'lucide-react';
import Overview from './components/Overview';
import LiveAlerts from './components/LiveAlerts';
import NetworkGraph from './components/NetworkGraph';
import BusinessIntelligence from './components/BusinessIntelligence';
import CaseInvestigationCenter from './components/CaseInvestigationCenter';
import BusinessImpact from './components/BusinessImpact';
import PlatformGuide from './components/PlatformGuide';
import ThreatIntelligence from './components/ThreatIntelligence';
import { API_BASE, WS_BASE } from './config';

function App() {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedPlayerId, setSelectedPlayerId] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [stats, setStats] = useState({
    total_players: 0,
    flagged_players: 0,
    critical_players: 0,
    high_risk_players: 0,
    match_integrity_score: 100.0,
    estimated_revenue_saved_usd: 0,
    collusion_rings_count: 0,
    farming_syndicates_count: 0
  });
  
  const wsRef = useRef(null);
  
  // 1. Fetch Overview Statistics
  const fetchStats = async () => {
    try {
      const res = await fetch(`${API_BASE}/overview`);
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (err) {
      console.error("Error fetching overview stats:", err);
    }
  };

  useEffect(() => {
    fetchStats();
    
    // Poll stats every 15 seconds to update dashboards
    const interval = setInterval(fetchStats, 15000);
    return () => clearInterval(interval);
  }, []);

  // 2. Real-Time WebSockets Alert Feed Connection
  useEffect(() => {
    const connectWS = () => {
      console.log("Connecting to SentinelX V2 streaming alerts WS...");
      const ws = new WebSocket(`${WS_BASE}/stream/alerts`);
      wsRef.current = ws;
      
      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.type === 'heartbeat') return;
        
        // Add new alert to list (keep latest 50)
        setAlerts((prev) => [data, ...prev].slice(0, 50));
        
        // Increment stat counts locally for dynamic responsiveness
        setStats((prev) => ({
          ...prev,
          flagged_players: prev.flagged_players + 1,
          critical_players: data.risk_level === 'CRITICAL' ? prev.critical_players + 1 : prev.critical_players,
          high_risk_players: data.risk_level === 'HIGH' ? prev.high_risk_players + 1 : prev.high_risk_players,
        }));
      };
      
      ws.onerror = (err) => {
        console.error("WebSocket encountered error: ", err);
      };
      
      ws.onclose = () => {
        console.log("WebSocket disconnected. Retrying in 5 seconds...");
        setTimeout(connectWS, 5000);
      };
    };
    
    connectWS();
    return () => {
      if (wsRef.current) wsRef.current.close();
    };
  }, []);

  return (
    <div className="app-container">
      {/* 1. TOP HEADER NAVIGATION */}
      <header>
        <div className="logo-section">
          <ShieldAlert size={28} className="logo-icon" />
          <span className="logo-text">SENTINELX</span>
          <span className="logo-badge" style={{ borderColor: 'var(--neon-red)', color: 'var(--neon-red)', background: 'rgba(255,0,85,0.08)' }}>
            V2 PLATFORM
          </span>
        </div>
        
        <div className="nav-links">
          <span 
            className={`nav-item ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            Overview
          </span>
          <span 
            className={`nav-item ${activeTab === 'alerts' ? 'active' : ''}`}
            onClick={() => setActiveTab('alerts')}
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
          >
            Alert Feed
            {alerts.length > 0 && (
              <span style={{ 
                background: 'var(--neon-red)', 
                color: 'white', 
                fontSize: '0.62rem', 
                padding: '0.05rem 0.35rem', 
                borderRadius: '10px',
                fontWeight: 'bold',
                boxShadow: '0 0 5px var(--neon-red)'
              }}>
                {alerts.length}
              </span>
            )}
          </span>
          <span 
            className={`nav-item ${activeTab === 'network' ? 'active' : ''}`}
            onClick={() => setActiveTab('network')}
          >
            Network Visualizer
          </span>
          <span 
            className={`nav-item ${activeTab === 'bi_command' ? 'active' : ''}`}
            onClick={() => setActiveTab('bi_command')}
            style={{ color: activeTab === 'bi_command' ? 'var(--neon-cyan)' : 'var(--text-secondary)' }}
          >
            BI Control Room
          </span>
          <span 
            className={`nav-item ${activeTab === 'business' ? 'active' : ''}`}
            onClick={() => setActiveTab('business')}
          >
            Business Impact
          </span>
          <span 
            className={`nav-item ${activeTab === 'guide' ? 'active' : ''}`}
            onClick={() => setActiveTab('guide')}
            style={{ color: activeTab === 'guide' ? 'var(--neon-cyan)' : 'var(--text-secondary)' }}
          >
            System Guide
          </span>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: 'var(--text-secondary)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.8rem' }}>
            <span className="pulse-indicator green"></span>
            <span>SYSTEM ACTIVE</span>
          </div>
        </div>
      </header>

      {/* 2. MAIN LAYOUT AND TABS RENDER */}
      <main style={{ flexGrow: 1 }}>
        {activeTab === 'overview' && (
          <Overview 
            stats={stats} 
            setSelectedPlayerId={setSelectedPlayerId} 
            setActiveTab={setActiveTab}
          />
        )}
        
        {activeTab === 'alerts' && (
          <LiveAlerts 
            alerts={alerts} 
            setSelectedPlayerId={setSelectedPlayerId}
          />
        )}
        
        {activeTab === 'network' && (
          <NetworkGraph 
            setSelectedPlayerId={setSelectedPlayerId}
          />
        )}

        {activeTab === 'bi_command' && (
          <BusinessIntelligence />
        )}
        
        {activeTab === 'business' && (
          <BusinessImpact 
            stats={stats}
          />
        )}
        
        {activeTab === 'guide' && (
          <PlatformGuide />
        )}
      </main>

      {/* 3. SLIDEOUT V2 OPERATION CASE WORKSPACE PANEL */}
      {selectedPlayerId && (
        <CaseInvestigationCenter 
          playerId={selectedPlayerId} 
          onClose={() => setSelectedPlayerId(null)}
        />
      )}
    </div>
  );
}

export default App;

import React, { useState, useEffect, useRef } from 'react';
import { Network, Activity, Info, RefreshCw } from 'lucide-react';
import { API_BASE } from '../config';

function NetworkGraph({ setSelectedPlayerId }) {
  const [graphData, setGraphData] = useState({ elements: [] });
  const [loading, setLoading] = useState(true);
  const [selectedRing, setSelectedRing] = useState('');
  const [ringsList, setRingsList] = useState([]);
  
  // Physics engine node states
  const [nodes, setNodes] = useState([]);
  const [links, setLinks] = useState([]);
  const [draggedNode, setDraggedNode] = useState(null);
  
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  
  // Dimensions
  const width = 800;
  const height = 480;

  // 1. Fetch Collusion Rings List (to populate drop-down selector)
  const fetchRings = async () => {
    try {
      const res = await fetch(`${API_BASE}/collusion`);
      if (res.ok) {
        const data = await res.json();
        setRingsList(data.win_trading_rings || []);
      }
    } catch (err) {
      console.error("Error fetching collusion rings:", err);
    }
  };

  // 2. Fetch Subgraph elements (either generic top-risk, or ring-specific)
  const fetchSubgraph = async (ringId = '') => {
    setLoading(true);
    try {
      let url = `${API_BASE}/graph/subgraph`;
      if (ringId) url += `?ring_id=${encodeURIComponent(ringId)}`;
      
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setGraphData(data);
        initializePhysics(data);
      }
    } catch (err) {
      console.error("Error fetching subgraph:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRings();
    fetchSubgraph();
  }, []);

  // 3. Initialize Custom Physics Layout (Spring Embedder Force Directed)
  const initializePhysics = (data) => {
    const rawElements = data.elements || [];
    
    // Extract node elements
    const rawNodes = rawElements.filter(el => el.data.type === 'player');
    const playerNodes = rawNodes.map((n, i) => {
      // Position nodes in a circular formation initially
      const angle = (i / rawNodes.length) * 2 * Math.PI;
      const radius = 150 + Math.random() * 50;
      return {
        id: n.data.id,
        label: n.data.username || n.data.label,
        risk_level: n.data.risk_level || 'LOW',
        risk_score: n.data.risk_score || 0,
        player_type: n.data.player_type || 'legitimate',
        x: width / 2 + Math.cos(angle) * radius,
        y: height / 2 + Math.sin(angle) * radius,
        vx: 0,
        vy: 0,
        fx: null,
        fy: null
      };
    });
    
    // Extract edge links
    const edgeElements = rawElements.filter(el => el.data.type === 'match' || el.data.type === 'trade');
    const linksList = edgeElements.map(e => ({
      id: e.data.id,
      source: e.data.source,
      target: e.data.target,
      type: e.data.type,
      weight: e.data.weight || 1
    })).filter(l => {
      // Keep only links where both source and target exist
      const sourceExists = playerNodes.some(n => n.id === l.source);
      const targetExists = playerNodes.some(n => n.id === l.target);
      return sourceExists && targetExists;
    });

    setNodes(playerNodes);
    setLinks(linksList);
  };

  // 4. Spring physics loop (Hooke's and Coulomb's laws)
  useEffect(() => {
    if (nodes.length === 0) return;
    
    const runPhysicsStep = () => {
      setNodes(prevNodes => {
        // Create copies for manipulation
        const newNodes = prevNodes.map(n => ({ ...n }));
        const nodeMap = {};
        newNodes.forEach(n => { nodeMap[n.id] = n; });

        // Parameters
        const k = 0.04;      // Spring attractive stiffness
        const rep = 800;     // Repulsion constant
        const centerGravity = 0.015;
        const friction = 0.88;
        const restLength = 120; // Rest spring length

        // A. Repulsion (between all node pairs)
        for (let i = 0; i < newNodes.length; i++) {
          const n1 = newNodes[i];
          for (let j = i + 1; j < newNodes.length; j++) {
            const n2 = newNodes[j];
            
            const dx = n2.x - n1.x;
            const dy = n2.y - n1.y;
            const distSq = dx * dx + dy * dy + 1e-4;
            const dist = Math.sqrt(distSq);
            
            if (dist < 350) {
              const force = rep / distSq;
              const fx = (dx / dist) * force;
              const fy = (dy / dist) * force;
              
              if (n1.fx === null) { n1.vx -= fx; n1.vy -= fy; }
              if (n2.fx === null) { n2.vx += fx; n2.vy += fy; }
            }
          }
        }

        // B. Attraction (along links)
        links.forEach(link => {
          const sNode = nodeMap[link.source];
          const tNode = nodeMap[link.target];
          
          if (!sNode || !tNode) return;
          
          const dx = tNode.x - sNode.x;
          const dy = tNode.y - sNode.y;
          const dist = Math.sqrt(dx * dx + dy * dy) + 1e-4;
          
          // Spring force: F = k * (x - L)
          const displacement = dist - restLength;
          const force = k * displacement;
          const fx = (dx / dist) * force;
          const fy = (dy / dist) * force;
          
          if (sNode.fx === null) { sNode.vx += fx; sNode.vy += fy; }
          if (tNode.fx === null) { tNode.vx -= fx; tNode.vy -= fy; }
        });

        // C. Gravitation to Center & Apply velocities
        newNodes.forEach(node => {
          if (node.fx !== null) {
            node.x = node.fx;
            node.y = node.fy;
            node.vx = 0;
            node.vy = 0;
            return;
          }

          // Gravity pull to center
          const cdx = width / 2 - node.x;
          const cdy = height / 2 - node.y;
          node.vx += cdx * centerGravity;
          node.vy += cdy * centerGravity;

          // Apply velocity with friction
          node.vx *= friction;
          node.vy *= friction;
          
          node.x += node.vx;
          node.y += node.vy;

          // Clamping to screen boundaries
          node.x = Math.max(20, Math.min(width - 20, node.x));
          node.y = Math.max(20, Math.min(height - 20, node.y));
        });

        return newNodes;
      });
      
      animationRef.current = requestAnimationFrame(runPhysicsStep);
    };

    animationRef.current = requestAnimationFrame(runPhysicsStep);
    return () => cancelAnimationFrame(animationRef.current);
  }, [links, nodes.length]);

  // 5. Drag and Drop handlers
  const handleMouseDown = (e, node) => {
    e.preventDefault();
    const svgRect = canvasRef.current.getBoundingClientRect();
    const mouseX = e.clientX - svgRect.left;
    const mouseY = e.clientY - svgRect.top;
    
    node.fx = mouseX;
    node.fy = mouseY;
    setDraggedNode(node);
  };

  const handleMouseMove = (e) => {
    if (!draggedNode) return;
    const svgRect = canvasRef.current.getBoundingClientRect();
    const mouseX = e.clientX - svgRect.left;
    const mouseY = e.clientY - svgRect.top;
    
    setNodes(prev => prev.map(n => {
      if (n.id === draggedNode.id) {
        n.fx = mouseX;
        n.fy = mouseY;
        n.x = mouseX;
        n.y = mouseY;
      }
      return n;
    }));
  };

  const handleMouseUp = () => {
    if (!draggedNode) return;
    setNodes(prev => prev.map(n => {
      if (n.id === draggedNode.id) {
        n.fx = null;
        n.fy = null;
      }
      return n;
    }));
    setDraggedNode(null);
  };

  const handleRingChange = (e) => {
    const val = e.target.value;
    setSelectedRing(val);
    fetchSubgraph(val);
  };

  const getNodeColor = (risk) => {
    switch (risk) {
      case 'CRITICAL': return 'var(--neon-red)';
      case 'HIGH': return 'var(--neon-orange)';
      case 'MEDIUM': return 'var(--neon-yellow)';
      default: return 'var(--neon-green)';
    }
  };

  return (
    <div style={{ padding: '1.5rem 2rem' }}>
      {/* HEADER SECTION */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <span className="badge low" style={{ color: 'var(--neon-cyan)', border: '1px solid rgba(0,240,255,0.2)', background: 'rgba(0,240,255,0.05)', fontSize: '0.62rem', letterSpacing: '0.5px', marginBottom: '0.5rem' }}>
            GRAPH METRICS ENGINE
          </span>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.75rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            Multiplayer Interaction Visualizer
          </h1>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
            Real-time physical layouts of player match co-occurrences and asymmetrical gold trade flows. Drag nodes to inspect local structures.
          </p>
        </div>

        {/* CLIQUE / RING FILTER SELECTOR */}
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '0 0.5rem' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginRight: '0.5rem' }}>Scope:</span>
            <select 
              value={selectedRing}
              onChange={handleRingChange}
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
              <option value="">Suspicious Threat Cluster</option>
              {ringsList.map(r => (
                <option key={r.ring_id} value={r.ring_id}>Win-Trading Ring: {r.ring_id} ({r.size} members)</option>
              ))}
            </select>
          </div>

          <button className="cyber-button" onClick={() => fetchSubgraph(selectedRing)}>
            <RefreshCw size={14} /> Re-Align Graph
          </button>
        </div>
      </div>

      {/* GRAPH CANVAS MAIN */}
      <div className="glass-card" style={{ padding: '0.85rem' }}>
        <div className="network-canvas-container" style={{ cursor: draggedNode ? 'grabbing' : 'grab' }}>
          {/* Controls Overlay */}
          <div className="network-controls">
            <div style={{ background: 'rgba(15,17,26,0.85)', padding: '0.35rem 0.65rem', borderRadius: '4px', border: '1px solid var(--border-color)', fontSize: '0.72rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Info size={12} color="var(--neon-cyan)" />
              <span>Left-click + Drag a node to isolate. Double-click to audit player profile.</span>
            </div>
          </div>

          {/* Legend Overlay */}
          <div className="network-legend">
            <div className="legend-item"><span className="legend-dot" style={{ background: 'var(--neon-red)' }}></span>Critical Risk</div>
            <div className="legend-item"><span className="legend-dot" style={{ background: 'var(--neon-orange)' }}></span>High Risk</div>
            <div className="legend-item"><span className="legend-dot" style={{ background: 'var(--neon-yellow)' }}></span>Medium Risk</div>
            <div className="legend-item"><span className="legend-dot" style={{ background: 'var(--neon-green)' }}></span>Legitimate</div>
            <div style={{ borderTop: '1px solid var(--border-color)', margin: '0.35rem 0' }}></div>
            <div className="legend-item" style={{ fontSize: '0.62rem' }}>
              <svg width="20" height="6"><line x1="0" y1="3" x2="20" y2="3" stroke="rgba(255, 255, 255, 0.2)" strokeWidth="1" /></svg> Match Co-play
            </div>
            <div className="legend-item" style={{ fontSize: '0.62rem' }}>
              <svg width="20" height="6"><line x1="0" y1="3" x2="20" y2="3" stroke="var(--neon-yellow)" strokeWidth="1" strokeDasharray="3,3" /></svg> Gold Trade Flow
            </div>
          </div>

          {/* Loading Indicator */}
          {loading && (
            <div style={{ position: 'absolute', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(8,9,12,0.8)', zindex: 20 }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
                <Activity className="logo-icon animate-pulse" size={40} />
                <span style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>Executing Force Physics Layout...</span>
              </div>
            </div>
          )}

          {/* SVG Force-Directed Rendering Canvas */}
          <svg 
            ref={canvasRef}
            width={width} 
            height={height}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            style={{ width: '100%', height: '100%' }}
          >
            {/* SVG Glowing drop shadow filters */}
            <defs>
              <filter id="glow-red" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="4" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
              <filter id="glow-cyan" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* A. DRAW LINKS (EDGES) */}
            {links.map((link) => {
              const sourceNode = nodes.find(n => n.id === link.source);
              const targetNode = nodes.find(n => n.id === link.target);
              
              if (!sourceNode || !targetNode) return null;
              
              const isTrade = link.type === 'trade';
              const edgeColor = isTrade ? 'rgba(255, 184, 0, 0.4)' : 'rgba(255, 255, 255, 0.08)';
              const strokeWidth = isTrade ? Math.min(3, 1 + link.weight / 5000) : 1.2;
              
              return (
                <g key={link.id}>
                  <line
                    x1={sourceNode.x}
                    y1={sourceNode.y}
                    x2={targetNode.x}
                    y2={targetNode.y}
                    stroke={edgeColor}
                    strokeWidth={strokeWidth}
                    strokeDasharray={isTrade ? "3,3" : "none"}
                  />
                  {/* Drawing arrows for Directed Trades */}
                  {isTrade && (
                    <circle
                      cx={(sourceNode.x + targetNode.x) / 2}
                      cy={(sourceNode.y + targetNode.y) / 2}
                      r="2"
                      fill="var(--neon-yellow)"
                    />
                  )}
                </g>
              );
            })}

            {/* B. DRAW NODES */}
            {nodes.map((node) => {
              const nodeColor = getNodeColor(node.risk_level);
              const isHacker = node.player_type !== 'legitimate';
              const radius = isHacker ? 13 : 9;
              
              return (
                <g 
                  key={node.id}
                  transform={`translate(${node.x}, ${node.y})`}
                  onMouseDown={(e) => handleMouseDown(e, node)}
                  onDoubleClick={() => setSelectedPlayerId(node.id)}
                  style={{ cursor: 'pointer' }}
                >
                  {/* Outer Pulsing Aura for Hackers/Farmers */}
                  {isHacker && (
                    <circle
                      r={radius + 5}
                      fill="transparent"
                      stroke={nodeColor}
                      strokeWidth="1.5"
                      opacity="0.3"
                      style={{
                        animation: 'pulse-ring 2s infinite',
                        transformOrigin: 'center'
                      }}
                    />
                  )}
                  
                  {/* Primary Node Ball */}
                  <circle
                    r={radius}
                    fill="#12141c"
                    stroke={nodeColor}
                    strokeWidth={isHacker ? "2.5" : "1.8"}
                    style={{
                      filter: node.risk_level === 'CRITICAL' ? 'url(#glow-red)' : 'none',
                      transition: 'r 0.2s ease'
                    }}
                  />
                  
                  {/* Glowing core dot for high risk */}
                  {node.risk_level === 'CRITICAL' && (
                    <circle
                      r="4"
                      fill="var(--neon-red)"
                    />
                  )}
                  
                  {/* Text labels (displayed on hover/active or simple offset) */}
                  <text
                    y={radius + 14}
                    textAnchor="middle"
                    fill="var(--text-primary)"
                    fontSize="10"
                    fontWeight="600"
                    style={{
                      pointerEvents: 'none',
                      textShadow: '0 1px 4px rgba(0,0,0,0.9)',
                      fontFamily: 'var(--font-main)'
                    }}
                  >
                    {node.label}
                  </text>
                  <text
                    y={radius + 24}
                    textAnchor="middle"
                    fill="var(--text-muted)"
                    fontSize="8"
                    style={{ pointerEvents: 'none' }}
                  >
                    {node.id}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      </div>
    </div>
  );
}

export default NetworkGraph;

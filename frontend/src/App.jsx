import React, { useState, useCallback } from "react";
import { requestPipeline1, requestPipeline2, requestPipeline3 } from "./api/pipeline";
import { usePipelineEvents } from "./hooks/usePipelineEvents";
import { useAuditTrail } from "./hooks/useAuditTrail";

import PipelineVisualizer from "./components/pipeline/PipelineVisualizer";
import NodeAPortal from "./components/nodes/NodeAPortal";
import NodeBMonitor from "./components/nodes/NodeBMonitor";
import SidebarAudit from "./components/layout/SidebarAudit";
import CentralView from "./components/nodes/CentralView";

const FILTERS_INITIAL = { 1: "idle", 2: "idle", 3: "idle", 4: "idle" };

// Read role from URL: ?role=nodeA | nodeB | central
function getRole() {
  const params = new URLSearchParams(window.location.search);
  const r = params.get("role");
  if (r === "nodeA" || r === "nodeB" || r === "central") return r;
  return "central"; // default
}

export default function App() {
  const role = getRole();

  const [filterStates, setFilterStates] = useState(FILTERS_INITIAL);
  const [isP2PActive, setIsP2PActive] = useState(false);
  const [nodeBData, setNodeBData] = useState({ step: "idle", raw: null, fhir: null });
  const [receivedDoc, setReceivedDoc] = useState(null);
  const [isOffline, setIsOffline] = useState(false);
  const { auditEntries, addAuditEntry } = useAuditTrail();

  const handleFilterUpdate = useCallback((event) => {
    // "audit" events only update the sidebar — they don't affect filter visualizer state
    if (event.status === "audit") {
      addAuditEntry(event.payload);
      return;
    }

    setFilterStates(prev => ({ ...prev, [event.filterId]: event.status }));

    if (event.status === "done") {
      if (event.filterId === 2 || event.filterId === 3) {
        addAuditEntry(event.payload);
      } else if (event.filterId === 4) {
        setNodeBData(prev => ({ ...prev, raw: event.payload, step: "extracting" }));
      } else if (event.filterId === 1) {
        setNodeBData(prev => ({ ...prev, fhir: event.payload, step: "converting" }));
      }
    } else if (event.status === "error") {
      addAuditEntry({
        timestamp: new Date().toISOString(),
        noeud: "Systeme",
        filterId: event.filterId,
        action: `ERREUR Filtre ${event.filterId} : ${event.payload || "Pipeline bloque."}`
      });
    }
  }, [addAuditEntry]);

  usePipelineEvents(handleFilterUpdate);

  const handleFullWorkflow = async (sectionMeta) => {
    setIsP2PActive(true);
    setFilterStates(FILTERS_INITIAL);
    setReceivedDoc(null);
    setNodeBData({ step: "idle", raw: null, fhir: null });

    try {
      const p1Res = await requestPipeline1({
        patientId: "DZ-2019-00442",
        token: "MOCK_TRUSTED_TOKEN_CHNA",
        section: sectionMeta.type,
        targetNode: sectionMeta.nodeId
      });

      if (isOffline) {
        throw new Error("NETWORK_TIMEOUT: Nœud B injoignable");
      }

      const p2Res = await requestPipeline2(p1Res.data);
      const p3Res = await requestPipeline3(p2Res.data);

      setReceivedDoc(p3Res.data);
      setNodeBData(prev => ({ ...prev, step: "done" }));

    } catch (err) {
      if (isOffline || err.message.includes("TIMEOUT")) {
        setReceivedDoc({
          display: sectionMeta.label,
          sourceNode: sectionMeta.nodeId,
          effectiveDateTime: new Date().toISOString(),
          conclusion: "CONTENU INDISPONIBLE : Le serveur distant est hors ligne. Métadonnées conservées via cache Lighthouse.",
          isGhost: true
        });
        addAuditEntry({
          timestamp: new Date().toISOString(),
          noeud: "Nœud A",
          filterId: 3,
          action: "MODE DÉGRADÉ : Échec de connexion au Nœud B. Timeline Ghost activé."
        });
      }
      setFilterStates(prev => {
        const failed = {};
        Object.keys(prev).forEach(k => {
          if (prev[k] === "active" || prev[k] === "idle") failed[k] = "error";
        });
        return { ...prev, ...failed };
      });
    } finally {
      setIsP2PActive(false);
    }
  };

  const roleLabel = { nodeA: "Noeud A", nodeB: "Noeud B", central: "Central" }[role];
  const roleColor = { nodeA: "#2563eb", nodeB: "#d97706", central: "#16a34a" }[role];

  return (
    <div className="app">
      {/* ── HEADER ── */}
      <header className="app-header">
        <div className="header-left">

          <h1 className="logo">MediLink</h1>
        </div>

        <div className="header-right">
          <div className={`net-status ${isOffline ? "offline" : "online"}`}>
            <span className="net-dot" />
            {isOffline ? "Réseau Coupé" : "mTLS Actif"}
          </div>

          {/* Only central/nodeA can toggle network */}
          {(role === "central" || role === "nodeA") && (
            <label className="toggle">
              <input type="checkbox" checked={isOffline} onChange={() => setIsOffline(v => !v)} />
              <span className="toggle-track">
                <span className="toggle-thumb" />
              </span>
              <span className="toggle-label">Couper réseau</span>
            </label>
          )}

          <div className="role-selector">
            <select value={role} onChange={(e) => window.location.href = `?role=${e.target.value}`} className="role-dropdown">
              <option value="nodeA">Noeud A</option>
              <option value="nodeB">Noeud B</option>
              <option value="central">Central</option>
            </select>
          </div>
        </div>
      </header>

      {/* ── BODY ── */}
      <div className="app-body">
        {/* NODE A VIEW */}
        {role === "nodeA" && (
          <div className="view-nodeA">
            <div className="pipe-row">
              <div className="section-label">Pipeline Pipe & Filter — Noeud A</div>
              <PipelineVisualizer filterStates={filterStates} compact />
            </div>
            <div className="main-col">
              <div className="panel-main">
                <NodeAPortal
                  onDownload={handleFullWorkflow}
                  document={receivedDoc}
                  isLoading={isP2PActive}
                />
              </div>
              <aside className="panel-audit">
                <SidebarAudit entries={auditEntries} />
              </aside>
            </div>
          </div>
        )}

        {/* NODE B VIEW */}
        {role === "nodeB" && (
          <div className="view-nodeB">
            <div className="pipe-row">
              <div className="section-label">Pipeline Pipe & Filter — Noeud B</div>
              <PipelineVisualizer filterStates={filterStates} compact />
            </div>
            <div className="main-col">
              <div className="panel-main">
                <NodeBMonitor data={nodeBData} isActive={isP2PActive || nodeBData.step !== "idle"} />
              </div>
              <aside className="panel-audit">
                <SidebarAudit entries={auditEntries} filterNode="Noeud B" />
              </aside>
            </div>
          </div>
        )}

        {/* CENTRAL VIEW */}
        {role === "central" && (
          <div className="view-central">
            <div className="pipe-row">
              <div className="section-label">Pipeline Global — Central</div>
              <PipelineVisualizer filterStates={filterStates} />
            </div>
            <div className="central-grid">
              <CentralView
                filterStates={filterStates}
                auditEntries={auditEntries}
                isOffline={isOffline}
                isP2PActive={isP2PActive}
                nodeBData={nodeBData}
              />
            </div>
          </div>
        )}
      </div>

      <style>{`
        *, *::before, *::after { box-sizing: border-box; }
        
        .app {
          display: flex;
          flex-direction: column;
          background: var(--color-bg, #f8f9fa);
          font-family: 'Inter', sans-serif;
        }

        /* ── HEADER ── */
        .app-header {
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
          padding: 0.6rem 1.25rem;
          background: linear-gradient(135deg, #14532d, #166534);
          border-bottom: 3px solid #ca8a04;
          color: white;
          min-height: 56px;
        }
        .header-left {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          min-width: 0;
        }
        .role-badge {
          font-size: 0.65rem;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          padding: 0.2rem 0.6rem;
          border-radius: 4px;
          white-space: nowrap;
          flex-shrink: 0;
        }
        .logo {
          font-size: 1rem;
          font-weight: 700;
          margin: 0;
          color: white;
          white-space: nowrap;
        }
        .logo-sub {
          font-weight: 300;
          opacity: 0.7;
        }
        .header-right {
          display: flex;
          align-items: center;
          gap: 1rem;
          flex-shrink: 0;
        }

        /* Network status pill */
        .net-status {
          display: flex;
          align-items: center;
          gap: 0.35rem;
          font-size: 0.65rem;
          font-weight: 700;
          padding: 0.25rem 0.65rem;
          border-radius: 999px;
          background: rgba(255,255,255,0.1);
          border: 1px solid rgba(255,255,255,0.2);
        }
        .net-status.online { color: #86efac; }
        .net-status.offline { color: #fca5a5; }
        .net-dot {
          width: 5px; height: 5px;
          border-radius: 50%;
          background: currentColor;
          display: inline-block;
        }

        /* Toggle switch */
        .toggle {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          cursor: pointer;
        }
        .toggle input { display: none; }
        .toggle-track {
          width: 30px; height: 16px;
          background: rgba(255,255,255,0.2);
          border-radius: 999px;
          position: relative;
          transition: background 0.2s;
        }
        .toggle input:checked ~ .toggle-track { background: #ef4444; }
        .toggle-thumb {
          position: absolute;
          top: 2px; left: 2px;
          width: 12px; height: 12px;
          background: white;
          border-radius: 50%;
          transition: left 0.2s;
        }
        .toggle input:checked ~ .toggle-track .toggle-thumb { left: 16px; }
        .toggle-label { font-size: 0.65rem; color: rgba(255,255,255,0.8); white-space: nowrap; }

        /* Role navigation links */
        /* Role Dropdown */
        .role-selector {
          background: rgba(0,0,0,0.25);
          padding: 0.2rem;
          border-radius: 6px;
          display: flex;
        }
        .role-dropdown {
          background: transparent;
          color: white;
          font-family: inherit;
          font-size: 0.7rem;
          font-weight: 600;
          border: none;
          outline: none;
          padding: 0.2rem 0.4rem;
          cursor: pointer;
        }
        .role-dropdown option {
          background: #14532d;
          color: white;
        }

        /* ── BODY ── */
        .app-body {
          flex: 1;
          display: flex;
          flex-direction: column;
        }

        .section-label {
          font-size: 0.6rem;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: #6b7280;
          margin-bottom: 0.5rem;
        }

        /* ── NODE A VIEW ── */
        .view-nodeA {
          display: flex;
          flex-direction: column;
          height: 100%;
          overflow: hidden;
        }
        .pipe-row {
          padding: 0.75rem 1rem 0.5rem;
          flex-shrink: 0;
          background: white;
          border-bottom: 1px solid #e5e7eb;
        }
        .main-col {
          display: flex;
          flex-direction: column;
          flex: 1;
        }
        .panel-main {
          padding: 1rem;
        }
        .panel-audit {
          padding: 1rem;
          border-top: 1px solid #e5e7eb;
          background: #fafafa;
        }

        /* ── NODE B VIEW ── */
        .view-nodeB {
          display: flex;
          flex-direction: column;
          flex: 1;
        }

        /* ── CENTRAL VIEW ── */
        .view-central {
          display: flex;
          flex-direction: column;
          flex: 1;
        }
        .central-grid {
          flex: 1;
          padding: 1rem;
        }

        /* Responsive for narrow windows */
        @media (max-width: 750px) {
          .logo-sub { display: none; }
        }
      `}</style>
    </div>
  );
}
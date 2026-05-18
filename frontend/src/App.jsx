import React, { useState, useCallback } from "react";
import { requestPipeline1, requestPipeline2, requestPipeline3 } from "./api/pipeline";
import { usePipelineEvents } from "./hooks/usePipelineEvents";
import { useAuditTrail } from "./hooks/useAuditTrail";

import PipelineVisualizer from "./components/pipeline/PipelineVisualizer";
import NodeAPortal from "./components/nodes/NodeAPortal";
import SidebarAudit from "./components/layout/SidebarAudit";

const FILTERS_INITIAL = { 1: "idle", 2: "idle", 3: "idle", 4: "idle" };

const MOCK_PATIENTS = [
  { id: "DZ-2019-00442", name: "Benali Amine", dob: "15/05/1990", location: "Tizi Ouzou", token: "MOCK_TRUSTED_TOKEN_CHNA", consent: "Valide" },
  { id: "DZ-2022-09811", name: "Kacimi Meriem", dob: "24/08/1995", location: "Alger", token: "MOCK_NO_CONSENT", consent: "Manquant" },
  { id: "DZ-2017-00329", name: "Dahmani Salim", dob: "03/11/1982", location: "Oran", token: "MOCK_REVOKED_CONSENT", consent: "Révoqué" }
];

export default function App() {
  const [filterStates, setFilterStates] = useState(FILTERS_INITIAL);
  const [isP2PActive, setIsP2PActive] = useState(false);
  const [nodeBData, setNodeBData] = useState({ step: "idle", raw: null, fhir: null });
  const [receivedDoc, setReceivedDoc] = useState(null);
  const [isOffline, setIsOffline] = useState(false);

  // Patient Selection States
  const [selectedPatient, setSelectedPatient] = useState(MOCK_PATIENTS[0]);
  const [patientSearch, setPatientSearch] = useState("");

  // Smart LRU Cache State (max 10 elements)
  const [smartCache, setSmartCache] = useState([]);

  const { auditEntries, addAuditEntry } = useAuditTrail();

  // Smart Cache Helper functions
  const getFromCache = useCallback((key) => {
    const item = smartCache.find(x => x.key === key);
    return item ? item.value : null;
  }, [smartCache]);

  const saveToCache = useCallback((key, value) => {
    setSmartCache(prev => {
      // Evict old key if it exists
      const filtered = prev.filter(x => x.key !== key);
      const next = [...filtered, { key, value }];
      // Keep only last 10
      if (next.length > 10) {
        next.shift();
      }
      return next;
    });
  }, []);

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
        noeud: "Système",
        filterId: event.filterId,
        action: `ERREUR Filtre ${event.filterId} : ${event.payload || "Pipeline bloqué."}`
      });
    }
  }, [addAuditEntry]);

  usePipelineEvents(handleFilterUpdate);

  const handleFullWorkflow = async (sectionMeta) => {
    setIsP2PActive(true);
    setFilterStates(FILTERS_INITIAL);
    setReceivedDoc(null);
    setNodeBData({ step: "idle", raw: null, fhir: null });

    const cacheKey = `${selectedPatient.id}_${sectionMeta.type}`;

    // Handle Network Offline Caching and Resilience
    if (isOffline) {
      const cached = getFromCache(cacheKey);
      if (cached) {
        // Load from smart cache successfully
        // Sequence visualizer for Filters manually: Filter 3 active, then done
        setFilterStates({ 1: "ignored", 2: "ignored", 3: "active", 4: "ignored" });
        await new Promise(r => setTimeout(r, 800));
        setFilterStates({ 1: "ignored", 2: "ignored", 3: "done", 4: "ignored" });

        setReceivedDoc({
          ...cached,
          isFromCache: true
        });

        addAuditEntry({
          timestamp: new Date().toISOString(),
          noeud: "Nœud A (Smart Cache)",
          filterId: 3,
          action: `HORS-LIGNE : Lecture réussie depuis le cache local pour ${selectedPatient.name} [${sectionMeta.label}].`
        });
        setIsP2PActive(false);
        return;
      } else {
        // Network offline & not found in cache local
        setReceivedDoc({
          display: sectionMeta.label,
          sourceNode: sectionMeta.nodeId,
          effectiveDateTime: new Date().toISOString(),
          conclusion: "CONTENU INDISPONIBLE : Échec d'accès réseau (Serveur détenteur hors-ligne) et la donnée demandée n'est pas présente en cache local.",
          isGhost: true
        });
        
        // Mark all filters as error
        setFilterStates({ 1: "error", 2: "error", 3: "error", 4: "error" });
        
        addAuditEntry({
          timestamp: new Date().toISOString(),
          noeud: "Nœud A (Smart Cache)",
          filterId: 3,
          action: `ÉCHEC : Réseau déconnecté et document [${sectionMeta.label}] absent du cache local pour ${selectedPatient.name}.`
        });
        
        setIsP2PActive(false);
        return;
      }
    }

    try {
      // 1. Trigger Pipeline 1: Node A sends request
      const p1Res = await requestPipeline1({
        patientId: selectedPatient.id,
        token: selectedPatient.token,
        section: sectionMeta.type,
        targetNode: sectionMeta.nodeId
      });

      if (isOffline) {
        throw new Error("NETWORK_TIMEOUT: Nœud B injoignable");
      }

      // 2. Trigger Pipeline 2: Node B extracts local SIH and translates to FHIR
      const p2Res = await requestPipeline2(p1Res.data);
      
      // 3. Trigger Pipeline 3: Node A receives and persists the document
      const p3Res = await requestPipeline3(p2Res.data);

      setReceivedDoc(p3Res.data);
      setNodeBData(prev => ({ ...prev, step: "done" }));

      // Save successful response to Smart Cache
      saveToCache(cacheKey, p3Res.data);

    } catch (err) {
      console.error(err);
      let errorMsg = err.response?.data?.error || err.message;
      
      // Update filters to show error on whatever was active/idle
      setFilterStates(prev => {
        const failed = {};
        Object.keys(prev).forEach(k => {
          if (prev[k] === "active" || prev[k] === "idle") failed[k] = "error";
        });
        return { ...prev, ...failed };
      });

      addAuditEntry({
        timestamp: new Date().toISOString(),
        noeud: "Système",
        filterId: 2,
        action: `TRANSACTION REJETÉE : ${errorMsg}`
      });
    } finally {
      setIsP2PActive(false);
    }
  };

  // Change active patient handler
  const handleSelectPatient = (patient) => {
    setSelectedPatient(patient);
    setReceivedDoc(null);
    setFilterStates(FILTERS_INITIAL);
    setNodeBData({ step: "idle", raw: null, fhir: null });
  };

  return (
    <div className="app">
      {/* ── HEADER ── */}
      <header className="app-header">
        <div className="header-left">
          <h1 className="logo">
            CHNA <span className="logo-sub">— Portail Médecin (Nœud A)</span>
          </h1>
        </div>

        <div className="header-right">
          <div className={`net-status ${isOffline ? "offline" : "online"}`}>
            <span className="net-dot" />
            {isOffline ? "Réseau Coupé" : "mTLS Actif"}
          </div>

          <label className="toggle">
            <input type="checkbox" checked={isOffline} onChange={() => setIsOffline(v => !v)} />
            <span className="toggle-track">
              <span className="toggle-thumb" />
            </span>
            <span className="toggle-label">Couper réseau</span>
          </label>
        </div>
      </header>

      {/* ── BODY ── */}
      <div className="app-body">
        <div className="pipe-row">
          <div className="section-label">Pipeline Pipe & Filter P2P (Temps Réel)</div>
          <PipelineVisualizer filterStates={filterStates} compact />
        </div>

        {/* Unified Doctor Dashboard Grid with Audit Trail showing all P2P events */}
        <div className="dashboard-grid">
          <main className="dashboard-main">
            <NodeAPortal
              selectedPatient={selectedPatient}
              setSelectedPatient={handleSelectPatient}
              onDownload={handleFullWorkflow}
              document={receivedDoc}
              isLoading={isP2PActive}
              patientSearch={patientSearch}
              setPatientSearch={setPatientSearch}
              nodeBData={nodeBData}
              smartCache={smartCache}
            />
          </main>

          <aside className="dashboard-sidebar">
            <SidebarAudit entries={auditEntries} />
          </aside>
        </div>
      </div>

      <style>{`
        *, *::before, *::after { box-sizing: border-box; }
        
        .app {
          height: 100vh;
          display: flex;
          flex-direction: column;
          background: #f3f4f6;
          font-family: 'Inter', sans-serif;
          overflow: hidden;
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
        .logo {
          font-size: 1.15rem;
          font-weight: 800;
          margin: 0;
          color: white;
          white-space: nowrap;
          letter-spacing: -0.02em;
        }
        .logo-sub {
          font-size: 0.8rem;
          font-weight: 400;
          opacity: 0.85;
          margin-left: 0.4rem;
        }
        .header-right {
          display: flex;
          align-items: center;
          gap: 1.25rem;
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

        /* ── BODY ── */
        .app-body {
          flex: 1;
          display: flex;
          flex-direction: column;
          min-height: 0;
          overflow: hidden;
        }

        .pipe-row {
          padding: 0.75rem 1.25rem 0.5rem;
          flex-shrink: 0;
          background: white;
          border-bottom: 1px solid #e5e7eb;
        }

        .section-label {
          font-size: 0.62rem;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: #6b7280;
          margin-bottom: 0.5rem;
        }

        /* Dashboard Grid layout split */
        .dashboard-grid {
          display: flex;
          flex: 1;
          min-height: 0;
        }

        .dashboard-main {
          flex: 1;
          padding: 1.25rem;
          min-height: 0;
          overflow-y: auto;
        }

        .dashboard-sidebar {
          width: 320px;
          border-left: 1px solid #e5e7eb;
          background: #fafafa;
          flex-shrink: 0;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        /* Responsive */
        @media (max-width: 950px) {
          .dashboard-grid {
            flex-direction: column;
          }
          .dashboard-sidebar {
            width: 100%;
            height: 300px;
            border-left: none;
            border-top: 1px solid #e5e7eb;
          }
        }
      `}</style>
    </div>
  );
}
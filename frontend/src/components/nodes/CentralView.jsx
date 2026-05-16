import React from 'react';

/**
 * CentralView — "Architecte" role.
 * Shows a side-by-side summary of Node A status, Node B ACL output, and the full audit trail.
 */
export default function CentralView({ filterStates, auditEntries, isOffline, isP2PActive, nodeBData }) {
  const activeFilters = Object.values(filterStates).filter(s => s === "active").length;
  const doneFilters = Object.values(filterStates).filter(s => s === "done").length;
  const ignoredFilters = Object.values(filterStates).filter(s => s === "ignored").length;

  return (
    <div className="central-view">
      {/* Top row: 3 status cards */}
      <div className="stats-row">
        <div className="stat-card">
          <div className="stat-icon stat-icon--a">A</div>
          <div>
            <div className="stat-label">Noeud A</div>
            <div className="stat-value">{isP2PActive ? "Requête en cours..." : "En attente"}</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon stat-icon--pipe">{doneFilters}/4</div>
          <div>
            <div className="stat-label">Filtres complétés</div>
            <div className="stat-value">{ignoredFilters} ignorés · {activeFilters} actifs</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon stat-icon--b">B</div>
          <div>
            <div className="stat-label">Noeud B</div>
            <div className="stat-value">
              {nodeBData.step === "idle" && "En attente"}
              {nodeBData.step === "extracting" && "Extraction SIH..."}
              {nodeBData.step === "converting" && "Traduction FHIR..."}
              {nodeBData.step === "done" && "Réponse envoyée"}
            </div>
          </div>
        </div>
        <div className={`stat-card ${isOffline ? "stat-card--error" : ""}`}>
          <div className={`stat-icon ${isOffline ? "stat-icon--error" : "stat-icon--ok"}`}>
            {isOffline ? "!" : "OK"}
          </div>
          <div>
            <div className="stat-label">Réseau mTLS</div>
            <div className="stat-value">{isOffline ? "Coupé — Mode Dégradé" : "Actif"}</div>
          </div>
        </div>
      </div>

      {/* Bottom row: ACL diff + Audit trail */}
      <div className="bottom-col">
        {/* ACL Output */}
        <div className="acl-panel">
          <div className="panel-title">Anti-Corruption Layer — Transformation FHIR</div>
          <div className="acl-grid">
            <div className="code-col">
              <div className="code-label code-label--raw">Données Brutes SIH</div>
              <div className="code-box code-box--dark">
                {nodeBData.raw
                  ? <pre className="code-pre code-pre--raw">{JSON.stringify(nodeBData.raw, null, 2)}</pre>
                  : <div className="code-empty">En attente de lecture SIH...</div>
                }
              </div>
            </div>
            <div className="acl-arrow">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
              <span>ACL</span>
            </div>
            <div className="code-col">
              <div className="code-label code-label--fhir">FHIR R4 Standard</div>
              <div className="code-box code-box--dark">
                {nodeBData.fhir
                  ? <pre className="code-pre code-pre--fhir">{JSON.stringify(nodeBData.fhir, null, 2)}</pre>
                  : <div className="code-empty">En attente de transformation...</div>
                }
              </div>
            </div>
          </div>
        </div>

        {/* Audit trail */}
        <div className="audit-panel">
          <div className="panel-title">Audit Trail — Temps Réel</div>
          <div className="audit-list">
            {auditEntries.length === 0
              ? <div className="audit-empty">Aucun événement</div>
              : auditEntries.map((e, i) => (
                <div key={i} className="audit-item fade-in">
                  <div className="audit-meta">
                    <span className="audit-node">{e.noeud}</span>
                    <span className="audit-time">{formatTime(e.timestamp)}</span>
                  </div>
                  <div className="audit-row">
                    <div className={`audit-bar filter-${e.filterId}`} />
                    <p className="audit-text">{e.action}</p>
                  </div>
                </div>
              ))
            }
          </div>
        </div>
      </div>

      <style>{`
        .central-view {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        /* stats */
        .stats-row {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 0.75rem;
        }
        .stat-card {
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 10px;
          padding: 0.75rem 1rem;
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }
        .stat-card--error {
          border-color: #fca5a5;
          background: #fff1f2;
        }
        .stat-icon {
          width: 36px; height: 36px;
          border-radius: 8px;
          font-size: 0.8rem;
          font-weight: 800;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }
        .stat-icon--a { background: #dbeafe; color: #1d4ed8; }
        .stat-icon--b { background: #fef3c7; color: #b45309; }
        .stat-icon--pipe { background: #d1fae5; color: #065f46; }
        .stat-icon--ok { background: #d1fae5; color: #065f46; }
        .stat-icon--error { background: #fee2e2; color: #dc2626; }
        .stat-label { font-size: 0.65rem; color: #6b7280; font-weight: 600; text-transform: uppercase; letter-spacing: 0.04em; }
        .stat-value { font-size: 0.8rem; font-weight: 600; color: #111827; margin-top: 0.1rem; }

        /* bottom */
        .bottom-col {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        /* ACL */
        .acl-panel, .audit-panel {
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 10px;
          padding: 0.75rem;
          display: flex;
          flex-direction: column;
        }
        .panel-title {
          font-size: 0.7rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: #374151;
          margin-bottom: 0.75rem;
          flex-shrink: 0;
        }
        .acl-grid {
          display: grid;
          grid-template-columns: 1fr auto 1fr;
          gap: 0.5rem;
          flex: 1;
        }
        .code-col {
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
        }
        .code-label {
          font-size: 0.6rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          flex-shrink: 0;
        }
        .code-label--raw { color: #ef4444; }
        .code-label--fhir { color: #22c55e; }
        .code-box {
          flex: 1;
          border-radius: 6px;
          padding: 0.75rem;
          overflow-x: auto;
        }
        .code-box--dark { background: #0d1117; border: 1px solid #30363d; }
        .code-pre { margin: 0; font-family: 'JetBrains Mono', monospace; font-size: 0.65rem; line-height: 1.5; }
        .code-pre--raw { color: #ff7b72; }
        .code-pre--fhir { color: #7ee787; }
        .code-empty {
          display: flex; align-items: center; justify-content: center;
          height: 100%;
          color: #484f58;
          font-size: 0.75rem;
          font-style: italic;
        }
        .acl-arrow {
          display: flex; flex-direction: column; align-items: center; justify-content: center;
          gap: 0.25rem;
          color: #6b7280;
          flex-shrink: 0;
        }
        .acl-arrow span { font-size: 0.55rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; }

        /* Audit */
        .audit-list {
          display: flex; flex-direction: column; gap: 0.4rem;
        }
        .audit-item {
          padding: 0.5rem;
          background: #f9fafb;
          border: 1px solid #e5e7eb;
          border-radius: 6px;
        }
        .audit-meta {
          display: flex; justify-content: space-between;
          margin-bottom: 0.25rem;
        }
        .audit-node { font-size: 0.6rem; font-weight: 700; color: #166534; }
        .audit-time { font-size: 0.55rem; color: #9ca3af; }
        .audit-row { display: flex; gap: 0.4rem; }
        .audit-bar { width: 3px; border-radius: 2px; flex-shrink: 0; }
        .filter-1 { background: #8b5cf6; }
        .filter-2 { background: #ca8a04; }
        .filter-3 { background: #16a34a; }
        .filter-4 { background: #d97706; }
        .audit-text { font-size: 0.65rem; line-height: 1.3; color: #4b5563; margin: 0; }
        .audit-empty { text-align: center; padding: 2rem; color: #9ca3af; font-size: 0.75rem; }

        .fade-in { animation: fadeIn 0.3s ease; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: none; } }

        @media (max-width: 900px) {
          .stats-row { grid-template-columns: repeat(2, 1fr); }
        }
      `}</style>
    </div>
  );
}

function formatTime(ts) {
  if (!ts) return '';
  return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

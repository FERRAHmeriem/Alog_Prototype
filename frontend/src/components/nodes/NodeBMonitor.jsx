import React from 'react';

export default function NodeBMonitor({ data, isActive }) {
  const idle = !isActive && data.step === "idle";

  return (
    <div className="node-b">
      {idle ? (
        <div className="idle-state">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" opacity="0.3">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
          <p>En attente d'une requête P2P de Nœud A...</p>
        </div>
      ) : (
        <div className="monitor-layout fade-in">
          <div className="monitor-header">
            <div className="monitor-title">Anti-Corruption Layer (Filtre ①)</div>
            <div className="monitor-subtitle">Transformation SIH propriétaire → HL7 FHIR R4</div>
          </div>

          <div className="acl-panels">
            {/* Raw SIH */}
            <div className="code-panel">
              <div className="code-panel-header">
                <span className="code-dot code-dot--raw" />
                <span className="code-panel-label">Données Brutes SIH</span>
                <span className="code-badge">Lecture seule</span>
              </div>
              <div className="code-scroll">
                {data.raw
                  ? <pre className="code raw">{JSON.stringify(data.raw, null, 2)}</pre>
                  : <div className="code-waiting">{data.step === "extracting" ? "Extraction en cours..." : "En attente lecture SIH..."}</div>
                }
              </div>
            </div>

            {/* Arrow */}
            <div className="transform-arrow">
              <div className={`arrow-icon ${data.step === "converting" ? "arrow-icon--active" : ""}`}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </div>
              <span className="arrow-label">ACL<br/>Filtre ①</span>
            </div>

            {/* FHIR */}
            <div className="code-panel">
              <div className="code-panel-header">
                <span className="code-dot code-dot--fhir" />
                <span className="code-panel-label">Ressource FHIR R4</span>
                <span className="code-badge code-badge--ok">Standardisé</span>
              </div>
              <div className="code-scroll">
                {data.fhir
                  ? <pre className="code fhir">{JSON.stringify(data.fhir, null, 2)}</pre>
                  : <div className="code-waiting">{data.step === "converting" ? "Traduction FHIR..." : "En attente transformation..."}</div>
                }
              </div>
            </div>
          </div>

          {data.step === "done" && (
            <div className="done-banner fade-in">
              Transmission P2P réussie — Données envoyées au Nœud A
            </div>
          )}
        </div>
      )}

      <style>{`
        .node-b { height: 100%; display: flex; flex-direction: column; }

        .idle-state {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 1rem;
          color: #9ca3af;
          text-align: center;
        }
        .idle-state p { font-size: 0.85rem; max-width: 280px; }

        .monitor-layout {
          display: flex;
          flex-direction: column;
          height: 100%;
          gap: 0.75rem;
        }
        .monitor-header {
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          padding: 0.6rem 0.9rem;
          flex-shrink: 0;
        }
        .monitor-title { font-size: 0.85rem; font-weight: 700; color: #111827; }
        .monitor-subtitle { font-size: 0.65rem; color: #6b7280; margin-top: 0.1rem; }

        .acl-panels {
          display: grid;
          grid-template-columns: 1fr auto 1fr;
          gap: 0.5rem;
          flex: 1;
          min-height: 0;
          overflow: hidden;
        }

        .code-panel {
          background: #0d1117;
          border: 1px solid #30363d;
          border-radius: 8px;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }
        .code-panel-header {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          padding: 0.5rem 0.75rem;
          border-bottom: 1px solid #21262d;
          flex-shrink: 0;
        }
        .code-dot {
          width: 8px; height: 8px;
          border-radius: 50%;
          flex-shrink: 0;
        }
        .code-dot--raw { background: #ef4444; }
        .code-dot--fhir { background: #22c55e; }
        .code-panel-label {
          font-size: 0.62rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: #8b949e;
          flex: 1;
        }
        .code-badge {
          font-size: 0.55rem;
          padding: 0.1rem 0.4rem;
          border-radius: 3px;
          background: #21262d;
          color: #8b949e;
        }
        .code-badge--ok { background: rgba(34,197,94,0.1); color: #22c55e; }
        .code-scroll {
          flex: 1;
          overflow: auto;
          padding: 0.75rem;
        }
        .code {
          margin: 0;
          font-family: 'JetBrains Mono', 'Fira Code', monospace;
          font-size: 0.68rem;
          line-height: 1.5;
        }
        .code.raw { color: #ff7b72; }
        .code.fhir { color: #7ee787; }
        .code-waiting {
          display: flex; align-items: center; justify-content: center;
          height: 100%;
          color: #484f58;
          font-size: 0.75rem;
          font-style: italic;
        }

        .transform-arrow {
          display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          gap: 0.4rem;
          padding: 0 0.25rem;
        }
        .arrow-icon { color: #4b5563; transition: color 0.3s; }
        .arrow-icon--active {
          color: #166534;
          animation: arrowPulse 1s ease infinite;
        }
        @keyframes arrowPulse {
          0%,100% { transform: translateX(0); opacity: 1; }
          50% { transform: translateX(4px); opacity: 0.6; }
        }
        .arrow-label {
          font-size: 0.55rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: #6b7280;
          text-align: center;
        }

        .done-banner {
          background: #f0fdf4;
          border: 1px solid #bbf7d0;
          border-radius: 8px;
          padding: 0.6rem 1rem;
          font-size: 0.75rem;
          font-weight: 600;
          color: #166534;
          text-align: center;
          flex-shrink: 0;
        }

        .fade-in { animation: fadeIn 0.3s ease; }
        @keyframes fadeIn { from { opacity:0; transform: translateY(6px); } to { opacity:1; transform: none; } }
      `}</style>
    </div>
  );
}

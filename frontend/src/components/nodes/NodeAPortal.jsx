import React from 'react';

const MOCK_PATIENT = {
  id: "DZ-2019-00442",
  name: "Benali Amine",
  dob: "15/05/1990",
  location: "Tizi Ouzou"
};

const SECTIONS = [
  { id: 'rad', label: 'Imagerie Médicale', type: 'RAD_REPORTS', nodeId: 'CHU_TIZI_OUZOU' },
  { id: 'bio', label: 'Biologie', type: 'LAB_RESULTS', nodeId: 'CHU_BAB_EL_OUED' },
];

export default function NodeAPortal({ onDownload, document, isLoading }) {
  return (
    <div className="node-a">
      <div className="portal-grid">
        {/* Patient Card */}
        <div className="patient-panel">
          <div className="panel-header">Profil Patient</div>
          <div className="patient-card">
            <div className="avatar">{MOCK_PATIENT.name[0]}</div>
            <div>
              <div className="patient-name">{MOCK_PATIENT.name}</div>
              <div className="patient-id">{MOCK_PATIENT.id}</div>
              <div className="patient-meta">Né {MOCK_PATIENT.dob} · {MOCK_PATIENT.location}</div>
            </div>
          </div>

          <div className="actions-header">Actions P2P</div>
          <div className="actions-list">
            {SECTIONS.map(s => (
              <button
                key={s.id}
                className={`action-btn ${isLoading ? "loading" : ""}`}
                onClick={() => !isLoading && onDownload(s)}
                disabled={isLoading}
              >
                <span className="btn-icon">→</span>
                <div>
                  <div className="btn-label">Consulter {s.label}</div>
                  <div className="btn-node">{s.nodeId}</div>
                </div>
                {isLoading && <span className="btn-spinner" />}
              </button>
            ))}
          </div>
        </div>

        {/* Timeline */}
        <div className="timeline-panel">
          <div className="panel-header">Timeline Médicale</div>
          <div className="timeline">
            {document ? (
              <div className={`tl-item fade-in ${document.isGhost ? "tl-item--ghost" : "tl-item--ok"}`}>
                <div className="tl-dot" />
                <div className="tl-content">
                  <div className="tl-header">
                    <span className="tl-type">{document.display}</span>
                    <span className="tl-date">{formatDate(document.effectiveDateTime)}</span>
                  </div>
                  <div className="tl-source">Source : {document.sourceNode}</div>
                  <div className="tl-body">{document.conclusion}</div>
                  <div className="tl-tags">
                    {document.isGhost ? (
                      <span className="tag tag--error">Mode Dégradé — Indisponible</span>
                    ) : (
                      <>
                        <span className="tag">FHIR R4</span>
                        <span className="tag tag--ok">Persisté (Smart Fetching)</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="tl-empty">
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" opacity="0.25">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                <p>Aucun document récupéré</p>
                <p className="tl-hint">Cliquez une action pour déclencher le pipeline P2P</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        .node-a { height: 100%; }

        .portal-grid {
          display: grid;
          grid-template-columns: 260px 1fr;
          gap: 1rem;
          height: 100%;
        }

        .patient-panel, .timeline-panel {
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 10px;
          padding: 1rem;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        .panel-header {
          font-size: 0.65rem;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.07em;
          color: #6b7280;
          margin-bottom: 0.75rem;
        }

        .patient-card {
          display: flex;
          gap: 0.75rem;
          align-items: center;
          margin-bottom: 1.25rem;
          padding-bottom: 1rem;
          border-bottom: 1px solid #e5e7eb;
        }
        .avatar {
          width: 44px; height: 44px;
          background: #166534;
          color: white;
          border-radius: 10px;
          display: flex; align-items: center; justify-content: center;
          font-size: 1.25rem;
          font-weight: 700;
          flex-shrink: 0;
        }
        .patient-name { font-size: 0.95rem; font-weight: 700; color: #111827; }
        .patient-id { font-size: 0.7rem; color: #166534; font-family: monospace; margin: 0.1rem 0; }
        .patient-meta { font-size: 0.65rem; color: #9ca3af; }

        .actions-header {
          font-size: 0.6rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          color: #9ca3af;
          margin-bottom: 0.5rem;
        }
        .actions-list { display: flex; flex-direction: column; gap: 0.5rem; }
        .action-btn {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          width: 100%;
          padding: 0.65rem 0.75rem;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          background: #f9fafb;
          cursor: pointer;
          text-align: left;
          transition: all 0.15s;
          position: relative;
        }
        .action-btn:hover:not(:disabled) {
          border-color: #166534;
          background: #f0fdf4;
        }
        .action-btn:disabled { opacity: 0.7; cursor: not-allowed; }
        .btn-icon { font-size: 1rem; color: #166534; flex-shrink: 0; }
        .btn-label { font-size: 0.8rem; font-weight: 600; color: #111827; }
        .btn-node { font-size: 0.6rem; color: #9ca3af; margin-top: 0.1rem; }
        .btn-spinner {
          position: absolute; right: 0.75rem;
          width: 14px; height: 14px;
          border: 2px solid #e5e7eb;
          border-top-color: #166534;
          border-radius: 50%;
          animation: spin 0.6s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        /* Timeline */
        .timeline-panel { overflow-y: auto; }
        .timeline { position: relative; padding-left: 1.25rem; }
        .timeline::before {
          content: '';
          position: absolute;
          left: 5px; top: 0; bottom: 0;
          width: 2px;
          background: #e5e7eb;
        }
        .tl-item { position: relative; padding-bottom: 1.5rem; }
        .tl-dot {
          position: absolute;
          left: -1.25rem; top: 0.35rem;
          width: 10px; height: 10px;
          border-radius: 50%;
          background: #16a34a;
          border: 2px solid white;
          box-shadow: 0 0 0 2px #16a34a;
        }
        .tl-item--ghost .tl-dot {
          background: #ef4444;
          box-shadow: 0 0 0 2px #ef4444;
          animation: gpulse 2s infinite;
        }
        @keyframes gpulse { 0%,100% { opacity:1; } 50% { opacity:0.4; } }

        .tl-content {
          background: #f9fafb;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          padding: 1rem;
        }
        .tl-header { display: flex; justify-content: space-between; margin-bottom: 0.3rem; }
        .tl-type { font-size: 0.85rem; font-weight: 700; color: #111827; }
        .tl-date { font-size: 0.65rem; color: #9ca3af; }
        .tl-source { font-size: 0.7rem; color: #166534; font-weight: 600; margin-bottom: 0.5rem; }
        .tl-body { font-size: 0.8rem; line-height: 1.5; color: #4b5563; margin-bottom: 0.75rem; }
        .tl-tags { display: flex; gap: 0.4rem; flex-wrap: wrap; }
        .tag {
          font-size: 0.6rem;
          padding: 0.125rem 0.4rem;
          border-radius: 4px;
          border: 1px solid #e5e7eb;
          color: #6b7280;
          background: white;
        }
        .tag--ok { background: #f0fdf4; border-color: #bbf7d0; color: #166534; }
        .tag--error { background: #fff1f2; border-color: #fecdd3; color: #dc2626; font-weight: 700; }

        .tl-empty {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 250px;
          gap: 0.5rem;
          color: #9ca3af;
          text-align: center;
        }
        .tl-empty p { font-size: 0.85rem; margin: 0; }
        .tl-hint { font-size: 0.7rem !important; font-style: italic; }

        .fade-in { animation: fadeIn 0.4s ease; }
        @keyframes fadeIn { from { opacity:0; transform: translateY(6px); } to { opacity:1; transform: none; } }

        @media (max-width: 700px) {
          .portal-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
}

function formatDate(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
}

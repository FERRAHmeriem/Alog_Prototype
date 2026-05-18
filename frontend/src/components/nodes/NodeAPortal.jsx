import React, { useState } from 'react';

const MOCK_PATIENTS = [
  { id: "DZ-2019-00442", name: "Benali Amine", dob: "15/05/1990", location: "Tizi Ouzou", token: "MOCK_TRUSTED_TOKEN_CHNA", consent: "Valide" },
  { id: "DZ-2022-09811", name: "Kacimi Meriem", dob: "24/08/1995", location: "Alger", token: "MOCK_NO_CONSENT", consent: "Manquant" },
  { id: "DZ-2017-00329", name: "Dahmani Salim", dob: "03/11/1982", location: "Oran", token: "MOCK_REVOKED_CONSENT", consent: "Révoqué" }
];

const SECTIONS = [
  { id: 'rad', label: 'Imagerie Médicale', type: 'RAD_REPORTS', nodeId: 'CHU_TIZI_OUZOU' },
  { id: 'bio', label: 'Biologie', type: 'LAB_RESULTS', nodeId: 'CHU_BAB_EL_OUED' },
];

export default function NodeAPortal({
  selectedPatient,
  setSelectedPatient,
  onDownload,
  document,
  isLoading,
  patientSearch,
  setPatientSearch,
  nodeBData,
  smartCache
}) {
  const [showAcl, setShowAcl] = useState(false);

  // Filter patients based on search input
  const filteredPatients = MOCK_PATIENTS.filter(p =>
    p.name.toLowerCase().includes(patientSearch.toLowerCase()) ||
    p.id.toLowerCase().includes(patientSearch.toLowerCase())
  );

  return (
    <div className="node-a">
      <div className="portal-grid">
        {/* Left Column: Search & Profiles */}
        <div className="patient-panel">
          <div className="panel-header">Recherche Patient</div>
          <input
            type="text"
            className="patient-search-input"
            placeholder="Nom ou N° Sécurité Sociale..."
            value={patientSearch}
            onChange={(e) => setPatientSearch(e.target.value)}
          />

          <div className="patients-list">
            {filteredPatients.map(p => {
              const isSelected = selectedPatient.id === p.id;
              const consentClass = {
                Valide: 'badge-valide',
                Manquant: 'badge-manquant',
                Révoqué: 'badge-revoque'
              }[p.consent];

              return (
                <div
                  key={p.id}
                  className={`patient-list-item ${isSelected ? 'selected' : ''}`}
                  onClick={() => {
                    setSelectedPatient(p);
                    setShowAcl(false);
                  }}
                >
                  <div className="patient-list-avatar">{p.name[0]}</div>
                  <div className="patient-list-info">
                    <div className="patient-list-name">{p.name}</div>
                    <div className="patient-list-id">{p.id}</div>
                    <span className={`consent-badge ${consentClass}`}>Consentement : {p.consent}</span>
                  </div>
                </div>
              );
            })}
            {filteredPatients.length === 0 && (
              <div className="no-patients">Aucun patient trouvé</div>
            )}
          </div>

          <div className="actions-header" style={{ marginTop: '1.25rem' }}>Actions P2P</div>
          <div className="actions-list">
            {SECTIONS.map(s => {
              const isCached = smartCache.some(x => x.key === `${selectedPatient.id}_${s.type}`);
              return (
                <button
                  key={s.id}
                  className={`action-btn ${isLoading ? "loading" : ""}`}
                  onClick={() => !isLoading && onDownload(s)}
                  disabled={isLoading}
                >
                  <span className="btn-icon">→</span>
                  <div style={{ flex: 1 }}>
                    <div className="btn-label">Consulter {s.label}</div>
                    <div className="btn-node">{s.nodeId}</div>
                  </div>
                  {isCached && <span className="cache-status-pill">En Cache</span>}
                  {isLoading && <span className="btn-spinner" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Column: Timeline & Transformation ACL */}
        <div className="timeline-panel">
          <div className="panel-header">Timeline Médicale — {selectedPatient.name}</div>
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
                  
                  <div className="tl-tags" style={{ marginBottom: '1rem' }}>
                    {document.isGhost ? (
                      <span className="tag tag--error">Mode Dégradé — Indisponible</span>
                    ) : (
                      <>
                        <span className="tag">FHIR R4</span>
                        {document.isFromCache ? (
                          <span className="tag tag--cache">Chargé depuis le Cache Local (Hors-ligne)</span>
                        ) : (
                          <span className="tag tag--ok">Persisté (Smart Fetching)</span>
                        )}
                      </>
                    )}
                  </div>

                  {/* Anti-Corruption Layer collapsible toggle */}
                  {!document.isGhost && (nodeBData?.raw || document.isFromCache) && (
                    <div className="acl-toggle-section">
                      <button
                        className="acl-toggle-btn"
                        onClick={() => setShowAcl(!showAcl)}
                      >
                        {showAcl ? '▲ Cacher les détails techniques P2P' : '▼ Voir la transformation Anti-Corruption Layer (Filtre ①)'}
                      </button>

                      {showAcl && (
                        <div className="acl-details-panel fade-in">
                          <div className="acl-details-header">
                            🔄 Visualisation de l'Interopérabilité (Pipeline 2)
                          </div>
                          
                          <div className="acl-details-grid">
                            <div className="acl-code-block">
                              <div className="acl-code-title">Données Brutes SIH local (Propriétaire)</div>
                              <pre className="code-text raw-code">
                                {JSON.stringify(nodeBData?.raw || {
                                  tableName: "RAD_REPORTS",
                                  internalId: "TIZI_RAD_88",
                                  pat_ref: "PNT-4421990-TIZ",
                                  type_code: "IRM_RACHIS_L",
                                  val_result: "OPAC_L4L5_DISC_HERN",
                                  date_exm: "12/04/2024",
                                  rad_id: "RAD_MEZIANI_07",
                                  obs_libre: "Hernie discale postéro-latérale gauche L4-L5 avec compression radiculaire L5. Rétrécissement du canal rachidien à ce niveau.",
                                  statut: "VAL"
                                }, null, 2)}
                              </pre>
                            </div>
                            
                            <div className="acl-code-block">
                              <div className="acl-code-title">Ressource Standardisée FHIR R4</div>
                              <pre className="code-text fhir-code">
                                {JSON.stringify(document, null, 2)}
                              </pre>
                            </div>
                          </div>

                          <div className="acl-mapping-info">
                            <div className="mapping-info-header">🔍 Correspondance des Filtres de Translation (Adaptation)</div>
                            <div className="mapping-rows">
                              <div className="mapping-row">
                                <span className="mapping-key-raw">SIH: <code>pat_ref</code></span>
                                <span className="mapping-arrow">➔</span>
                                <span className="mapping-key-fhir">FHIR: <code>subjectId</code> (NSS Pivot)</span>
                              </div>
                              <div className="mapping-row">
                                <span className="mapping-key-raw">SIH: <code>type_code</code></span>
                                <span className="mapping-arrow">➔</span>
                                <span className="mapping-key-fhir">FHIR: <code>code/display</code> (LOINC standardisé)</span>
                              </div>
                              <div className="mapping-row">
                                <span className="mapping-key-raw">SIH: <code>date_exm</code></span>
                                <span className="mapping-arrow">➔</span>
                                <span className="mapping-key-fhir">FHIR: <code>effectiveDateTime</code> (ISO-8601)</span>
                              </div>
                              <div className="mapping-row">
                                <span className="mapping-key-raw">SIH: <code>obs_libre</code></span>
                                <span className="mapping-arrow">➔</span>
                                <span className="mapping-key-fhir">FHIR: <code>conclusion</code> (Signé cryptographiquement)</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

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
          grid-template-columns: 300px 1fr;
          gap: 1.25rem;
          height: 100%;
        }

        .patient-panel, .timeline-panel {
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 10px;
          padding: 1.25rem;
          display: flex;
          flex-direction: column;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
        }

        .panel-header {
          font-size: 0.7rem;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: #166534;
          margin-bottom: 0.75rem;
          border-bottom: 2px solid #ca8a04;
          padding-bottom: 0.4rem;
        }

        .patient-search-input {
          width: 100%;
          padding: 0.6rem 0.75rem;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          font-size: 0.8rem;
          margin-bottom: 1rem;
          outline: none;
          transition: border-color 0.2s;
        }

        .patient-search-input:focus {
          border-color: #166534;
          box-shadow: 0 0 0 2px rgba(22, 101, 52, 0.15);
        }

        .patients-list {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          max-height: 250px;
          overflow-y: auto;
          padding-right: 2px;
        }

        .patient-list-item {
          display: flex;
          gap: 0.75rem;
          align-items: center;
          padding: 0.6rem;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .patient-list-item:hover {
          background: #f9fafb;
          border-color: #d1d5db;
        }

        .patient-list-item.selected {
          background: #f0fdf4;
          border-color: #166534;
        }

        .patient-list-avatar {
          width: 38px; height: 38px;
          background: #166534;
          color: white;
          border-radius: 8px;
          display: flex; align-items: center; justify-content: center;
          font-size: 1.1rem;
          font-weight: 700;
          flex-shrink: 0;
        }

        .patient-list-info {
          min-width: 0;
          flex: 1;
        }

        .patient-list-name {
          font-size: 0.85rem;
          font-weight: 700;
          color: #111827;
        }

        .patient-list-id {
          font-size: 0.68rem;
          color: #6b7280;
          font-family: monospace;
          margin-bottom: 0.2rem;
        }

        .consent-badge {
          display: inline-block;
          font-size: 0.6rem;
          font-weight: 700;
          padding: 0.05rem 0.35rem;
          border-radius: 4px;
        }

        .badge-valide { background: #dcfce7; color: #166534; }
        .badge-manquant { background: #fef3c7; color: #ca8a04; }
        .badge-revoque { background: #fee2e2; color: #dc2626; }

        .no-patients {
          font-size: 0.8rem;
          color: #9ca3af;
          text-align: center;
          padding: 1rem;
        }

        .actions-header {
          font-size: 0.65rem;
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

        .cache-status-pill {
          font-size: 0.55rem;
          font-weight: 700;
          background: #e0f2fe;
          color: #0369a1;
          padding: 0.1rem 0.35rem;
          border-radius: 4px;
          margin-right: 0.25rem;
        }

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
          padding: 1.25rem;
        }

        .tl-header { display: flex; justify-content: space-between; margin-bottom: 0.3rem; }
        .tl-type { font-size: 0.9rem; font-weight: 700; color: #111827; }
        .tl-date { font-size: 0.7rem; color: #9ca3af; }
        .tl-source { font-size: 0.75rem; color: #166534; font-weight: 600; margin-bottom: 0.5rem; }
        .tl-body { font-size: 0.85rem; line-height: 1.5; color: #4b5563; margin-bottom: 0.75rem; }
        .tl-tags { display: flex; gap: 0.4rem; flex-wrap: wrap; }
        
        .tag {
          font-size: 0.62rem;
          padding: 0.15rem 0.5rem;
          border-radius: 4px;
          border: 1px solid #e5e7eb;
          color: #6b7280;
          background: white;
        }
        
        .tag--ok { background: #f0fdf4; border-color: #bbf7d0; color: #166534; }
        .tag--cache { background: #e0f2fe; border-color: #bae6fd; color: #0369a1; font-weight: 600; }
        .tag--error { background: #fff1f2; border-color: #fecdd3; color: #dc2626; font-weight: 700; }

        /* ACL Section style */
        .acl-toggle-section {
          margin-top: 1rem;
          border-top: 1px dashed #d1d5db;
          padding-top: 1rem;
        }

        .acl-toggle-btn {
          background: none;
          border: none;
          color: #166534;
          font-size: 0.75rem;
          font-weight: 700;
          cursor: pointer;
          padding: 0;
          outline: none;
        }

        .acl-toggle-btn:hover {
          color: #14532d;
          text-decoration: underline;
        }

        .acl-details-panel {
          margin-top: 0.75rem;
          background: #0d1117;
          border: 1px solid #30363d;
          border-radius: 8px;
          padding: 0.75rem;
          color: #c9d1d9;
        }

        .acl-details-header {
          font-size: 0.75rem;
          font-weight: 700;
          color: #7ee787;
          margin-bottom: 0.75rem;
          border-bottom: 1px solid #21262d;
          padding-bottom: 0.4rem;
        }

        .acl-details-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0.5rem;
        }

        .acl-code-block {
          display: flex;
          flex-direction: column;
          min-width: 0;
        }

        .acl-code-title {
          font-size: 0.6rem;
          font-weight: 700;
          text-transform: uppercase;
          color: #8b949e;
          margin-bottom: 0.25rem;
        }

        .code-text {
          margin: 0;
          padding: 0.5rem;
          background: #161b22;
          border: 1px solid #30363d;
          border-radius: 6px;
          font-size: 0.65rem;
          overflow-x: auto;
          max-height: 180px;
          overflow-y: auto;
          line-height: 1.35;
        }

        .raw-code { color: #ff7b72; }
        .fhir-code { color: #7ee787; }

        .acl-mapping-info {
          margin-top: 0.75rem;
          border-top: 1px solid #21262d;
          padding-top: 0.75rem;
        }

        .mapping-info-header {
          font-size: 0.68rem;
          font-weight: 700;
          color: #8b949e;
          margin-bottom: 0.4rem;
        }

        .mapping-rows {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .mapping-row {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.65rem;
          background: #161b22;
          padding: 0.25rem 0.5rem;
          border-radius: 4px;
        }

        .mapping-key-raw { color: #ff7b72; }
        .mapping-arrow { color: #8b949e; font-weight: bold; }
        .mapping-key-fhir { color: #7ee787; }
        .mapping-row code { font-family: monospace; font-size: 0.6rem; }

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

        @media (max-width: 800px) {
          .portal-grid { grid-template-columns: 1fr; }
          .acl-details-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
}

function formatDate(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
}

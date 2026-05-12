import React, { useState } from "react";

export default function NodeAMedicalPortal({ onDownload, document, isLoading }) {
  const [indexResult, setIndexResult] = useState(null);

  const mockSearch = () => {
    // Simulation de la table des matières reçue du noyau central (Lighthouse)
    setIndexResult({
      patient: "Benali Amine",
      id: "DZ-2019-00442",
      birthDate: "14/05/1990",
      sections: [
        { 
          type: "Imagerie", 
          label: "IRM Rachis Lombaire", 
          nodeId: "CHU_TIZI_OUZOU", 
          dateExamen: "12 Avril 2024" 
        }
      ]
    });
  };

  return (
    <div style={styles.card}>
      {/* Barre de recherche */}
      <div style={styles.searchBar}>
        <input style={styles.input} placeholder="Identifiant Patient (ex: DZ-2019-00442)" />
        <button style={styles.btnSearch} onClick={mockSearch}>Rechercher dans l'Index National</button>
      </div>

      {indexResult && (
        <div style={styles.body}>
          {/* Bannière Patient */}
          <div style={styles.patientBanner}>
            <div style={styles.infoGroup}>
              <span style={styles.label}>Patient</span>
              <span style={styles.value}>{indexResult.patient}</span>
            </div>
            <div style={styles.infoGroup}>
              <span style={styles.label}>ID National</span>
              <span style={styles.value}>{indexResult.id}</span>
            </div>
            <div style={styles.infoGroup}>
              <span style={styles.label}>Date de naissance</span>
              <span style={styles.value}>{indexResult.birthDate}</span>
            </div>
          </div>

          <h4 style={styles.sectionTitle}>Documents disponibles sur le réseau</h4>
          
          <div style={styles.row}>
            <div style={styles.docInfo}>
              <div style={styles.docType}>{indexResult.sections[0].label}</div>
              <div style={styles.docSub}>
                Source: {indexResult.sections[0].nodeId} | Date: {indexResult.sections[0].dateExamen}
              </div>
            </div>
            <button 
              style={isLoading ? styles.btnLoading : styles.btnAction}
              onClick={() => onDownload(indexResult.sections[0])}
              disabled={isLoading}
            >
              {isLoading ? "Transfert en cours..." : "Consulter le contenu"}
            </button>
          </div>

          {/* Affichage du document reçu */}
          {document && (
            <div style={styles.docViewer}>
              <div style={styles.docHeader}>
                <span>Document médical reçu (Format FHIR R4)</span>
                <span style={styles.dateStamp}>Reçu le {new Date().toLocaleDateString()}</span>
              </div>
              <div style={styles.docBody}>
                <div style={styles.docRow}>
                  <span style={styles.docLabel}>Observation médicale :</span>
                  <p style={styles.docText}>{document.conclusion || "Conclusion d'examen non disponible."}</p>
                </div>
                <div style={styles.smartBadge}>
                  Donnée persistée localement (Smart Fetching)
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

const styles = {
  card: { background: "#ffffff", borderRadius: "8px", border: "1px solid #e2e8f0", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" },
  searchBar: { padding: "20px", display: "flex", gap: "12px", borderBottom: "1px solid #edf2f7" },
  input: { flex: 1, padding: "12px", borderRadius: "4px", border: "1px solid #cbd5e0", fontSize: "14px" },
  btnSearch: { background: "#2d3748", color: "#ffffff", border: "none", padding: "0 24px", borderRadius: "4px", cursor: "pointer", fontWeight: "600" },
  body: { padding: "24px" },
  patientBanner: { display: "flex", gap: "40px", padding: "16px", background: "#f8fafc", borderRadius: "6px", marginBottom: "32px", border: "1px solid #e2e8f0" },
  infoGroup: { display: "flex", flexDirection: "column", gap: "4px" },
  label: { fontSize: "11px", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px" },
  value: { fontSize: "15px", fontWeight: "600", color: "#1e293b" },
  sectionTitle: { fontSize: "13px", color: "#64748b", textTransform: "uppercase", marginBottom: "16px", fontWeight: "700" },
  row: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px", border: "1px solid #edf2f7", borderRadius: "8px", background: "#ffffff" },
  docType: { fontSize: "16px", fontWeight: "600", color: "#2d3748" },
  docSub: { fontSize: "13px", color: "#718096", marginTop: "4px" },
  btnAction: { background: "#3182ce", color: "#ffffff", border: "none", padding: "10px 20px", borderRadius: "4px", cursor: "pointer", fontWeight: "600" },
  btnLoading: { background: "#a0aec0", color: "#ffffff", border: "none", padding: "10px 20px", borderRadius: "4px", cursor: "not-allowed" },
  docViewer: { marginTop: "32px", border: "1px solid #c6f6d5", borderRadius: "8px", overflow: "hidden" },
  docHeader: { background: "#f0fff4", padding: "12px 20px", borderBottom: "1px solid #c6f6d5", display: "flex", justifyContent: "space-between", fontSize: "12px", fontWeight: "700", color: "#22543d" },
  docBody: { padding: "20px" },
  docLabel: { fontSize: "12px", color: "#718096", fontWeight: "600" },
  docText: { fontSize: "15px", color: "#1a202c", marginTop: "8px", lineHeight: "1.5" },
  smartBadge: { display: "inline-block", background: "#38a169", color: "#ffffff", fontSize: "11px", padding: "4px 12px", borderRadius: "20px", marginTop: "16px" }
};
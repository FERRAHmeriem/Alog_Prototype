import React from "react";

export default function NodeBRemoteMonitor({ data, isActive }) {
  if (!isActive && data.step === "idle") return null;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={styles.title}>Moniteur Réseau P2P</div>
        <div style={styles.nodeName}>Nœud Distant : CHU Tizi Ouzou</div>
      </div>
      
      <div style={styles.log}>
        <div style={data.step === "extracting" ? styles.dotActive : styles.dot} />
        <div style={styles.logLabel}>Lecture SIH local (Format SQL)</div>
        <div style={styles.timestamp}>{new Date().toLocaleTimeString()}</div>
        {data.raw && <pre style={styles.code}>{JSON.stringify(data.raw, null, 2)}</pre>}
      </div>

      <div style={{...styles.log, marginTop: "24px"}}>
        <div style={data.step === "converting" ? styles.dotActive : styles.dot} />
        <div style={styles.logLabel}>Traduction Anti-Corruption (FHIR R4)</div>
        <div style={styles.timestamp}>{new Date().toLocaleTimeString()}</div>
        {data.fhir && <pre style={{...styles.code, color: "#48bb78"}}>{JSON.stringify(data.fhir, null, 2)}</pre>}
      </div>

      <div style={{...styles.log, marginTop: "24px"}}>
        <div style={data.step === "done" ? styles.dotActive : styles.dot} />
        <div style={styles.logLabel}>Transmission sécurisée terminée</div>
      </div>
    </div>
  );
}

const styles = {
  container: { width: "400px", background: "#1a202c", color: "#e2e8f0", padding: "24px", borderLeft: "4px solid #3182ce" },
  header: { marginBottom: "32px", borderBottom: "1px solid #2d3748", paddingBottom: "16px" },
  title: { fontSize: "11px", color: "#718096", fontWeight: "700", textTransform: "uppercase", letterSpacing: "1px" },
  nodeName: { fontSize: "14px", color: "#edf2f7", marginTop: "4px" },
  log: { position: "relative", paddingLeft: "24px" },
  dot: { position: "absolute", left: 0, top: "6px", width: "8px", height: "8px", borderRadius: "50%", background: "#4a5568" },
  dotActive: { position: "absolute", left: 0, top: "6px", width: "8px", height: "8px", borderRadius: "50%", background: "#3182ce", boxShadow: "0 0 10px #3182ce" },
  logLabel: { fontSize: "13px", fontWeight: "600" },
  timestamp: { fontSize: "10px", color: "#718096", marginTop: "2px" },
  code: { background: "#000000", padding: "12px", borderRadius: "4px", fontSize: "11px", marginTop: "12px", border: "1px solid #2d3748", overflowX: "auto" }
};
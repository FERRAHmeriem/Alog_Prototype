import React from "react";

export default function SidebarAudit({ entries }) {
  return (
    <div style={styles.sidebar}>
      <h3 style={styles.title}>Journal d'Audit Trail</h3>
      <div style={styles.list}>
        {entries.map((e, i) => (
          <div key={i} style={styles.entry}>
            <div style={styles.time}>{new Date(e.timestamp).toLocaleTimeString()} - {new Date(e.timestamp).toLocaleDateString()}</div>
            <div style={styles.msg}>
              <span style={styles.nodeTag}>{e.noeud}</span> {e.action}
            </div>
          </div>
        ))}
        {entries.length === 0 && <div style={styles.empty}>Aucune activité réseau</div>}
      </div>
    </div>
  );
}

const styles = {
  sidebar: { width: "280px", background: "#ffffff", borderLeft: "1px solid #e2e8f0", padding: "24px" },
  title: { fontSize: "13px", color: "#1a202c", marginBottom: "20px", fontWeight: "700", textTransform: "uppercase" },
  list: { display: "flex", flexDirection: "column", gap: "12px" },
  entry: { padding: "12px", background: "#f8fafc", borderRadius: "6px", border: "1px solid #edf2f7" },
  time: { fontSize: "10px", color: "#94a3b8", marginBottom: "4px" },
  msg: { fontSize: "12px", color: "#334155", lineHeight: "1.4" },
  nodeTag: { fontWeight: "700", color: "#3182ce" },
  empty: { fontSize: "12px", color: "#94a3b8", textAlign: "center", marginTop: "20px" }
};
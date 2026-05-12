import React from 'react';
import { FILTER_META } from '../store/usePipelineStore';

export default function PipelineVisualizer({ filterStates }) {
  return (
    <div style={styles.container}>
      {Object.keys(FILTER_META).map((id) => (
        <div key={id} style={styles.filterNode}>
          <div style={{
            ...styles.indicator,
            backgroundColor: filterStates[id] === "active" ? "#2ecc71" : "#fff",
            borderColor: filterStates[id] === "active" ? "#2ecc71" : "#bdc3c7",
          }}>
            <span style={{ color: filterStates[id] === "active" ? "#fff" : "#95a5a6" }}>{id}</span>
          </div>
          <div style={styles.info}>
            <div style={styles.label}>{FILTER_META[id].label}</div>
            <div style={styles.desc}>{FILTER_META[id].description}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

const styles = {
  container: { display: "flex", gap: "20px", background: "#fff", padding: "15px", borderRadius: "8px", border: "1px solid #e1e8ed" },
  filterNode: { display: "flex", alignItems: "center", gap: "10px", flex: 1 },
  indicator: { width: "30px", height: "30px", borderRadius: "50%", border: "2px solid", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.8rem", fontWeight: "bold", transition: "all 0.3s" },
  info: { display: "flex", flexDirection: "column" },
  label: { fontSize: "0.75rem", fontWeight: "bold", color: "#2c3e50" },
  desc: { fontSize: "0.65rem", color: "#95a5a6" }
};
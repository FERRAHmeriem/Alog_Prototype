import React from 'react';
import { FILTER_META } from '../store/usePipelineStore';

export default function PipelineVisualizer({ filterStates }) {
  return (
    <div style={styles.container}>
      {Object.keys(FILTER_META).map((id) => (
        <div key={id} style={styles.item}>
          <div style={{
            ...styles.circle,
            background: filterStates[id] === "active" ? "#38a169" : "#fff",
            borderColor: filterStates[id] === "active" ? "#38a169" : "#e2e8f0"
          }}>
            <span style={{color: filterStates[id] === "active" ? "#fff" : "#a0aec0"}}>{id}</span>
          </div>
          <div style={styles.label}>{FILTER_META[id].label}</div>
        </div>
      ))}
    </div>
  );
}

const styles = {
  container: { display: "flex", justifyContent: "space-between", background: "#fff", padding: "15px", borderRadius: "10px", border: "1px solid #e2e8f0" },
  item: { textAlign: "center", flex: 1 },
  circle: { width: "30px", height: "30px", borderRadius: "50%", border: "2px solid", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 5px", transition: "0.3s", fontSize: "0.8rem", fontWeight: "bold" },
  label: { fontSize: "0.65rem", color: "#718096", fontWeight: "600" }
};
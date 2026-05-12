import React, { useState, useCallback } from "react";
import PipelineVisualizer from "./components/PipelineVisualizer";
import NodeAMedicalPortal from "./components/NodeAMedicalPortal";
import NodeBRemoteMonitor from "./components/NodeBRemoteMonitor";
import SidebarAudit from "./components/SidebarAudit";
import { usePipelineEvents } from "./hooks/usePipelineEvents";
import { useAuditTrail } from "./hooks/useAuditTrail";
import { triggerPipeline1, triggerPipeline2, triggerPipeline3 } from "./api/pipeline";

const FILTERS_INITIAL = { 1: "idle", 2: "idle", 3: "idle", 4: "idle" };

export default function App() {
  const [filterStates, setFilterStates] = useState(FILTERS_INITIAL);
  const [isP2PActive, setIsP2PActive] = useState(false);
  const [nodeBData, setNodeBData] = useState({ step: "idle", raw: null, fhir: null });
  const [receivedDoc, setReceivedDoc] = useState(null);
  
  const { auditEntries, addAuditEntry } = useAuditTrail();

  // Écouteur SSE pour les filtres
  const handleFilterUpdate = useCallback((event) => {
    setFilterStates(prev => ({ ...prev, [event.filterId]: event.status }));
    if (event.auditEntry) addAuditEntry(event.auditEntry);
  }, [addAuditEntry]);

  usePipelineEvents(handleFilterUpdate);

  // LOGIQUE SEQUENTIELLE DES 3 PIPELINES
  const handleFullWorkflow = async (sectionMeta) => {
    setIsP2PActive(true);
    setFilterStates(FILTERS_INITIAL);
    setReceivedDoc(null);
    setNodeBData({ step: "idle", raw: null, fhir: null });

    try {
      // 1. PIPELINE 1 : Préparation de la demande au Nœud A
      // On mocke le token de consentement ici
      const requestPayload = {
        patientId: "DZ-2019-00442",
        token: "MOCK_TRUSTED_TOKEN_CHNA",
        section: sectionMeta.type,
        targetNode: sectionMeta.nodeId
      };
      const p1Res = await triggerPipeline1(requestPayload);
      
      // 2. PIPELINE 2 : Traitement au Nœud B (Distant)
      // On active visuellement le moniteur de droite
      setNodeBData({ step: "extracting", raw: null, fhir: null });
      const p2Res = await triggerPipeline2(p1Res.data);
      
      // Simulation des données extraites du SIH local (Filtre 4 -> Filtre 1)
      setNodeBData({ 
        step: "converting", 
        raw: { table: "RAD_REPORTS", id: "TIZI_88", val: "OPACITY_L4_L5" },
        fhir: p2Res.data 
      });

      // 3. PIPELINE 3 : Réception et Smart Fetching au Nœud A
      const p3Res = await triggerPipeline3(p2Res.data);
      
      setReceivedDoc(p3Res.data);
      setNodeBData(prev => ({ ...prev, step: "done" }));
      
    } catch (err) {
      console.error("Erreur P2P:", err);
    } finally {
      setIsP2PActive(false);
    }
  };

  return (
    <div style={styles.appContainer}>
      <div style={styles.mainZone}>
        <header style={styles.header}>
          <h1 style={styles.logo}>CHNA <span style={{fontWeight: 300}}>| Système P2P décentralisé</span></h1>
        </header>

        <PipelineVisualizer filterStates={filterStates} />

        <NodeAMedicalPortal 
          onDownload={handleFullWorkflow} 
          document={receivedDoc}
          isLoading={isP2PActive}
        />
      </div>

      <NodeBRemoteMonitor data={nodeBData} isActive={isP2PActive || nodeBData.step === "done"} />
      <SidebarAudit entries={auditEntries} />
    </div>
  );
}

const styles = {
  appContainer: { display: "flex", height: "100vh", backgroundColor: "#f8f9fa", fontFamily: "Inter, sans-serif" },
  mainZone: { flex: 1, padding: "25px", display: "flex", flexDirection: "column", gap: "20px", overflowY: "auto" },
  header: { borderBottom: "1px solid #e2e8f0", paddingBottom: "15px" },
  logo: { fontSize: "1.2rem", color: "#1a202c", margin: 0, fontWeight: "bold" }
};
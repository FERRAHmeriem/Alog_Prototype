import { useState, useCallback } from 'react';
import { requestPipeline1, requestPipeline2, requestPipeline3 } from '../api/pipeline';
import { INITIAL_FILTERS } from '../store/usePipelineStore';

export function useWorkflow() {
  const [phase, setPhase] = useState("idle"); // idle|p1|p2|p3|done|error
  const [filterStates, setFilters] = useState(INITIAL_FILTERS);
  const [nodeBData, setNodeBData] = useState(null); // stores before/after data
  const [receivedDoc, setReceivedDoc] = useState(null);
  const [networkCut, setNetworkCut] = useState(false);

  const resetFilters = useCallback(() => {
    setFilters(INITIAL_FILTERS);
  }, []);

  const runFullWorkflow = useCallback(async (patientId) => {
    if (networkCut) {
       // if network is cut, maybe we fail at pipeline 1
    }
    
    setPhase("p1");
    resetFilters();
    setReceivedDoc(null);
    setNodeBData(null);
    
    try {
      // Pipeline 1
      const reqPayload = {
        patientId,
        token: "MOCK_TRUSTED_TOKEN_CHNA",
        section: "RAD_REPORTS",
        targetNode: "CHU_TIZI_OUZOU"
      };
      
      const reqResult = await requestPipeline1(reqPayload);
      
      if (networkCut) {
         setPhase("error");
         return; 
      }
      
      // Pipeline 2
      setPhase("p2");
      resetFilters();
      const resResult = await requestPipeline2(reqResult);
      
      // Pipeline 3
      setPhase("p3");
      resetFilters();
      const finalResult = await requestPipeline3(resResult);
      
      setReceivedDoc(finalResult);
      setPhase("done");
      resetFilters();
    } catch (e) {
      console.error(e);
      setPhase("error");
    }
  }, [networkCut, resetFilters]);

  const toggleNetwork = () => setNetworkCut(v => !v);

  return { 
    phase, 
    filterStates, 
    setFilters,
    nodeBData, 
    setNodeBData,
    receivedDoc, 
    networkCut,
    runFullWorkflow, 
    toggleNetwork 
  };
}

import { useState, useCallback } from "react";

export function useAuditTrail() {
  const [auditEntries, setAuditEntries] = useState([]);

  const addAuditEntry = useCallback((entry) => {
    setAuditEntries((prev) => [...prev, entry]); // plus ancien en haut (chronologique)
  }, []);

  return { auditEntries, addAuditEntry };
}
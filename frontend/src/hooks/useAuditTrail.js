import { useState, useCallback } from "react";

export function useAuditTrail() {
  const [auditEntries, setAuditEntries] = useState([]);

  const addAuditEntry = useCallback((entry) => {
    setAuditEntries((prev) => [entry, ...prev]); // plus récent en haut
  }, []);

  return { auditEntries, addAuditEntry };
}
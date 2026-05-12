// hooks/usePipelineEvents.js
import { useEffect } from "react";

export function usePipelineEvents(onFilterUpdate) {
  useEffect(() => {
    // EventSource = SSE natif du navigateur
    const source = new EventSource("http://localhost:8080/api/events");

    source.addEventListener("filter-update", (e) => {
      const event = JSON.parse(e.data);
      // event = { filterId: 2, status: "active", payload: {...}, timestamp: "..." }
      onFilterUpdate(event);
    });

    source.onerror = () => source.close();

    return () => source.close();   // cleanup au unmount
  }, []);
}
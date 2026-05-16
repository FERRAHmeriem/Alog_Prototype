// hooks/usePipelineEvents.js
import { useEffect, useRef } from "react";

/**
 * Subscribes to the backend SSE stream at /api/events.
 * Auto-reconnects on error or disconnect (critical for multi-window demo stability).
 */
export function usePipelineEvents(onFilterUpdate) {
  const onFilterUpdateRef = useRef(onFilterUpdate);
  onFilterUpdateRef.current = onFilterUpdate;

  useEffect(() => {
    let source;
    let retryTimeout;

    function connect() {
      source = new EventSource("http://localhost:8080/api/events");

      source.addEventListener("filter-update", (e) => {
        try {
          const event = JSON.parse(e.data);
          onFilterUpdateRef.current(event);
        } catch (err) {
          console.error("[SSE] Failed to parse event:", err);
        }
      });

      source.addEventListener("open", () => {
        console.log("[SSE] Connected to /api/events");
      });

      source.onerror = (err) => {
        console.warn("[SSE] Connection lost, reconnecting in 2s...", err);
        source.close();
        // Auto-reconnect after 2 seconds
        retryTimeout = setTimeout(connect, 2000);
      };
    }

    connect();

    return () => {
      clearTimeout(retryTimeout);
      if (source) source.close();
    };
  }, []); // run once — ref keeps callback current
}
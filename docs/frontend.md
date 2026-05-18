# Frontend Implementation — CHNA

The frontend of the CHNA system is built using **React** and **Vite**, utilizing **Vanilla CSS** to deliver a premium, responsive, dark-green themed healthcare dashboard. The interface is optimized to visualize reactive architectures and distributed data flows.

## 1. Core Stack
- **React 18**: Dynamic UI component rendering.
- **Vite**: Rapid development build tool.
- **Vanilla CSS**: Clean, premium styling optimized for exactly `100vh` viewport height to prevent page scrolling (Zero Bad UX).
- **EventSource API**: Listens to the `/api/events` Server-Sent Events stream to dynamically animate components.

---

## 2. Real-Time Synchronization (`usePipelineEvents`)
Interactivity is driven by the custom `usePipelineEvents` hook, which connects to the backend event stream.

- **Auto-Reconnect & Resilience**: The hook automatically handles connection drops (e.g. if the backend container is restarted) using an exponential backoff auto-reconnect strategy.
- **State Processing**:
  - `status`: Drives the visual progress of the 4 filters in the active tracker.
  - `data`: Captures payloads (raw SIH database structures and final standard FHIR JSONs) to populate the inline Anti-Corruption Layer translation view.
  - `audit`: Chronologically appends logs to the real-time sidebar list.

---

## 3. UI Component Architecture

The interface is structured as a **Unified 2-Column Responsive Dashboard Layout** locked to exactly `100vh` viewport height:

### `PipelineVisualizer`
Positioned at the top of the body. Sequentially renders the 4 filters. Uses active styling transitions:
*   `idle`: Silver/grey ring.
*   `active`: Pulsing green ring.
*   `done`: Solid green checked icon.
*   `ignored`: Semi-transparent greyed out (used when a pipeline step is bypassed).
*   `error`: Bright red exclamation icon.

### `NodeAPortal` (The Doctor Workstation)
The core workspace that occupies the left/middle column of the split grid. It provides:
1.  **Patient Search & List**: Allows selecting between patients (*Benali Amine*, *Kacimi Meriem*, *Dahmani Salim*). Shows their cryptographic consent state (*Valide*, *Manquant*, *Révoqué*).
2.  **P2P Actions**: Initiates requests (Imagerie Médicale or Biologie) targeting a designated node.
3.  **Medical Timeline**: Displays retrieved documents.
4.  **Collapsible Anti-Corruption Layer (ACL) translation box**: Renders directly inline under each report, demonstrating side-by-side:
    *   **Données Brutes SIH**: The proprietary hospital format extracted from the local database.
    *   **FHIR R4 Standard**: The translated standardized pivot resource.

### `SidebarAudit`
Occupies the right column of the split grid. It is the **only vertically scrollable area** in the sidebar:
*   **Chronological Order**: Displays log events from the entire P2P network starting with the oldest event at the top and appending new events at the bottom.
*   **Auto-Scroll UX**: Smoothly and automatically scrolls down to show new events as they stream in, ensuring the user always sees the latest logs without needing to scroll the whole page.

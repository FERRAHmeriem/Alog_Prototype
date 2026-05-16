# Frontend Implementation

The frontend of MediLink is built using **React** and **Vite**. Its primary goal is to provide a pedagogical, interactive visualization of the Pipe & Filter architecture.

## 1. Core Technologies
- **React 18**: UI component library.
- **Vite**: Fast build tool and development server.
- **Vanilla CSS**: Used for styling with a clean, modern, dark-green aesthetic (MediLink branding).
- **Server-Sent Events (EventSource)**: Used to receive real-time updates from the backend.

## 2. Real-Time Synchronization (`usePipelineEvents`)
The core of the frontend's interactivity lies in the custom `usePipelineEvents` hook.

### Connection & Auto-Reconnect
The hook establishes a connection to the backend's `/api/events` SSE endpoint using the browser's native `EventSource` API. 
To ensure robustness (especially during demo environments where the backend might be restarted), the hook implements an exponential backoff auto-reconnect strategy. If the connection drops, it will transparently attempt to reconnect.

### State Management
The hook listens for different event types pushed by the backend:
- `status`: Updates the state of the 4 filters (`idle`, `active`, `done`, `ignored`) in the `filterStates` object.
- `data`: Captures payloads like the raw SIH data or the translated FHIR R4 data, storing them in the `nodeBData` object for the Anti-Corruption Layer visualization.
- `audit`: Appends new log entries to the `auditEntries` array, which drives the real-time Audit Trail sidebar.
- `reset`: Clears all state to prepare for a new pipeline execution.

## 3. UI Components and Views

The UI is divided into three distinct roles, accessible via a dropdown menu in the header. All three views share the same underlying state via the `usePipelineEvents` hook, meaning they update synchronously.

### `NodeAPortal` (Node A View)
Represents the requesting doctor's interface.
- Displays a mock patient profile.
- Contains the "Consulter Imagerie Médicale" button which triggers the `POST /api/trigger` backend endpoint.
- Shows the received FHIR document once the pipeline completes.

### `NodeBMonitor` (Node B View)
Represents the hospital server holding the data. This is the most crucial view for demonstrating the Anti-Corruption Layer.
- Displays two code blocks side-by-side.
- The left block shows the **Données Brutes SIH** (the proprietary format extracted by Filter 4).
- The right block shows the **FHIR R4 Standard** (the standardized result translated by Filter 1).
- An animated arrow visually connects the two, demonstrating the translation process.

### `CentralView` (Central View)
Represents the global supervisor.
- Displays aggregate statistics (active filters, network status).
- Provides a comprehensive layout showing both the ACL transformation diff and the full Audit Trail.

### `PipelineVisualizer`
A reusable component displayed at the top of every view. It renders the 4 filters sequentially. It uses CSS transitions to animate the filters based on their current state (`active` pulses green, `done` shows a checkmark, `ignored` is grayed out).

### `SidebarAudit`
A component that renders the `auditEntries` array. It is placed at the bottom of the layout to provide maximum horizontal space for the main content. It provides a real-time, non-repudiable trace of every action occurring across the network.

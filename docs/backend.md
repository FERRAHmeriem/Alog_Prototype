# Backend Implementation — CHNA

The backend of the CHNA prototype is built using **Java Spring Boot WebFlux**. This reactive stack was selected to handle the highly concurrent, event-driven nature of P2P network transactions and to stream real-time logs to the frontend via Server-Sent Events (SSE).

## 1. Core Technologies
- **Spring Boot 3.x**: Application framework.
- **Spring WebFlux (Project Reactor)**: Provides the non-blocking, event-driven foundation using `Mono` and `Flux` publishers.
- **Server-Sent Events (SSE)**: Used to broadcast pipeline status animations and chronological audit logs to the React application in real-time.

---

## 2. Real-Time Multicasting (`FilterEventEmitter`)
Because the frontend displays a real-time visualization of the network pipeline, the backend acts as an event broadcaster using a Project Reactor `Sinks.Many` to multicast events.

- **Replay Buffer**: Configured with `Sinks.many().replay().limit(64)` to ensure that any late-connecting client immediately receives recent history, preventing missed animations.
- **Payload Types**: Emits two types of events:
  - `FilterEvent`: Tracks the current state of a filter (e.g. `idle`, `active`, `done`, `ignored`, `error`).
  - `FilterEvent (audit)`: Appends to the real-time chronological P2P logs in the sidebar.

---

## 3. Asynchronous Filter Chains
The reactive pipelines are executed asynchronously via three core services corresponding to the P2P transaction steps:

1. **`Pipeline1Service` (Nœud A Request)**: 
   Triggered by `POST /api/pipeline/1`. Prepares request, checks/signs consent, and emits logs.
2. **`Pipeline2Service` (Nœud B Process)**: 
   Triggered by `POST /api/pipeline/2`. Simulates the detainer node fetching raw proprietary records (`SihFetchFilter`), checking ECDSA signatures (`ConsentFilter`), translating to standard FHIR R4 resources (`FhirTranslatorFilter`), and writing to the audit log (`AuditFilter`).
3. **`Pipeline3Service` (Nœud A Reception)**: 
   Triggered by `POST /api/pipeline/3`. Simulates Nœud A receiving the FHIR report, verifying integrity, writing to the Smart Cache, and logging completion.

### Pedagogical Delay Injection
To make the sequential execution of filters clearly visible to observers during demonstrations, artificial delays (`Mono.delay`) are injected in the reactive chains.

---

## 4. API Endpoints (`PipelineController.java`)
Exposes the REST API and the live SSE stream:

- `POST /api/pipeline/1`: Initiates a P2P consultation request.
- `POST /api/pipeline/2`: Remotely extracts local records and translates them to FHIR.
- `POST /api/pipeline/3`: Persists the standard FHIR document inside the local Smart Cache.
- `GET /api/events`: Stream endpoint. The React app connects here to receive a continuous `Flux` of `ServerSentEvent` objects containing pipeline updates.

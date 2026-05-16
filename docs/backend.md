# Backend Implementation

The backend of MediLink is built using **Java Spring Boot WebFlux**. This reactive stack was chosen to handle the highly concurrent nature of the P2P network and to provide seamless real-time updates to the frontend via Server-Sent Events (SSE).

## 1. Core Technologies
- **Spring Boot 3.x**: Application framework.
- **Spring WebFlux (Project Reactor)**: Provides the non-blocking, event-driven foundation using `Mono` and `Flux`.
- **Server-Sent Events (SSE)**: Used to push pipeline state changes and audit logs to the frontend in real-time.

## 2. Event Broadcasting (`FilterEventEmitter`)
Because the prototype needs to display the pipeline animation simultaneously across multiple browser windows (simulating different physical nodes), the backend acts as a central event broadcaster.

The `FilterEventEmitter` uses a Reactor `Sinks.Many` to multicast events.
- **Resilience**: It is configured using `Sinks.many().replay().limit(64)` to ensure that late-connecting clients or re-connecting clients immediately receive the recent event history, preventing missed animations.
- **Events**: It emits two types of events:
  - `FilterEvent`: Represents the status of a specific filter (e.g., `STARTING`, `DONE`, `IGNORED`).
  - `PipelineData`: Represents the actual payload moving through the pipeline (e.g., raw SIH data, transformed FHIR data).

## 3. The Filter Chain (`Pipeline2Service`)
The P2P process is orchestrated by `Pipeline2Service`, which chains the four filters together asynchronously.

The service simulates the 3 pipelines defined in the architecture:
1. **Node A Request**: Activates the `ConsentFilter` and `AuditFilter`.
2. **Node B Response**: Activates all 4 filters. It fetches mocked raw data (`SihFetchFilter`), validates consent (`ConsentFilter`), transforms the data (`FhirTranslatorFilter`), and audits the action (`AuditFilter`).
3. **Node A Reception**: Activates the `ConsentFilter` (to check integrity) and `AuditFilter` (for local Smart Fetching).

Each filter is implemented as a reactive component returning a `Mono`.

### Delay Simulation
To make the pipeline visually pedagogical, artificial delays (`Mono.delay`) are injected into the reactive chain. This allows the observer to see the sequential execution of the filters in the frontend UI.

## 4. The 4 Filters Implementation

- `SihFetchFilter.java` (Filter 4): Simulates connecting to a legacy database. Emits a `RAW_DATA` event containing the JSON payload representing the proprietary format.
- `FhirTranslatorFilter.java` (Filter 1): Acts as the Anti-Corruption Layer. It receives the raw data and transforms it into a standard FHIR R4 `DiagnosticReport`. Emits a `FHIR_DATA` event.
- `ConsentFilter.java` (Filter 2): Simulates ECDSA cryptographic token validation. Emits specific audit messages regarding the token verification.
- `AuditFilter.java` (Filter 3): Acts as the generic audit and Smart Cache layer. It emits `audit` events that populate the real-time Audit Trail in the UI.

## 5. API Endpoints
The frontend interacts with the backend primarily through two endpoints exposed in `PipelineController`:

- `GET /api/events`: The SSE stream endpoint. The React application connects to this endpoint to receive a continuous `Flux` of `ServerSentEvent` objects.
- `POST /api/trigger`: The trigger endpoint. When the user clicks "Consulter Imagerie", this endpoint invokes the `Pipeline2Service` to start the reactive chain.

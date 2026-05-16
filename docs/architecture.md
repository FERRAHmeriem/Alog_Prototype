# System Architecture

The MediLink system is designed to interconnect disparate healthcare establishments (clinics, labs, hospitals) without forcing them to abandon their existing Information Systems (SIH). It achieves this through a distributed **Pipe & Filter** architecture.

## 1. Top-Level Principles

### Sovereign Data (Hybrid Data Mesh)
Data is never centralized. The Central Node only holds a "Lighthouse" index (encrypted metadata) and an address directory. Actual clinical data remains locally stored in the hospitals' databases. Data exchange happens directly from Node to Node (P2P) via mutually authenticated TLS (mTLS) tunnels.

### Zero-Knowledge Consent
A patient's consent token (ECDSA signature) is verified locally by the Node holding the data. If the token is invalid or revoked, the transfer is immediately blocked.

## 2. The Pipe & Filter Pipeline

Every node in the network implements a strict 4-filter pipeline. However, depending on the node's role during a transaction, different filters are activated. This is known as the **Dual Mode** pattern.

### The 4 Filters

1. **Filter ①: FHIR Adapter (Anti-Corruption Layer)**
   Translates proprietary SIH data into the HL7 FHIR R4 standard. This allows heterogeneous systems to communicate using a common pivot format.
2. **Filter ②: Security & Access (Consent)**
   Verifies the cryptographic consent token and checks Role-Based Access Control (RBAC). It blocks unauthorized data flows.
3. **Filter ③: Business Logic & Audit Trail**
   Generates non-repudiable audit logs for every action and manages local persistence (Smart Cache/Smart Fetching).
4. **Filter ④: SIH Interface**
   Provides read-only access to the local database of the healthcare establishment. It extracts the raw data.

## 3. Dual Mode Execution (The P2P Flow)

When Node A (Requester) requests a medical record from Node B (Holder), the pipeline behaves as follows:

### Pipeline 1: Node A (The Request)
Node A initiates the request natively in FHIR R4 format.
- **Filter 2 (Active)**: Verifies consent and attaches the cryptographic token.
- **Filter 3 (Active)**: Logs the request in the Audit Trail.
*(Filters 1 and 4 remain inactive as no local data extraction is needed).*

### Pipeline 2: Node B (The Response)
Node B receives the FHIR R4 request and must fetch the local data.
- **Filter 2 (Active)**: Verifies the attached consent token.
- **Filter 3 (Active)**: Logs the consultation in the Audit Trail.
- **Filter 4 (Active)**: Connects to the local SIH and extracts the raw proprietary data (e.g., CSV, SQL, legacy HL7).
- **Filter 1 (Active)**: Acts as the Anti-Corruption Layer, translating the raw data into FHIR R4.
The data is then sent back to Node A via the P2P tunnel.

### Pipeline 3: Node A (The Reception)
Node A receives the FHIR R4 response.
- **Filter 2 (Active)**: Verifies the integrity and coherence of the received data.
- **Filter 3 (Active)**: Saves the data locally (Smart Fetching) to prevent future network calls, and logs the reception in the Audit Trail.
*(Filters 1 and 4 remain inactive).*

## 4. Resilience & Offline Mode
The architecture integrates a Transactional Outbox Pattern to handle network outages. Operations performed offline are written to an outbox table. An Event Relay synchronizes them with the Central Lighthouse once the network is restored, ensuring "At-Least-Once" delivery and state resynchronization.

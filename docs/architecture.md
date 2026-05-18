# System Architecture — CHNA

The CHNA system is designed to interconnect disparate healthcare establishments (clinics, labs, regional hospitals) in Algeria without forcing them to abandon their existing Information Systems (SIH). It achieves this through a distributed **Pipe & Filter** architecture and standardizes exchanges using the HL7 FHIR R4 standard.

## 1. Core Principles

### Sovereign Data (Hybrid Data Mesh)
Clinical data is never centralized. The Central Node only holds a directory index. Medical records remain locally stored in the hospitals' proprietary databases. Data exchange happens directly from Node to Node (P2P) via mutually authenticated TLS (mTLS) tunnels.

### Zero-Knowledge Consent
A patient's consent token (ECDSA signature) is verified locally by the Node holding the data. If the token is missing or revoked, the transfer is immediately blocked.

### Smart Caching (Local Resilience)
To maximize resilience and minimize network calls, successful transfers are securely persisted locally on the requesting doctor's terminal (Nœud A) under a Smart Cache. In case of network outage, the local cache allows seamless retrieval of previously synchronized records.

---

## 2. The Pipe & Filter Pipeline

Every node in the network implements a strict 4-filter pipeline. Depending on the node's role during a transaction, different filters are activated (the **Dual Mode** pattern).

### The 4 Filters

1. **Filter ①: FHIR Adapter (Anti-Corruption Layer)**
   Translates proprietary, local database structures (e.g. raw SQL outputs, CSVs, or legacy SIH structures) into the standardized HL7 FHIR R4 format.
2. **Filter ②: Security & Access (Consent Check)**
   Validates cryptographic consent tokens (ECDSA signatures) and enforces local data access control.
3. **Filter ③: Business Logic & Audit Trail**
   Manages smart local caching (Smart Fetching) and generates non-repudiable audit logs for every transaction.
4. **Filter ④: SIH Interface (Data Extraction)**
   Provides read-only access to the local database of the healthcare establishment to extract raw data.

---

## 3. P2P Flow & Pipelines

When a Doctor on **Nœud A (Requester)** queries a medical report (e.g., medical imaging) held by **Nœud B (Holder)**, three pipelines are triggered in sequence:

### Pipeline 1: Nœud A Request Emission
Nœud A initiates the request.
- **Filter ② (Active)**: Emits and signs the cryptographic consent check.
- **Filter ③ (Active)**: Logs the query in the local Audit Trail.
*(Filters ① and ④ remain inactive as no local data extraction is needed).*

### Pipeline 2: Nœud B Extraction & Translation
Nœud B receives the request, validates it, and extracts the local SIH data.
- **Filter ② (Active)**: Verifies the attached ECDSA consent token.
- **Filter ④ (Active)**: Connects to the local SIH and extracts raw proprietary data.
- **Filter ① (Active)**: Translates the raw data into FHIR R4 Standard (Anti-Corruption Layer).
- **Filter ③ (Active)**: Logs the access and response emission in the Audit Trail.

### Pipeline 3: Nœud A Reception & Caching
Nœud A receives the translated FHIR R4 response from Nœud B.
- **Filter ③ (Active)**: Verifies data coherence, stores the report in the local Smart Cache, and logs the successful reception in the Audit Trail.
*(Filters ①, ②, and ④ remain inactive).*

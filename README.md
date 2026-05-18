# CHNA (Core Health Network Algérie) — Prototype

CHNA is an interactive, pedagogical prototype demonstrating a distributed, peer-to-peer (P2P) healthcare network architecture. It enables secure, sovereign, and interoperable medical data exchange between Algerian healthcare facilities (hospitals, clinics, imaging centers) using the international HL7 FHIR R4 standard.

## 📖 Documentation Hub

To fully understand the project, its underlying architecture, and its technical implementation, please refer to the specific documentation files in the `docs/` directory:

1. **[Architecture Overview](docs/architecture.md)**: Explains the distributed Pipe & Filter design pattern, the zero-knowledge consent verification, and the mTLS-based P2P communication.
2. **[Backend Implementation](docs/backend.md)**: Details the reactive Spring Boot WebFlux framework, asynchronous filter chains, and real-time Server-Sent Events (SSE) broadcasting.
3. **[Frontend Implementation](docs/frontend.md)**: Details the Vite-powered React UI, local caching logic (Smart Fetching), and the unified split-grid dashboard layout.
4. **[Deployment & Docker](docs/deployment.md)**: Explains the multi-stage Docker build files, Nginx web routing, and the local deployment setup.

## 🚀 Quick Start

The project is fully containerized using Docker to facilitate instant local execution.

### Prerequisites
- Docker and Docker Compose installed.

### Running the Application

```bash
# Clone the repository
git clone <repository-url>
cd Alog_Prototype

# Build and start the containers in detached mode
docker compose up --build -d
```

Once the containers are up and running:
1. Open your browser and navigate to: **`http://localhost:5173`**
2. The application will load the **CHNA Doctor Workstation (Nœud A)**.
3. Select a patient (e.g., *Benali Amine*) from the left panel.
4. Trigger a P2P medical record extraction (e.g., click **Consulter Imagerie Médicale**).
5. Watch the reactive **Pipe & Filter** progress bar animate in real time, and observe the chronological logs stream and auto-scroll within the **Audit Trail** sidebar on the right!

## 🎯 Goal of the Prototype

The core objective is to make distributed, peer-to-peer architectural concepts visually visible and interactive. Instead of just reading about the **Pipe & Filter pattern** or the **Anti-Corruption Layer (ACL)**, an observer can watch the actual transaction flow:
- **Zero-Knowledge Consent**: Crytographic token (ECDSA) check performed locally on Nœud B to authorize transfer.
- **Anti-Corruption Layer**: Conversion of raw proprietary SIH database structure into a standard HL7 FHIR R4 document.
- **Smart Cache / Smart Fetching**: Local caching of responses on Nœud A to reduce future network calls and handle offline operations.
- **Real-Time Audit Trail**: Real-time chronological synchronization of logs from all active nodes, demonstrating network transparency.

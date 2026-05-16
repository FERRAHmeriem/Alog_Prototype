# MediLink (CHNA Prototype)

MediLink (formerly CHNA - Core Health Network Algérie) is an interactive, pedagogical prototype demonstrating a distributed, peer-to-peer (P2P) healthcare network architecture. It enables secure, sovereign, and interoperable medical data exchange between disparate healthcare facilities.

## 📖 Documentation Hub

To fully understand the project, its architecture, and its technical implementation, please refer to the specific documentation files in the `docs/` directory:

1. **[Architecture Overview](docs/architecture.md)**: Explains the Pipe & Filter design, the Dual Mode concept, Zero-Knowledge consent, and the 4-Filter pipeline.
2. **[Backend Implementation](docs/backend.md)**: Details the Spring Boot WebFlux reactive architecture, Server-Sent Events (SSE) broadcasting, and the filter chains.
3. **[Frontend Implementation](docs/frontend.md)**: Details the React application, the reactive hooks (`usePipelineEvents`), and the pedagogical UI components (Central, Node A, Node B).
4. **[Deployment & Docker](docs/deployment.md)**: Explains the containerized environment, Nginx configuration, and how to run the project.

## 🚀 Quick Start

The project is fully containerized using Docker.

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

Once the containers are up and running, open your browser and navigate to:
**http://localhost:5173**

You can use the dropdown menu in the top right corner to switch between the different roles:
- **Central**: Global view of the network and pipeline status.
- **Node A (Requester)**: The doctor's view initiating a medical record request.
- **Node B (Holder)**: The hospital's view receiving the request, extracting local SIH data, and translating it to FHIR R4.

## 🎯 Goal of the Prototype

The objective is to make the distributed architecture visible and interactive. Rather than just reading about the Pipe & Filter pattern or the Anti-Corruption Layer, an observer can watch the data flow in real-time. They can see a proprietary SIH format being transformed into standard FHIR R4, observe the cryptographic consent verification, and watch the real-time audit trail populate across the network.

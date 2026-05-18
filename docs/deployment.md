# Deployment & Docker Setup — CHNA

The CHNA prototype is designed to be easily deployable on any machine using Docker. The environment is orchestrated using `docker-compose`.

---

## 1. Architecture Summary
The deployment consists of two primary containers running in a bridged Docker network:
1. **Backend (`chna-backend`)**: The reactive Spring Boot WebFlux application exposing the REST APIs and SSE streams on port `8080`.
2. **Frontend (`chna-frontend`)**: A high-performance Nginx web server hosting the static Vite React application, accessible on port `5173`.

---

## 2. Docker Compose Configuration (`docker-compose.yml`)

The multi-container configuration is defined as follows:

```yaml
version: '3.8'

services:
  backend:
    build: 
      context: ./backend
      dockerfile: Dockerfile
    container_name: chna-backend
    ports:
      - "8080:8080"
    environment:
      - SPRING_PROFILES_ACTIVE=prod
    networks:
      - chna-network

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    container_name: chna-frontend
    ports:
      - "5173:80"
    depends_on:
      - backend
    networks:
      - chna-network

networks:
  chna-network:
    driver: bridge
```

---

## 3. Container Details

### Backend Container (`chna-backend`)
- **Dockerfile**: Implements a multi-stage Docker build:
  - **Stage 1 (Build)**: Uses `maven:3.9-eclipse-temurin-17-alpine` to compile the Java project and create the `.jar` package (`mvn package -DskipTests`).
  - **Stage 2 (Runtime)**: Uses `eclipse-temurin:17-jre-alpine` to run the lightweight containerized artifact.
- **Port**: Exposed on host port `8080`.

### Frontend Container (`chna-frontend`)
- **Dockerfile**: Also implements a multi-stage Docker build:
  - **Stage 1 (Build)**: Uses `node:20-alpine` to install packages (`npm ci`) and build the production bundle (`npm run build`).
  - **Stage 2 (Runtime)**: Uses `nginx:alpine` to serve static files from `/usr/share/nginx/html`.
- **Nginx Configuration**: A custom `nginx.conf` is injected to support client-side Routing fallbacks.

---

## 4. Running the Stack

To build and launch the entire CHNA stack in detached mode:
```bash
docker compose up --build -d
```

To view reactive server logs in real-time (to monitor active P2P filter pipelines):
```bash
docker compose logs -f backend
```

To gracefully stop and remove the container stack:
```bash
docker compose down
```

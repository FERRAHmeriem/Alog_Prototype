# Deployment & Docker Setup

The MediLink prototype is designed to be easily deployable on any machine using Docker. The environment is orchestrated using `docker-compose`.

## 1. Architecture Summary
The deployment consists of two primary containers running in a bridged Docker network:
1. **Backend (`chna-backend`)**: The Spring Boot WebFlux application exposing the API and SSE streams.
2. **Frontend (`chna-frontend`)**: An Nginx web server hosting the compiled React application.

## 2. Docker Compose Configuration (`docker-compose.yml`)

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

## 3. Container Details

### Backend Container
- **Dockerfile**: Uses a multi-stage build. 
  - Stage 1: Uses Maven to compile the Spring Boot application (`mvn clean package -DskipTests`).
  - Stage 2: Uses a lightweight JRE (e.g., `eclipse-temurin:17-jre-alpine`) to run the compiled `.jar`.
- **Port**: Exposed internally and externally on `8080`.

### Frontend Container
- **Dockerfile**: Also uses a multi-stage build.
  - Stage 1: Uses Node.js to install dependencies (`npm ci`) and build the Vite React app (`npm run build`).
  - Stage 2: Uses `nginx:alpine` to serve the static files located in the `dist` folder.
- **Port**: Maps the host's port `5173` to Nginx's internal port `80`.
- **Nginx Configuration**: A custom `nginx.conf` is injected to handle React Router's client-side routing (fallback to `index.html`).

## 4. Network and CORS
Because the frontend and backend are hosted on different ports (`5173` and `8080`), Cross-Origin Resource Sharing (CORS) is explicitly configured in the Spring Boot backend (`CorsConfig.java`) to allow requests from `http://localhost:5173`. 
The containers communicate over the `chna-network` bridge, but since the frontend runs in the user's browser, it accesses the backend via `localhost:8080`.

## 5. Running the Stack

To build and run the entire stack from scratch, execute:
```bash
docker compose up --build -d
```

To view the logs of the backend (useful for observing the reactive pipeline events):
```bash
docker compose logs -f backend
```

To stop the stack:
```bash
docker compose down
```

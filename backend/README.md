# CHNA Backend
Tech: Spring Boot 3.x + WebFlux, Java 21, Lombok

## API Contract
- `POST /api/pipeline/1` : Initiates request from Node A
- `POST /api/pipeline/2` : Processes request on Node B (Fetches SIH data and translates to FHIR)
- `POST /api/pipeline/3` : Receives FHIR response on Node A
- `GET /api/events` : SSE stream for filter status updates
- `GET /api/audit` : Fetch full audit trail

## Filters
- ① FhirTranslatorFilter: ACL (SIH -> FHIR R4)
- ② ConsentFilter: Token verification
- ③ AuditFilter: Traçabilité
- ④ SihFetchFilter: Lecture Base locale

## How to run
```bash
./mvnw spring-boot:run
```

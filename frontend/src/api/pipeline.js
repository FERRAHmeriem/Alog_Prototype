// api/pipeline.js
import axios from "axios";

// Using VITE_API_URL from .env if available, falling back to localhost
const BASE = import.meta.env.VITE_API_URL || "http://localhost:8080/api";

/**
 * Pipeline 1: Initiate request from Node A
 * Payload: { patientId, token, section, targetNode }
 */
export const requestPipeline1 = (request) =>
  axios.post(`${BASE}/pipeline/1`, request);

/**
 * Pipeline 2: Process at Node B (Holder)
 * Payload: { patientId, token, section, targetNode }
 */
export const requestPipeline2 = (request) =>
  axios.post(`${BASE}/pipeline/2`, request);

/**
 * Pipeline 3: Finalize at Node A (Receiver)
 * Payload: FHIR Response object
 */
export const requestPipeline3 = (response) =>
  axios.post(`${BASE}/pipeline/3`, response);
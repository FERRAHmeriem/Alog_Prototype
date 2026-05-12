// api/pipeline.js
import axios from "axios";

const BASE = "http://localhost:8080/api";

export const triggerPipeline1 = (request) =>
  axios.post(`${BASE}/pipeline/1`, request);

export const triggerPipeline2 = (request) =>
  axios.post(`${BASE}/pipeline/2`, request);

export const triggerPipeline3 = (response) =>
  axios.post(`${BASE}/pipeline/3`, response);
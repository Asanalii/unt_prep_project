// src/api/assessment.js
import api from "@/api/api";

export function fetchSubjects() {
  return api.get("/assessment/subjects");
}

export function fetchMyAttempts() {
  return api.get("/assessment/my-attempts");
}

export function fetchAttemptResult(attemptId) {
  return api.get(`/assessment/attempts/${attemptId}/result`);
}

export function fetchAllResults() {
  return api.get("/assessment/results");
}

export function createAttempt(payload) {
  return api.post("/assessment/attempts", payload);
}

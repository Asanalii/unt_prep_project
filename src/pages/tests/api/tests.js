// src/api/tests.js
import api from "@/api/api";

export function fetchSubjects() {
  return api.get("/assessment/subjects");
}

export function fetchMyAttempts() {
  return api.get("/assessment/my-attempts");
}

export function createAttempt(payload) {
  return api.post("/assessment/attempts", payload);
}

export function fetchAttemptDetail(attemptId) {
  return api.get(`/assessment/attempts/${attemptId}`);
}

export function saveAnswer(attemptId, payload) {
  return api.post(`/assessment/attempts/${attemptId}/answers`, payload);
}

export function finishAttempt(attemptId) {
  return api.post(`/assessment/attempts/${attemptId}/finish`);
}

export function fetchAttemptResult(attemptId) {
  return api.get(`/assessment/attempts/${attemptId}/result`);
}

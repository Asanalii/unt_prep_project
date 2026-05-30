// src/api/ml.js
import api from "@/api/api";

export function fetchLatestRecommendation() {
  return api.get("/ml/recommendations/latest");
}

export function fetchRecommendation(attemptId) {
  return api.get(`/ml/recommendations/${attemptId}`);
}

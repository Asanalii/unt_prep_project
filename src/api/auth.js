// src/api/auth.js
import api from "@/api/api";

export function fetchMe() {
  return api.get("/auth/me");
}

export function updateProfile(payload) {
  return api.patch("/auth/me", payload);
}

export function changePassword(payload) {
  return api.post("/auth/change-password", payload);
}

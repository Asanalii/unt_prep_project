// src/services/authService.js
import axios from "axios";
import {
  getRefreshToken,
  setTokens,
  setAccessToken,
  clearTokens,
} from "@/services/tokenService";

const authApi = axios.create({
  baseURL: "http://127.0.0.1:8000",
  headers: {
    "Content-Type": "application/json",
  },
});

export async function loginRequest(payload) {
  const { data } = await authApi.post("/auth/login", payload);

  setTokens(data.access_token, data.refresh_token);

  return data;
}

export async function registerRequest(payload) {
  const { data } = await authApi.post("/auth/register", payload);
  return data;
}

export async function meRequest(accessToken) {
  const { data } = await authApi.get("/auth/me", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  return data;
}

export async function refreshRequest() {
  const refreshToken = getRefreshToken();

  if (!refreshToken) {
    throw new Error("Refresh token not found");
  }

  const { data } = await authApi.post("/auth/refresh", {
    refresh_token: refreshToken,
  });

  if (data.refresh_token) {
    setTokens(data.access_token, data.refresh_token);
  } else {
    setAccessToken(data.access_token);
  }

  return data;
}

export function logoutRequest() {
  clearTokens();
}

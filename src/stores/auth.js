// src/stores/auth.js
import { computed, ref } from "vue";
import { defineStore } from "pinia";

import {
  loginRequest,
  registerRequest,
  meRequest,
  refreshRequest,
  logoutRequest,
} from "@/services/authService";

import {
  getAccessToken,
  getRefreshToken,
  clearTokens,
} from "@/services/tokenService";

export const useAuthStore = defineStore("auth", () => {
  const user = ref(null);
  const loading = ref(false);
  const initialized = ref(false);

  const accessToken = computed(() => getAccessToken());
  const refreshToken = computed(() => getRefreshToken());

  const isAuthenticated = computed(() => !!accessToken.value);

  const role = computed(() => user.value?.role || null);

  async function login(payload) {
    loading.value = true;

    try {
      await loginRequest(payload);

      const token = getAccessToken();
      const me = await meRequest(token);

      user.value = me;
      return me;
    } catch (error) {
      clearTokens();
      user.value = null;
      throw normalizeAuthError(error);
    } finally {
      loading.value = false;
    }
  }

  async function register(payload) {
    loading.value = true;

    try {
      const result = await registerRequest(payload);
      return result;
    } catch (error) {
      throw normalizeAuthError(error);
    } finally {
      loading.value = false;
    }
  }

  async function fetchMe() {
    const token = getAccessToken();

    if (!token) {
      user.value = null;
      return null;
    }

    try {
      const me = await meRequest(token);
      user.value = me;
      return me;
    } catch (error) {
      user.value = null;
      clearTokens();
      throw normalizeAuthError(error);
    }
  }

  async function tryRestoreSession() {
    if (initialized.value) return;

    try {
      const token = getAccessToken();

      if (!token) {
        user.value = null;
        return;
      }

      await fetchMe();
    } catch (_error) {
      try {
        const hasRefresh = getRefreshToken();

        if (!hasRefresh) {
          user.value = null;
          clearTokens();
          return;
        }

        await refreshRequest();
        await fetchMe();
      } catch (_refreshError) {
        user.value = null;
        clearTokens();
      }
    } finally {
      initialized.value = true;
    }
  }

  function logout() {
    logoutRequest();
    user.value = null;
    initialized.value = true;
  }

  return {
    user,
    loading,
    initialized,

    accessToken,
    refreshToken,
    isAuthenticated,
    role,

    login,
    register,
    fetchMe,
    tryRestoreSession,
    logout,
  };
});

function normalizeAuthError(error) {
  const message =
    error?.response?.data?.detail ||
    error?.response?.data?.message ||
    error?.message ||
    "Auth error";

  return new Error(message);
}

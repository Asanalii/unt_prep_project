import { defineStore } from "pinia";
import { ref, computed } from "vue";

let idSeq = 1;

export const useUiStore = defineStore("ui", () => {
  // ——— Global loading
  const loading = ref(false);
  const loadingMessage = ref("");

  function setLoading(val, message = "") {
    loading.value = !!val;
    loadingMessage.value = message || "";
  }

  // ——— Toasts
  const toasts = ref([]); // { id, type, title?, message, timeout }
  const toastCount = computed(() => toasts.value.length);

  function showToast({
    type = "info",
    message = "",
    title = "",
    timeout = 2500,
  } = {}) {
    const id = idSeq++;
    toasts.value.push({ id, type, title, message });
    if (timeout > 0) {
      setTimeout(() => removeToast(id), timeout);
    }
    return id;
  }
  function removeToast(id) {
    const idx = toasts.value.findIndex((t) => t.id === id);
    if (idx !== -1) toasts.value.splice(idx, 1);
  }

  // Шорткаты
  const toast = {
    info: (msg, title = "") => showToast({ type: "info", message: msg, title }),
    success: (msg, title = "") =>
      showToast({ type: "success", message: msg, title }),
    warn: (msg, title = "") =>
      showToast({ type: "warning", message: msg, title }),
    error: (msg, title = "") =>
      showToast({ type: "danger", message: msg, title, timeout: 4000 }),
  };

  // ——— Confirm (promise-based)
  const confirmOpen = ref(false);
  const confirmTitle = ref("Подтверждение");
  const confirmText = ref("Вы уверены?");
  const confirmOkText = ref("Да");
  const confirmCancelText = ref("Отмена");

  let _resolver = null;
  function confirm(options = {}) {
    confirmTitle.value = options.title || "Подтверждение";
    confirmText.value = options.text || "Вы уверены?";
    confirmOkText.value = options.okText || "Да";
    confirmCancelText.value = options.cancelText || "Отмена";
    confirmOpen.value = true;

    return new Promise((resolve) => {
      _resolver = resolve;
    });
  }
  function resolveConfirm(val) {
    confirmOpen.value = false;
    if (_resolver) {
      _resolver(!!val);
      _resolver = null;
    }
  }

  // ——— Locale / Theme (простая персистенция)
  const locale = ref(localStorage.getItem("locale") || "ru");
  const theme = ref(localStorage.getItem("theme") || "dark"); // dark|light
  function setLocale(l) {
    locale.value = l;
    localStorage.setItem("locale", l);
  }
  function setTheme(t) {
    theme.value = t;
    localStorage.setItem("theme", t);
  }

  // === TopBar progress ===
  const topbarActive = ref(false);
  const topbarProgress = ref(0);
  let _tbTimer = null;

  function _tick() {
    // асимптотика к 90% — как у NProgress
    const inc = (100 - Math.max(0, topbarProgress.value)) * 0.07; // 7% от остатка
    topbarProgress.value = Math.min(90, topbarProgress.value + inc);
  }

  function startTopbar() {
    clearInterval(_tbTimer);
    topbarActive.value = true;
    topbarProgress.value = 0;
    _tbTimer = setInterval(_tick, 200);
  }

  function finishTopbar() {
    clearInterval(_tbTimer);
    topbarProgress.value = 100;
    // короткая пауза, чтобы увидеть финиш
    setTimeout(() => {
      topbarActive.value = false;
      topbarProgress.value = 0;
    }, 200);
  }

  function failTopbar() {
    clearInterval(_tbTimer);
    topbarProgress.value = 100;
    setTimeout(() => {
      topbarActive.value = false;
      topbarProgress.value = 0;
    }, 350);
  }

  return {
    // loading
    loading,
    loadingMessage,
    setLoading,
    // toasts
    toasts,
    toastCount,
    showToast,
    removeToast,
    toast,
    // confirm
    confirmOpen,
    confirmTitle,
    confirmText,
    confirmOkText,
    confirmCancelText,
    confirm,
    resolveConfirm,
    // prefs
    locale,
    theme,
    setLocale,
    setTheme,
    // TopBar
    topbarActive,
    topbarProgress,
    startTopbar,
    finishTopbar,
    failTopbar,
  };
});

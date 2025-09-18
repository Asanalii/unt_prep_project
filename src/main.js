import { createApp, watch } from "vue";
import { createPinia } from "pinia";
import App from "./App.vue";
import router from "./router";
import "./styles/variables.css";
import "./styles/base.css";

import { i18n, loadLocale } from "./i18n";
import { useUiStore } from "./stores/ui";

// ---- app
const pinia = createPinia();
const app = createApp(App);
app.use(pinia);
app.use(router);
app.use(i18n);

// rehydrate auth (как было)
import { useAuthStore } from "./stores/auth";
const auth = useAuthStore();
try {
  const saved = JSON.parse(localStorage.getItem("auth_state") || "null");
  if (saved?.token) auth.$patch({ token: saved.token, user: saved.user });
} catch {}
auth.$subscribe((_m, state) => {
  localStorage.setItem(
    "auth_state",
    JSON.stringify({ token: state.token, user: state.user })
  );
});

// ——— i18n <-> useUiStore.locale
const ui = useUiStore();
// загрузим текущую локаль при старте
await loadLocale(ui.locale);

// реактивный вотчер: смена языка из стора → i18n
watch(
  () => ui.locale,
  async (loc) => {
    localStorage.setItem("locale", loc);
    document.documentElement.setAttribute("lang", loc); // <html lang="kz">
    await loadLocale(loc);
  },
  { immediate: true }
);

// опционально: классы темы на html/body
document.documentElement.dataset.theme = ui.theme;

app.mount("#app");

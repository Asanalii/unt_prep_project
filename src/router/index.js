import { createRouter, createWebHistory } from "vue-router";
import { useAuthStore } from "../stores/auth";
import { useUiStore } from "../stores/ui";
import { i18n, loadLocale } from "../i18n";

// страницы
import Dashboard from "../pages/Dashboard.vue";
import Subjects from "../pages/Subjects.vue";
import Forum from "../pages/Forum.vue";
import Tests from "../pages/Tests.vue";
import Login from "../pages/Login.vue";
import Register from "../pages/Register.vue";
import LocaleView from "../layout/LocaleView.vue";

// Поддерживаемые локали
export const supportedLocales = ["ru", "kk", "en"];
export const LOCALE_RE = "ru|kk|en";

// Определить локаль по saved/navigator
function getSavedOrDefaultLocale() {
  const saved = localStorage.getItem("locale");
  if (saved && supportedLocales.includes(saved)) return saved;
  // простая эвристика по браузеру
  const nav = (navigator.language || "ru").toLowerCase();
  if (nav.startsWith("kk")) return "kk";
  if (nav.startsWith("en")) return "en";
  return "ru";
}

const routes = [
  // корень без локали → редирект на сохранённую/дефолтную
  {
    path: "/",
    redirect: () => `/${getSavedOrDefaultLocale()}`,
  },

  // старые публичные пути без префикса → на текущую локаль
  {
    path: "/login",
    redirect: () => `/${getSavedOrDefaultLocale()}/login`,
  },
  {
    path: "/register",
    redirect: () => `/${getSavedOrDefaultLocale()}/register`,
  },

  // Всё приложение под префиксом локали
  {
    // path: `/:locale(${LOCALE_RE})`,
    path: `/:locale(${LOCALE_RE})`,
    component: LocaleView,
    children: [
      // публичные auth-страницы в своём лэйауте
      {
        path: "login",
        name: "login",
        component: Login,
        meta: { requiresAuth: false, layout: "auth" },
      },
      {
        path: "register",
        name: "register",
        component: Register,
        meta: { requiresAuth: false, layout: "auth" },
      },

      // приватные
      { path: "", name: "dashboard", component: Dashboard }, // "/:locale"
      { path: "subjects", name: "subjects", component: Subjects },
      { path: "forum", name: "forum", component: Forum },
      {
        path: "tests",
        name: "tests",
        component: Tests,
        meta: { roles: ["student", "teacher", "admin"] },
      },
    ],
  },

  // 404 → на корень с локалью
  { path: "/:pathMatch(.*)*", redirect: () => `/${getSavedOrDefaultLocale()}` },
];

const router = createRouter({ history: createWebHistory(), routes });

// ===== Guards =====
router.beforeEach(async (to) => {
  const ui = useUiStore();
  ui.startTopbar();

  // 1) валидация и загрузка локали
  const locale = to.params.locale;
  if (locale && !supportedLocales.includes(String(locale))) {
    return { path: `/${getSavedOrDefaultLocale()}` };
  }
  if (locale && i18n.global.locale.value !== locale) {
    await loadLocale(String(locale));
    localStorage.setItem("locale", String(locale));
    // для SEO/доступности
    document.documentElement.setAttribute("lang", String(locale));
  }

  // 2) auth-логика
  const auth = useAuthStore();
  const requiredRoles = to.meta?.roles;
  if (requiredRoles && !requiredRoles.includes(auth.role)) {
    return {
      name: "dashboard",
      params: { locale: to.params.locale },
      query: { denied: 1 },
    };
  }

  const isAuthPage = to.name === "login" || to.name === "register";
  if (isAuthPage && auth.isAuthenticated) {
    return { name: "dashboard", params: { locale } };
  }

  const needsAuth = to.meta.requiresAuth !== false; // по умолчанию — приватно
  if (needsAuth && !isAuthPage && !auth.isAuthenticated) {
    return {
      name: "login",
      params: { locale: locale || getSavedOrDefaultLocale() },
      query: { redirect: to.fullPath },
    };
  }
});

router.afterEach(() => {
  const ui = useUiStore();
  ui.finishTopbar();
});

router.onError(() => {
  const ui = useUiStore();
  ui.failTopbar();
});

export default router;

import { createRouter, createWebHistory } from "vue-router";
import { useAuthStore } from "../stores/auth";
import { useUiStore } from "../stores/ui";
import { i18n, loadLocale } from "../i18n";

// страницы
import Dashboard from "../pages/Dashboard.vue";
import Chat from "../pages/Chat.vue";
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

      { path: "chat", name: "chat", component: Chat }, // "/:locale"

      { path: "subjects", name: "subjects", component: Subjects },

      { path: "forum", name: "forum", component: Forum },

      {
        path: "tests",
        name: "tests",
        component: Tests,
        meta: { roles: ["student", "teacher", "admin"] },
      },

      {
        path: "tests/run",
        name: "test-run",
        component: () => import("@/pages/TestRunner.vue"),
        meta: { hideChrome: true, layout: "test" },
      },

      // teacher
      {
        path: "teacher",
        component: () => import("@/pages/teacher/Index.vue"),
        meta: { roles: ["teacher", "admin"] },
        children: [
          {
            path: "classes",
            name: "teacher-classes",
            component: () => import("@/pages/teacher/Classes.vue"),
          },

          {
            path: "results",
            name: "teacher-results",
            component: () => import("@/pages/teacher/Results.vue"),
          },

          // опционально:
          // { path: "qbank", name: "teacher-qbank", component: () => import("@/pages/teacher/QBank.vue"), },
          // { path: "grading",  name: "teacher-grading",  component: () => import("@/pages/teacher/Grading.vue") },
          // { path: "monitor",  name: "teacher-monitor",  component: () => import("@/pages/teacher/Monitor.vue") },
        ],
      },

      // parent
      {
        path: "parent",
        component: () => import("@/pages/parent/Index.vue"),
        meta: { roles: ["parent", "admin"] },
        children: [
          {
            path: "children",
            name: "parent-children",
            component: () => import("@/pages/parent/Children.vue"),
          },
          {
            path: "results",
            name: "parent-results",
            component: () => import("@/pages/parent/Results.vue"),
          },

          // можно позже:
          // { path: "schedule", name: "parent-schedule", component: () => import("@/pages/parent/Schedule.vue") },
        ],
      },

      // admin
      {
        path: "admin",
        component: () => import("@/pages/admin/Index.vue"),
        meta: { roles: ["admin"] },
        children: [
          {
            path: "",
            name: "admin-home",
            component: () => import("@/pages/admin/Dashboard.vue"),
            meta: { roles: ["admin"] },
          },
          {
            path: "users",
            name: "admin-users",
            component: () => import("@/pages/admin/Users.vue"),
            meta: { roles: ["admin"] },
          },
          {
            path: "roles",
            name: "admin-roles",
            component: () => import("@/pages/admin/Roles.vue"),
            meta: { roles: ["admin"] },
          },
        ],
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

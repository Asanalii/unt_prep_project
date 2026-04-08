import { createRouter, createWebHistory } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import { useUiStore } from "@/stores/ui";
import { i18n, loadLocale } from "@/i18n";

// страницы
import Dashboard from "@/pages/Dashboard.vue";
import Chat from "@/pages/Chat.vue";
import Subjects from "@/pages/Subjects.vue";
import ForumPage from "../pages/forum/ForumPage.vue";

import Tests from "@/pages/Tests.vue";
import TestsListPage from "@/pages/tests/TestsListPage.vue";

import Login from "@/pages/auth/LoginPage.vue";
import Register from "@/pages/auth/RegisterPage.vue";
import LocaleView from "@/layout/LocaleView.vue";

// Поддерживаемые локали
export const supportedLocales = ["ru", "kk", "en"];
export const LOCALE_RE = "ru|kk|en";

function getSavedOrDefaultLocale() {
  const saved = localStorage.getItem("locale");
  if (saved && supportedLocales.includes(saved)) return saved;

  const nav = (navigator.language || "ru").toLowerCase();
  if (nav.startsWith("kk")) return "kk";
  if (nav.startsWith("en")) return "en";

  return "ru";
}

function buildLocaleLocation(name, locale, extra = {}) {
  return {
    name,
    params: { locale: locale || getSavedOrDefaultLocale() },
    ...extra,
  };
}

const routes = [
  {
    path: "/",
    redirect: () => `/${getSavedOrDefaultLocale()}`,
  },

  {
    path: "/login",
    redirect: () => `/${getSavedOrDefaultLocale()}/login`,
  },
  {
    path: "/register",
    redirect: () => `/${getSavedOrDefaultLocale()}/register`,
  },

  {
    path: `/:locale(${LOCALE_RE})`,
    component: LocaleView,
    children: [
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

      // приватные по умолчанию
      {
        path: "",
        name: "dashboard",
        component: Dashboard,
      },
      {
        path: "chat",
        name: "chat",
        component: Chat,
      },
      {
        path: "subjects",
        name: "subjects",
        component: Subjects,
      },
      {
        path: "forum",
        name: "forum",
        component: ForumPage,
      },

      {
        path: "forum/:id",
        name: "forum-thread",
        component: () => import("@/pages/forum/ForumThread.vue"),
      },

      // {
      //   path: "tests",
      //   name: "tests",
      //   component: Tests,
      //   meta: { roles: ["student", "teacher", "admin"] },
      // },

      {
        path: "tests",
        name: "tests",
        component: TestsListPage,
        meta: { roles: ["student", "teacher", "admin"] },
      },

      // ВАЖНО: без начального слеша, иначе выпадет из locale children
      {
        path: "attempt/subject/:id",
        name: "attempt",
        component: () => import("@/pages/tests/AttemptViewPageForSubject.vue"),
      },

      // Нужно потом это по предметному поменять
      {
        path: "tests/run",
        name: "test-run",
        component: () => import("@/pages/tests/SubjectTestRunner.vue"),
        meta: { hideChrome: true, layout: "test" },
      },

      // Нужно потом это тест
      // {
      //   path: "tests/run",
      //   name: "test-run",
      //   component: () => import("@/pages/TestRunner.vue"),
      //   meta: { hideChrome: true, layout: "test" },
      // },

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
        ],
      },

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
        ],
      },

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

  {
    path: "/:pathMatch(.*)*",
    redirect: () => `/${getSavedOrDefaultLocale()}`,
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

let authRestorePromise = null;

async function ensureLocale(to) {
  const locale = to.params.locale;

  if (!locale) return null;

  const normalizedLocale = String(locale);

  if (!supportedLocales.includes(normalizedLocale)) {
    return { path: `/${getSavedOrDefaultLocale()}` };
  }

  if (i18n.global.locale.value !== normalizedLocale) {
    await loadLocale(normalizedLocale);
    localStorage.setItem("locale", normalizedLocale);
    document.documentElement.setAttribute("lang", normalizedLocale);
  }

  return null;
}

async function ensureAuthRestored(auth) {
  if (auth.initialized) return;

  if (!authRestorePromise) {
    authRestorePromise = auth.tryRestoreSession().finally(() => {
      authRestorePromise = null;
    });
  }

  await authRestorePromise;
}

router.beforeEach(async (to) => {
  const ui = useUiStore();
  const auth = useAuthStore();

  ui.startTopbar();

  try {
    // 1. Локаль
    const localeRedirect = await ensureLocale(to);
    if (localeRedirect) return localeRedirect;

    const locale = String(to.params.locale || getSavedOrDefaultLocale());

    // 2. Восстановление сессии один раз перед auth checks
    await ensureAuthRestored(auth);

    const isAuthPage = to.name === "login" || to.name === "register";
    const needsAuth = to.meta.requiresAuth !== false;
    const requiredRoles = to.meta.roles || null;

    // 3. Если уже вошёл — не пускаем на login/register
    if (isAuthPage && auth.isAuthenticated) {
      return buildLocaleLocation("dashboard", locale);
    }

    // 4. Если страница приватная и не авторизован
    if (needsAuth && !isAuthPage && !auth.isAuthenticated) {
      return buildLocaleLocation("login", locale, {
        query: { redirect: to.fullPath },
      });
    }

    // 5. Проверка ролей
    if (requiredRoles && (!auth.role || !requiredRoles.includes(auth.role))) {
      return buildLocaleLocation("dashboard", locale, {
        query: { denied: 1 },
      });
    }

    return true;
  } catch (error) {
    console.error("Router guard error:", error);

    const locale = String(to.params.locale || getSavedOrDefaultLocale());

    if (to.name !== "login") {
      return buildLocaleLocation("login", locale, {
        query: { redirect: to.fullPath },
      });
    }

    return true;
  }
});

router.afterEach(() => {
  const ui = useUiStore();
  ui.finishTopbar();
});

router.onError((error) => {
  console.error("Router error:", error);
  const ui = useUiStore();
  ui.failTopbar();
});

export default router;

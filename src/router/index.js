import { createRouter, createWebHistory } from "vue-router";

import { useAuthStore } from "../stores/auth";
import { useUiStore } from "../stores/ui";

import Dashboard from "../pages/Dashboard.vue";
import Subjects from "../pages/Subjects.vue";
import Forum from "../pages/Forum.vue";
import Tests from "../pages/Tests.vue";
import Login from "../pages/Login.vue";
import Register from "../pages/Register.vue";

const routes = [
  // публичные auth-страницы в отдельном лэйауте
  {
    path: "/login",
    name: "login",
    component: Login,
    meta: { requiresAuth: false, layout: "auth" },
  },
  {
    path: "/register",
    name: "register",
    component: Register,
    meta: { requiresAuth: false, layout: "auth" },
  },

  // приватные
  { path: "/", name: "dashboard", component: Dashboard },
  { path: "/subjects", name: "subjects", component: Subjects },
  { path: "/forum", name: "forum", component: Forum },
  { path: "/tests", name: "tests", component: Tests },

  { path: "/:pathMatch(.*)*", redirect: "/" },
];

const router = createRouter({ history: createWebHistory(), routes });

router.beforeEach((to) => {
  const auth = useAuthStore(); // pinia уже инициализирована в main.js
  const ui = useUiStore();
  ui.startTopbar();

  // если уже залогинен и идёт на /login|/register → редирект на главную
  if ((to.name === "login" || to.name === "register") && auth.isAuthenticated) {
    return { name: "dashboard" };
  }

  // всё приватное, кроме страниц с requiresAuth: false
  const needsAuth = to.meta.requiresAuth !== false;
  if (needsAuth && !auth.isAuthenticated) {
    return { name: "login", query: { redirect: to.fullPath } };
  }
});

router.afterEach(() => {
  const ui = useUiStore();
  ui.finishTopbar(); // завершение
});

router.onError(() => {
  const ui = useUiStore();
  ui.failTopbar(); // в случае ошибки тоже убрать
});

export default router;

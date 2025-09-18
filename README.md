# UNT Prep — Frontend

Одностраничное приложение для подготовки к ЕНТ. Локализовано (ru/kk/en), приватные страницы под логином, единый подход к локализованным ссылкам и роутам.

---

## TL;DR (как запустить)

```bash
npm i
npm run dev
```

**Vite alias** (`vite.config.js`) — обязателен:

```js
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { fileURLToPath, URL } from "node:url";

export default defineConfig({
  plugins: [vue()],
  resolve: { alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) } },
});
```

---

## Архитектура и директории

```
src/
  api/                 # вызовы к бэку (пока заглушки)
  assets/
    icons/
  components/
    atoms/             # базовые UI-атомы (BaseButton, BaseCard, BaseInput, BaseTag)
    i18n/
      LocalizedLink.vue
    layout/
      AppHeader.vue
      AppSidebar.vue
    ui/                # переиспользуемые UI-молекулы (UILoader, UIToast, UITopBarProgress …)
  composables/
    useAuth.js         # (эскиз) авторизация-утилиты
    useL10nRoute.js    # локализатор маршрутов (push/replace/l10nTo)
  i18n/
    index.js           # createI18n + lazy-load JSON
    locales/
      ru.json
      kk.json
      en.json
  layout/
    LocaleView.vue     # host для "детей" внутри /:locale
  lib/
    http.js            # (эскиз) axios-инстанс
  pages/
    Dashboard.vue
    Subjects.vue
    Tests.vue
    Forum.vue
    Login.vue
    Register.vue
  router/
    index.js           # маршруты + навигационные гарды
  stores/
    auth.js            # pinia: { user, token, roles, isAuthenticated, login, logout }
    ui.js              # pinia: топбар/тосты/confirm
  styles/
    base.css           # базовые стили (reset/типографика по желанию)
    variables.css      # CSS-переменные темы: --bg, --card, --border, --text, --muted, --accent-color
  App.vue
  main.js
```

**Конвенции импортов (строго):**

1. Libraries → 2) Actions/Composables/Helpers → 3) Components/Atoms/UI → 4) Local state.

**Именование:**

- Компонент локализованных ссылок: `LocalizedLink` (не LLink).
- Не используем однобуквенные переменные — вместо `l` пишем `localeCode`, `currentLocale` и т.п.

---

## i18n

`src/i18n/index.js` (ленивая загрузка JSON и установка `<html lang>` вызывается из гарда):

```js
import { createI18n } from "vue-i18n";

const fallbackLocale = "ru";
const saved = localStorage.getItem("locale") || fallbackLocale;

export const i18n = createI18n({
  legacy: false,
  locale: saved,
  fallbackLocale,
  messages: {},
});

export async function loadLocale(localeCode) {
  if (i18n.global.availableLocales.includes(localeCode)) {
    i18n.global.locale.value = localeCode;
    return;
  }
  const msgs = await import(`./locales/${localeCode}.json`);
  i18n.global.setLocaleMessage(localeCode, msgs.default || msgs);
  i18n.global.locale.value = localeCode;
}
```

**Локали:** `ru.json`, `kk.json`, `en.json` (ключи: `app.*`, `auth.*`, `common.*`, `dashboard.*`, `subjects.*`, `topics.*`).

---

## Роутер (+ гарды)

`src/router/index.js` — текущая версия (из проекта):

```js
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
  const navigatorLang = (navigator.language || "ru").toLowerCase();
  if (navigatorLang.startsWith("kk")) return "kk";
  if (navigatorLang.startsWith("en")) return "en";
  return "ru";
}

const routes = [
  { path: "/", redirect: () => `/${getSavedOrDefaultLocale()}` },
  { path: "/login", redirect: () => `/${getSavedOrDefaultLocale()}/login` },
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
      { path: "", name: "dashboard", component: Dashboard },
      { path: "subjects", name: "subjects", component: Subjects },
      { path: "forum", name: "forum", component: Forum },
      { path: "tests", name: "tests", component: Tests },
    ],
  },
  { path: "/:pathMatch(.*)*", redirect: () => `/${getSavedOrDefaultLocale()}` },
];

const router = createRouter({ history: createWebHistory(), routes });

// ===== Guards =====
router.beforeEach(async (to) => {
  const ui = useUiStore();
  ui.startTopbar();

  // 1) локаль
  const localeParam = to.params.locale;
  if (localeParam && !supportedLocales.includes(String(localeParam))) {
    return { path: `/${getSavedOrDefaultLocale()}` };
  }
  if (localeParam && i18n.global.locale.value !== localeParam) {
    await loadLocale(String(localeParam));
    localStorage.setItem("locale", String(localeParam));
    document.documentElement.setAttribute("lang", String(localeParam));
  }

  // 2) auth
  const auth = useAuthStore();
  const isAuthPage = to.name === "login" || to.name === "register";
  if (isAuthPage && auth.isAuthenticated) {
    return { name: "dashboard", params: { locale: localeParam } };
  }
  const needsAuth = to.meta.requiresAuth !== false; // default: private
  if (needsAuth && !isAuthPage && !auth.isAuthenticated) {
    return {
      name: "login",
      params: { locale: localeParam || getSavedOrDefaultLocale() },
      query: { redirect: to.fullPath },
    };
  }

  // 3) (опционально) роли
  const requiredRoles = to.meta?.roles;
  if (requiredRoles && !requiredRoles.some((r) => auth.roles.includes(r))) {
    return {
      name: "dashboard",
      params: { locale: localeParam },
      query: { denied: 1 },
    };
  }
});

router.afterEach(() => {
  useUiStore().finishTopbar();
});
router.onError(() => {
  useUiStore().failTopbar();
});

export default router;
```

**LocaleView\.vue** — через render (runtime-only):

```vue
<script setup>
import { h } from "vue";
</script>
<template>
  <!-- Фактически это render: () => h('router-view')  -->
  <router-view />
</template>
```

---

## Локализованные ссылки и переходы

### Компонент `LocalizedLink`

`src/components/i18n/LocalizedLink.vue` — обёртка над `<RouterLink>`.

**Usage**

```vue
<!-- Именованный роут (точная активность для дашборда) -->
<LocalizedLink
  :to="{ name: 'dashboard' }"
  exact-active-class="router-link-exact-active"
>
  {{ t('common.dashboard') }}
</LocalizedLink>

<!-- Строковые пути -->
<LocalizedLink to="tests">{{ t('common.tests') }}</LocalizedLink>
<LocalizedLink to="/subjects">{{ t('common.subjects') }}</LocalizedLink>

<!-- Внешняя ссылка -->
<LocalizedLink
  to="https://docs.example.com"
  target="_blank"
>Docs</LocalizedLink>
```

### Компосабл `useL10nRoute`

`src/composables/useL10nRoute.js` — локализатор переходов в коде.

**Usage**

```js
// import { useL10nRoute } from "@/composables/useL10nRoute";
// const { l10nTo, pushL10n, replaceL10n, localeCode } = useL10nRoute();
// await pushL10n({ name: "tests" });                  // именованный
// router.push(l10nTo("subjects"));                    // строка → "/kk/subjects"
// router.replace(l10nTo("/forum"));                   // абсолютный
// window.open(l10nTo("https://docs.example.com"), "_blank"); // внешняя — как есть
```

---

## Сайдбар и хедер

- `AppSidebar.vue` — использует `LocalizedLink`, i18n-тексты, точная активность для дашборда.
- `AppHeader.vue` — табы, переключатель языка (`ru/kk/en`), логин/логаут. Все переходы локализованы.

**Стиль кликабельных элементов** (утилита):

```css
.clickable {
  cursor: pointer;
  user-select: none;
  transition: background-color 0.15s, box-shadow 0.15s, border-color 0.15s, color
      0.15s, transform 0.05s;
}
.clickable:hover {
  border-color: var(--accent-color);
  box-shadow: 0 0 0 2px color-mix(in oklab, var(--accent-color) 22%, transparent);
}
.clickable:active {
  transform: translateY(0.5px);
}
.clickable.is-active {
  background: color-mix(in oklab, var(--accent-color) 14%, var(--card));
  color: var(--text);
  border-color: var(--accent-color);
  box-shadow: 0 0 0 2px color-mix(in oklab, var(--accent-color) 28%, transparent),
    inset 0 0 0 1px color-mix(in oklab, var(--accent-color) 35%, var(--border));
}
```

---

## Дашборд — текущая логика

- Выбор **предмета** (активны: Математика, Информатика; прочие disabled c бейджем «Скоро»).
- После выбора — **темы** (чипсы), множественный выбор.
- **Тип вопроса**: `single` (one answer), `multi` (multi answer), `context` (context questions).
- Textarea для промпта + кнопка «Генерация». Пока действия — через `ui.toast`.
- Все тексты — через i18n, включая казахский.

---

## Роли / доступ (актуально сейчас)

- **Guest** — `/:locale/login`, `/:locale/register`.
- **Student** — `/:locale` (dashboard), `subjects`, `tests`, `forum`, `profile (план)`.
- **Parent** — в планах (`/:locale/parent/*`).
- **Teacher | Moderator** — в планах (модерация форума, группы/сеты тестов).
- **Admin** — в планах (users/roles/limits/settings).

> Роль **Content Author** — **пока не используем**.

---

## Сторы (эскизы)

`stores/auth.js` — минимально: `user`, `token`, `roles`, `isAuthenticated`, `login()`, `logout()`.
`stores/ui.js` — глобальный топбар, тосты, confirm-заглушка (можно заменить на модальное окно в `components/ui`).

---

## Дорожная карта (кратко)

1. **Profile** и **Analytics** (скелет страниц)
2. **Forum**: create/reply, простая модерация
3. **Tests**: список/фильтры, `sessions/:id`, `review`, `history`
4. **Parent**: каркас дашборда
5. **Admin**: users/roles (UI)
6. Генерация вопросов — интеграция с бэком, сохранение наборов
7. Персист выбора `subject/topics/type` (Pinia + localStorage)

---

## FAQ

- **Почему дашборд выделялся активным на `/forum`?** Используем точную активность: класс `router-link-exact-active`.
- **Почему `LocaleView` — компонент, а не `template` строкой?** Runtime-only сборка Vue. Через `LocaleView.vue` избегаем требования runtime-компилятора.
- **Где настраивать цвет подсветки?** Через CSS-переменную `--accent-color` (в `styles/variables.css`).

---

## Правила PR/тасков (минимум)

- Новые страницы добавлять под `/:locale` и сразу снабжать i18n-ключами.
- Все ссылки/переходы — через `LocalizedLink` или `useL10nRoute()`.
- Не использовать однобуквенные переменные; `localeCode` вместо `l`.
- В роутере указывать `meta.roles` там, где нужен ролевой доступ (в будущем).

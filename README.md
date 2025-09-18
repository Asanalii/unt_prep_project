# UNT Prep — Frontend

Одностраничное приложение для подготовки к ЕНТ. Локализация `ru/kk/en`, URL с префиксом локали, приватные роуты под логином, ролевой доступ (**student / teacher / parent / admin**), единый способ локализовать ссылки и переходы.

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
    atoms/             # BaseButton, BaseCard, BaseInput, BaseTag …
    i18n/
      LocalizedLink.vue
    layout/
      AppHeader.vue
      AppSidebar.vue
    ui/                # UILoader, UIToast, UITopBarProgress …
  composables/
    useL10nRoute.js    # локализатор маршрутов (push/replace/l10nTo)
  i18n/
    index.js           # createI18n + lazy-load JSON
    locales/
      ru.json
      kk.json
      en.json
  layout/
    LocaleView.vue     # host для детей внутри /:locale
  lib/
    http.js            # (эскиз) axios-инстанс
  pages/
    Dashboard.vue
    Subjects.vue
    Tests.vue
    Forum.vue
    Login.vue
    Register.vue
    admin/
      Index.vue
      Dashboard.vue
      Users.vue
      Roles.vue
    teacher/
      Index.vue
      Classes.vue
      Results.vue
    parent/
      Index.vue
      Children.vue
      Results.vue
  router/
    index.js
  stores/
    auth.js            # pinia: { user:{name,email,role}, token, isAuthenticated, login, logout }
    ui.js              # pinia: топбар/тосты/confirm
  styles/
    base.css
    variables.css      # CSS-переменные: --bg, --card, --border, --text, --muted, --accent-color
  App.vue
  main.js
```

**Порядок импортов (строго):**

1. **Libraries** → 2) **Actions/Composables/Helpers** → 3) **Components/Atoms/UI** → 4) **Local state**.  
   **Именование:** компонент локализованных ссылок — `LocalizedLink` (не `LLink`). Избегаем коротких переменных — используем `localeCode`, `currentLocale` и т.п.

---

## i18n

`src/i18n/index.js` — ленивая загрузка JSON, активная локаль хранится в `localStorage` и проставляется в `<html lang>` из гарда.

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

**Ключи** (минимум): `app.*`, `auth.*`, `common.*`, `roles.*`, `admin.*`, `teacher.*`, `parent.*`, `dashboard.*`, `subjects.*`, `topics.*`.

Актуальный `ru.json` (фрагмент):

```json
{
  "roles": {
    "admin": "Администратор",
    "student": "Ученик",
    "teacher": "Преподаватель",
    "parent": "Родитель"
  },
  "admin": {
    "section": "Главный админ",
    "open": "Администрирование",
    "dashboard": "Панель администратора",
    "users": "Пользователи",
    "roles": "Роли и доступ"
  },
  "teacher": {
    "classes": "Мои классы",
    "assignments": "Назначения",
    "qbank": "Банк вопросов",
    "results": "Результаты"
  },
  "parent": { "children": "Мои дети", "results": "Результаты" }
}
```

---

## Локализованные ссылки и переходы

### Компонент `LocalizedLink`

`src/components/i18n/LocalizedLink.vue` — обёртка над `<RouterLink>`, автоматически добавляет префикс текущей локали, поддерживает именованные и строковые пути, внешние ссылки — как есть.

**Пример**

```vue
<LocalizedLink
  :to="{ name: 'dashboard' }"
  exact-active-class="router-link-exact-active"
>
  {{ t('common.dashboard') }}
</LocalizedLink>
<LocalizedLink to="tests">{{ t('common.tests') }}</LocalizedLink>
<LocalizedLink to="/subjects">{{ t('common.subjects') }}</LocalizedLink>
<LocalizedLink
  to="https://docs.example.com"
  target="_blank"
>Docs</LocalizedLink>
```

### Компосабл `useL10nRoute`

`src/composables/useL10nRoute.js` — локализатор маршрутов в коде.

```js
/*
Usage
import { useL10nRoute } from "@/composables/useL10nRoute";
const { l10nTo, pushL10n, replaceL10n, localeCode } = useL10nRoute();
await pushL10n({ name: "tests" });
router.push(l10nTo("subjects"));      // → "/kk/subjects"
router.replace(l10nTo("/forum"));     // абсолютный
window.open(l10nTo("https://docs.example.com"), "_blank");
*/
```

---

## Роутер и навигационные гарды

Все приватные страницы под `/:locale(ru|kk|en)`.

Главные правила:

- `/` → редирект на сохранённую/дефолтную локаль
- публичные: `/:locale/login`, `/:locale/register`
- приватные: `/:locale`, `/:locale/subjects`, `/:locale/tests`, `/:locale/forum`
- роль-доступ через `meta.roles` и проверку в `beforeEach`

**Фрагмент `src/router/index.js` (с доп. модулями админа/препода/родителя):**

```js
{
  path: ":/locale(ru|kk|en)",
  component: LocaleView,
  children: [
    { path: "login",    name: "login",    component: Login,    meta: { requiresAuth: false, layout: "auth" } },
    { path: "register", name: "register", component: Register, meta: { requiresAuth: false, layout: "auth" } },

    // приватные базовые
    { path: "",          name: "dashboard", component: Dashboard },
    { path: "subjects",  name: "subjects",  component: Subjects },
    { path: "forum",     name: "forum",     component: Forum },
    { path: "tests",     name: "tests",     component: Tests },

    // admin (только admin)
    {
      path: "admin",
      component: () => import("@/pages/admin/Index.vue"),
      meta: { roles: ["admin"] },
      children: [
        { path: "",       name: "admin-home",  component: () => import("@/pages/admin/Dashboard.vue"), meta: { roles: ["admin"] } },
        { path: "users",  name: "admin-users", component: () => import("@/pages/admin/Users.vue"),     meta: { roles: ["admin"] } },
        { path: "roles",  name: "admin-roles", component: () => import("@/pages/admin/Roles.vue"),     meta: { roles: ["admin"] } },
      ],
    },

    // teacher (teacher и admin)
    {
      path: "teacher",
      component: () => import("@/pages/teacher/Index.vue"),
      meta: { roles: ["teacher", "admin"] },
      children: [
        { path: "classes", name: "teacher-classes", component: () => import("@/pages/teacher/Classes.vue") },
        { path: "results", name: "teacher-results", component: () => import("@/pages/teacher/Results.vue") },
      ],
    },

    // parent (parent и admin)
    {
      path: "parent",
      component: () => import("@/pages/parent/Index.vue"),
      meta: { roles: ["parent", "admin"] },
      children: [
        { path: "children", name: "parent-children", component: () => import("@/pages/parent/Children.vue") },
        { path: "results",  name: "parent-results",  component: () => import("@/pages/parent/Results.vue") },
      ],
    },
  ],
}
```

**Проверка роли в `beforeEach`:**

```js
const auth = useAuthStore();
const needRoles = to.meta?.roles;
if (needRoles && !needRoles.includes(auth.role?.value ?? auth.role)) {
  return {
    name: "dashboard",
    params: { locale: to.params.locale },
    query: { denied: 1 },
  };
}
```

---

## Авторизация (Pinia)

`src/stores/auth.js` — хранит **одну роль** в `user.role` (упростили модель). Всё состояние переживает F5 (persist в `localStorage`).

Особенности mvp:

- Временная мапа ролей по email (для демо):
  - `asan@gmail.com` → `admin`
  - `asan-st@gmail.com` → `student`
  - `asan-t@gmail.com` → `teacher`
  - `asan-p@gmail.com` → `parent`
  - прочие → `student`
- **TODO удалить перед продом**, роли должны приходить с бэка.

API стора (минимум):

- `user: { name, email, role } | null`
- `token: string | null`
- `isAuthenticated: boolean`
- `login({ email, password })`
- `register({ name, email, password })`
- `logout()`
- `role` (computed), `hasRole(role)`, `hasAnyRole(list)`

---

## Сайдбар и роли

### Teacher

Если роль `teacher` (или `admin`), **перед** «Дэшборд» показываем:

- «Мои классы» (`teacher-classes`)
- «Результаты» (`teacher-results`)

### Parent

Если роль `parent` (или `admin`), **перед** «Дэшборд» показываем:

- «Мои дети» (`parent-children`)
- «Результаты» (`parent-results`)

### Admin

Внизу сайдбара — кнопка «Администрирование». По клику открывается всплывающая панель со ссылками:

- Admin Dashboard (`admin-home`)
- Users (`admin-users`)
- Roles (`admin-roles`)

Панель закрывается по клику вне, позиционируется над кнопкой.

---

## Хедер (язык + мини-профиль)

Справа: селект языка (RU/KK/EN), рядом мини-профиль (имя + строка роли), кнопка `→` для логаута. Когда не залогинен — кнопка «Вход».

Отображение роли берём из i18n: `t('roles.' + (auth.role || 'student'))`.

---

## Дашборд — UX (MVP)

- Сначала выбор предмета (активны: **Математика**, **Информатика**; остальные — disabled с бейджем «Скоро»)
- После выбора — список тем (чипсы), мультивыбор
- Типы вопросов: `type_single` | `type_multi` | `type_context`
- Текстовая область под промпт + контекст, кнопка «Сгенерировать» (пока тост)

Стили кликабельных элементов — через утилиту `.clickable` и модификатор `.is-active`.

---

## CSS-утилиты (фрагмент)

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

## Дорожная карта (кратко)

1. Teacher → Assignments & QBank (формы, списки)
2. Parent → Results (фильтры по ребёнку), Schedule
3. Tests → сессия/ревью/история
4. Admin → Users/Roles (минимальная логика)
5. Генерация вопросов → интеграция с бэком
6. Персист выбора `subject/topics/type` в Pinia/LS

---

## FAQ

- **Почему раньше “Dashboard” подсвечивался везде?** Исправлено: используем точный класс `router-link-exact-active`.
- **Почему локали из JSON не подтягивались?** Включена ленивая загрузка и установка `<html lang>` в гардe.
- **Почему роль “слетала” после F5?** Состояние `user`/`token` сохраняем в `localStorage`, роль хранится в `user.role`.

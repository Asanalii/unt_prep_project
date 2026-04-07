import { defineStore } from "pinia";
import { ref, computed } from "vue";

/** mock "БД" в LS */
function getUsers() {
  return JSON.parse(localStorage.getItem("users") || "[]");
}
function setUsers(users) {
  localStorage.setItem("users", JSON.stringify(users));
}

// TODO: убрать перед продом
const ROLE_BY_EMAIL = {
  "asan@gmail.com": "admin",
  "asan-st@gmail.com": "student",
  "asan-t@gmail.com": "teacher",
  "asan-p@gmail.com": "parent",
};

const LS_TOKEN = "token";
const LS_USER = "user"; // { name, email, role }

export const useAuthStore = defineStore("auth", () => {
  // ==== инициализация из LS ====
  const token = ref(localStorage.getItem(LS_TOKEN) || null);
  const user = ref(JSON.parse(localStorage.getItem(LS_USER) || "null")); // {name,email,role}|null

  // миграция старого формата (если вдруг был user без role, либо отдельные roles[])
  if (user.value && !user.value.role) {
    // попытка угадать по email
    const guessed =
      ROLE_BY_EMAIL[(user.value.email || "").toLowerCase()] || "student";
    user.value = { ...user.value, role: guessed };
    localStorage.setItem(LS_USER, JSON.stringify(user.value));
  }

  const isAuthenticated = computed(() => !!token.value);
  const role = computed(() => user.value?.role || "student");

  function persist() {
    if (token.value) localStorage.setItem(LS_TOKEN, token.value);
    else localStorage.removeItem(LS_TOKEN);

    if (user.value) localStorage.setItem(LS_USER, JSON.stringify(user.value));
    else localStorage.removeItem(LS_USER);
  }

  function _setSession({ tokenValue, userValue }) {
    token.value = tokenValue || null;
    user.value = userValue || null;
    persist();
  }

  async function register({ name, email, password }) {
    if (!name || !email || !password) throw new Error("Заполните все поля");
    const users = getUsers();
    if (users.find((u) => u.email === email))
      throw new Error("Пользователь уже существует");

    const roleForUser = ROLE_BY_EMAIL[email.toLowerCase()] || "student";
    users.push({ name, email, password, role: roleForUser }); // пароли не хэшируем — только для демо
    setUsers(users);
    return true;
  }

  async function login({ email, password }) {
    const users = getUsers();
    const found = users.find(
      (u) => u.email === email && u.password === password
    );
    if (!found) throw new Error("Неверный email или пароль");

    const roleForUser =
      found.role || ROLE_BY_EMAIL[email.toLowerCase()] || "student";
    const tokenValue = "mock-" + Math.random().toString(36).slice(2, 8);

    _setSession({
      tokenValue,
      userValue: { name: found.name, email: found.email, role: roleForUser },
    });
    return true;
  }

  function logout() {
    _setSession({ tokenValue: null, userValue: null });
  }

  // Хелперы
  function hasRole(expected) {
    return role.value === expected;
  }
  function hasAnyRole(list) {
    return list.includes(role.value);
  }

  return {
    user,
    role,
    token,
    isAuthenticated,
    register,
    login,
    logout,
    hasRole,
    hasAnyRole,
  };
});

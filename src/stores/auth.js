import { defineStore } from "pinia";
import { ref, computed } from "vue";

// моковая «БД» пользователей в localStorage
function getUsers() {
  return JSON.parse(localStorage.getItem("users") || "[]");
}
function setUsers(u) {
  localStorage.setItem("users", JSON.stringify(u));
}

export const useAuthStore = defineStore("auth", () => {
  const user = ref(null); // { name, email }
  const token = ref(localStorage.getItem("token") || null);

  const isAuthenticated = computed(() => !!token.value);

  function _setSession({ token: t, user: u }) {
    token.value = t;
    user.value = u;
    if (t) localStorage.setItem("token", t);
    else localStorage.removeItem("token");
  }

  async function register({ name, email, password }) {
    if (!name || !email || !password) throw new Error("Заполните все поля");
    const users = getUsers();
    if (users.find((u) => u.email === email))
      throw new Error("Пользователь уже существует");
    users.push({ name, email, password }); // пароли без хэша — только для мока!
    setUsers(users);
    return true;
  }

  async function login({ email, password }) {
    const users = getUsers();
    const found = users.find(
      (u) => u.email === email && u.password === password
    );
    if (!found) throw new Error("Неверный email или пароль");
    const t = "mock-" + Math.random().toString(36).slice(2, 8);
    _setSession({ token: t, user: { name: found.name, email: found.email } });
    return true;
  }

  function logout() {
    _setSession({ token: null, user: null });
  }

  return { user, token, isAuthenticated, register, login, logout };
});

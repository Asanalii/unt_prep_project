import { reactive, computed } from "vue";

const state = reactive({
  user: null,
  token: localStorage.getItem("token") || null,
});

// простейшее «хранилище пользователей» в localStorage (мок)
function getUsers() {
  return JSON.parse(localStorage.getItem("users") || "[]");
}
function setUsers(u) {
  localStorage.setItem("users", JSON.stringify(u));
}

function setSession({ token, user }) {
  state.token = token;
  state.user = user;
  if (token) localStorage.setItem("token", token);
  else localStorage.removeItem("token");
}

export function useAuth() {
  const isAuthenticated = computed(() => !!state.token);

  async function register({ name, email, password }) {
    if (!name || !email || !password) throw new Error("Заполните все поля");
    const users = getUsers();
    if (users.find((u) => u.email === email))
      throw new Error("Пользователь уже существует");
    users.push({ name, email, password }); // пароли без хеша — только для мока!
    setUsers(users);
    return true;
  }

  async function login({ email, password }) {
    const users = getUsers();
    const found = users.find(
      (u) => u.email === email && u.password === password
    );
    if (!found) throw new Error("Неверный email или пароль");
    const token = "mock-" + Math.random().toString(36).slice(2, 8);
    setSession({ token, user: { name: found.name, email: found.email } });
    return true;
  }

  function logout() {
    setSession({ token: null, user: null });
  }

  return { state, isAuthenticated, register, login, logout };
}

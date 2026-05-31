<!-- src/pages/profile/ProfilePage.vue -->
<script setup>
import { ref, reactive, computed, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";

import { useAuthStore } from "@/stores/auth";
import { useUiStore } from "@/stores/ui";
import { fetchMyAttempts } from "../dashboard/api/assessment";
import { fetchMe, updateProfile, changePassword } from "@/api/auth";

const router = useRouter();
const route = useRoute();
const auth = useAuthStore();
const ui = useUiStore();

const TOTAL_QUESTIONS = 40;

const ROLE_LABELS = {
  student: "Ученик",
  teacher: "Учитель",
  parent: "Родитель",
  admin: "Администратор",
};

// local copy of the user so the page updates immediately after edits
const me = reactive({ ...(auth.user || {}) });

const fullName = computed(() => me.full_name || me.name || "");
const headerName = computed(
  () => fullName.value || (me.email ? me.email.split("@")[0] : "Пользователь"),
);
const roleLabel = computed(() => ROLE_LABELS[me.role] || me.role || "—");

const initials = computed(() => {
  const parts = String(headerName.value).trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "U";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
});

// ----- learning stats
const stats = ref({ total: 0, completed: 0, avgScore: 0, bestScore: 0 });
const statsLoading = ref(false);

onMounted(async () => {
  // refresh user from the server (in case the store is stale)
  try {
    const res = await fetchMe();
    Object.assign(me, res?.data || {});
  } catch (e) {
    // keep store copy
  }

  statsLoading.value = true;
  try {
    const res = await fetchMyAttempts();
    const attempts = res?.data || [];
    const finished = attempts.filter((a) => a.status === "finished");
    const avg = finished.length
      ? Math.round(
          finished.reduce(
            (s, a) => s + ((a.score || 0) / TOTAL_QUESTIONS) * 100,
            0,
          ) / finished.length,
        )
      : 0;
    const best = finished.reduce((m, a) => Math.max(m, a.score || 0), 0);
    stats.value = {
      total: attempts.length,
      completed: finished.length,
      avgScore: avg,
      bestScore: best,
    };
  } finally {
    statsLoading.value = false;
  }
});

// ----- edit name (inline)
const editingName = ref(false);
const nameInput = ref("");
const savingName = ref(false);

function startEditName() {
  nameInput.value = fullName.value;
  editingName.value = true;
}
function cancelEditName() {
  editingName.value = false;
}
async function saveName() {
  const value = nameInput.value.trim();
  if (value.length < 2) {
    ui.toast?.error?.("Имя слишком короткое");
    return;
  }
  savingName.value = true;
  try {
    const res = await updateProfile({ full_name: value });
    Object.assign(me, res?.data || { full_name: value });
    if (auth.user) auth.user.full_name = value; // keep store in sync
    editingName.value = false;
    ui.toast?.success?.("Имя обновлено");
  } catch (e) {
    ui.toast?.error?.(e?.response?.data?.detail || "Не удалось сохранить имя");
  } finally {
    savingName.value = false;
  }
}

// ----- change password (modal)
const showPwd = ref(false);
const pwd = reactive({ current: "", next: "", confirm: "" });
const pwdError = ref("");
const savingPwd = ref(false);

function openPwd() {
  pwd.current = "";
  pwd.next = "";
  pwd.confirm = "";
  pwdError.value = "";
  showPwd.value = true;
}
async function submitPwd() {
  pwdError.value = "";
  if (pwd.next.length < 6) {
    pwdError.value = "Новый пароль должен быть не короче 6 символов";
    return;
  }
  if (pwd.next !== pwd.confirm) {
    pwdError.value = "Пароли не совпадают";
    return;
  }
  savingPwd.value = true;
  try {
    await changePassword({
      current_password: pwd.current,
      new_password: pwd.next,
    });
    showPwd.value = false;
    ui.toast?.success?.("Пароль изменён");
  } catch (e) {
    pwdError.value = e?.response?.data?.detail || "Не удалось изменить пароль";
  } finally {
    savingPwd.value = false;
  }
}

// ----- logout
async function onLogout() {
  try {
    await auth.logout?.();
  } catch (e) {
    // ignore
  }
  try {
    await router.push({
      name: "login",
      params: { locale: route.params.locale },
    });
  } catch (e) {
    router.push("/");
  }
}
</script>

<template>
  <div class="profile">
    <h1 class="page-title">Профиль</h1>

    <!-- header -->
    <section class="card head">
      <div class="avatar">{{ initials }}</div>
      <div class="who">
        <div class="name">{{ headerName }}</div>
        <div class="email">{{ me.email || "—" }}</div>
      </div>
      <span class="role-badge">{{ roleLabel }}</span>
    </section>

    <div class="grid">
      <!-- account details -->
      <section class="card">
        <h2 class="card-title">Данные аккаунта</h2>
        <dl class="rows">
          <div class="row">
            <dt>Имя</dt>
            <dd v-if="!editingName" class="with-action">
              <span>{{ fullName || "—" }}</span>
              <button class="link" @click="startEditName">изменить</button>
            </dd>
            <dd v-else class="edit">
              <input
                v-model="nameInput"
                class="inp"
                type="text"
                placeholder="Ваше имя"
                @keyup.enter="saveName"
              />
              <div class="edit-actions">
                <button class="mini" :disabled="savingName" @click="saveName">
                  {{ savingName ? "…" : "Сохранить" }}
                </button>
                <button class="mini ghost" @click="cancelEditName">
                  Отмена
                </button>
              </div>
            </dd>
          </div>
          <div class="row">
            <dt>Email</dt>
            <dd>{{ me.email || "—" }}</dd>
          </div>
          <div class="row">
            <dt>Роль</dt>
            <dd>{{ roleLabel }}</dd>
          </div>
          <div class="row">
            <dt>ID</dt>
            <dd>{{ me.id ?? "—" }}</dd>
          </div>
        </dl>
      </section>

      <!-- learning stats -->
      <section class="card">
        <h2 class="card-title">Учебная статистика</h2>
        <div v-if="statsLoading" class="muted">Загрузка…</div>
        <div v-else class="stat-grid">
          <div class="stat">
            <div class="k">{{ stats.total }}</div>
            <div class="l">Попыток</div>
          </div>
          <div class="stat">
            <div class="k">{{ stats.completed }}</div>
            <div class="l">Завершено</div>
          </div>
          <div class="stat">
            <div class="k accent">{{ stats.avgScore }}%</div>
            <div class="l">Средний балл</div>
          </div>
          <div class="stat">
            <div class="k">{{ stats.bestScore }} / {{ TOTAL_QUESTIONS }}</div>
            <div class="l">Лучший результат</div>
          </div>
        </div>
      </section>
    </div>

    <!-- account actions -->
    <section class="card">
      <h2 class="card-title">Аккаунт</h2>
      <div class="actions">
        <button class="btn" @click="openPwd">Сменить пароль</button>
        <button class="btn danger" @click="onLogout">Выйти</button>
      </div>
    </section>

    <!-- change password modal -->
    <Teleport to="body">
      <div v-if="showPwd" class="overlay" @click.self="showPwd = false">
        <div class="modal">
          <div class="m-head">
            <div class="m-ttl">Смена пароля</div>
            <button class="x" @click="showPwd = false" aria-label="Закрыть">
              ✕
            </button>
          </div>
          <div class="m-body">
            <label class="field">
              <span>Текущий пароль</span>
              <input v-model="pwd.current" type="password" class="inp" />
            </label>
            <label class="field">
              <span>Новый пароль</span>
              <input v-model="pwd.next" type="password" class="inp" />
            </label>
            <label class="field">
              <span>Повторите новый пароль</span>
              <input
                v-model="pwd.confirm"
                type="password"
                class="inp"
                @keyup.enter="submitPwd"
              />
            </label>
            <div v-if="pwdError" class="err">{{ pwdError }}</div>
          </div>
          <div class="m-foot">
            <button class="btn ghost" @click="showPwd = false">Отмена</button>
            <button
              class="btn primary"
              :disabled="savingPwd"
              @click="submitPwd"
            >
              {{ savingPwd ? "Сохранение…" : "Сохранить" }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
.profile {
  padding: 16px;
  display: grid;
  gap: 16px;
  grid-auto-rows: min-content;
}
.page-title {
  margin: 0;
  font-size: var(--fz-24, 24px);
}

.card {
  border: 1px solid var(--border);
  border-radius: 14px;
  padding: 16px;
  background: var(--bg);
}
.card-title {
  margin: 0 0 14px;
  font-size: var(--fz-16, 16px);
}
.muted {
  color: var(--muted);
}

/* header */
.head {
  display: flex;
  align-items: center;
  gap: 18px;
  background: linear-gradient(
    135deg,
    color-mix(in oklab, var(--accent-color) 12%, var(--bg)),
    var(--bg) 60%
  );
}
.avatar {
  width: 68px;
  height: 68px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 26px;
  font-weight: 700;
  color: #fff;
  background: linear-gradient(
    135deg,
    var(--accent-color),
    color-mix(in oklab, var(--accent-color) 60%, #000)
  );
  box-shadow: 0 0 0 4px
    color-mix(in oklab, var(--accent-color) 18%, transparent);
  flex-shrink: 0;
}
.who {
  flex: 1;
  min-width: 0;
}
.name {
  font-size: 22px;
  font-weight: 700;
}
.email {
  color: var(--muted);
  margin-top: 2px;
}
.role-badge {
  padding: 5px 14px;
  border-radius: 999px;
  border: 1px solid color-mix(in oklab, var(--accent-color) 35%, var(--border));
  background: color-mix(in oklab, var(--accent-color) 12%, var(--bg));
  color: var(--text);
  font-size: 13px;
  font-weight: 600;
  flex-shrink: 0;
}

/* grid */
.grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}
@media (max-width: 720px) {
  .grid {
    grid-template-columns: 1fr;
  }
}

/* account details rows */
.rows {
  margin: 0;
  display: grid;
  gap: 12px;
}
.row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  border-bottom: 1px solid var(--border);
  padding-bottom: 12px;
  min-height: 24px;
}
.row:last-child {
  border-bottom: 0;
  padding-bottom: 0;
}
.row dt {
  color: var(--muted);
  flex-shrink: 0;
}
.row dd {
  margin: 0;
  font-weight: 600;
  text-align: right;
  word-break: break-word;
}
.with-action {
  display: inline-flex;
  align-items: center;
  gap: 10px;
}
.link {
  border: 0;
  background: none;
  color: var(--accent-color);
  cursor: pointer;
  font-size: var(--fz-14, 14px);
  font-weight: 600;
  padding: 0;
}
.edit {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 8px;
  width: 100%;
}
.edit-actions {
  display: flex;
  gap: 8px;
}
.mini {
  padding: 6px 12px;
  border-radius: 8px;
  border: 1px solid var(--accent-color);
  background: color-mix(in oklab, var(--accent-color) 16%, var(--bg));
  color: var(--text);
  cursor: pointer;
  font-size: 13px;
}
.mini.ghost {
  border-color: var(--border);
  background: var(--bg);
}

.inp {
  width: 100%;
  border: 1px solid var(--border);
  background: var(--bg-elev, var(--card));
  color: var(--text);
  border-radius: 8px;
  padding: 8px 10px;
  outline: none;
}
.inp:focus {
  border-color: var(--accent-color);
}

/* stats */
.stat-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}
.stat {
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 14px;
  background: var(--bg-elev, var(--card));
}
.k {
  font-size: 22px;
  font-weight: 700;
}
.k.accent {
  color: var(--accent-color);
}
.l {
  color: var(--muted);
  margin-top: 4px;
  font-size: var(--fz-14, 14px);
}

/* actions */
.actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}
.btn {
  padding: 10px 16px;
  border-radius: 10px;
  border: 1px solid var(--border);
  background: var(--bg);
  color: var(--text);
  cursor: pointer;
}
.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
.btn.primary {
  border-color: var(--accent-color);
  background: color-mix(in oklab, var(--accent-color) 18%, var(--bg));
}
.btn.ghost {
  background: var(--bg);
}
.btn.danger {
  border-color: color-mix(in oklab, var(--danger, #ff5c5c) 50%, var(--border));
  color: var(--danger, #ff5c5c);
}

/* modal */
.overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.55);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  z-index: 1000;
}
.modal {
  width: 100%;
  max-width: 420px;
  background: var(--card, var(--bg));
  border: 1px solid var(--border);
  border-radius: 14px;
  padding: 16px;
}
.m-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 14px;
}
.m-ttl {
  font-size: 18px;
  font-weight: 700;
}
.x {
  border: 1px solid var(--border);
  background: var(--bg);
  color: var(--text);
  border-radius: 8px;
  width: 30px;
  height: 30px;
  cursor: pointer;
}
.m-body {
  display: grid;
  gap: 12px;
}
.field {
  display: grid;
  gap: 6px;
}
.field span {
  color: var(--muted);
  font-size: var(--fz-14, 14px);
}
.err {
  color: var(--danger, #ff5c5c);
  font-size: var(--fz-14, 14px);
}
.m-foot {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 16px;
}
</style>

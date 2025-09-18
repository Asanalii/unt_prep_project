<script setup>
// ===== Libraries
import { computed, ref, onMounted, onBeforeUnmount } from "vue";
import { useI18n } from "vue-i18n";

// ===== Stores / Composables
import { useAuthStore } from "@/stores/auth";
import LocalizedLink from "@/i18n/LocalizedLink.vue";

// ===== UI
import BaseTag from "@/components/atoms/BaseTag.vue";

const { t } = useI18n();
const auth = useAuthStore();

const roleValue = computed(() => auth.role?.value ?? auth.role);

// у стора role может быть computed — учитываем оба случая
const isAdmin = computed(() => roleValue.value === "admin");

const isTeacher = computed(
  () => roleValue.value === "teacher" || roleValue.value === "admin"
);

const isParent = computed(
  () => roleValue.value === "parent" || roleValue.value === "admin"
);

// раскрытие панели
const adminOpen = ref(false);
const panelEl = ref(null);

function toggleAdmin() {
  adminOpen.value = !adminOpen.value;
}

// закрывать кликoм вне панели
function onDocClick(e) {
  if (!adminOpen.value) return;
  const target = e.target;
  if (panelEl.value && !panelEl.value.contains(target)) {
    adminOpen.value = false;
  }
}
onMounted(() => document.addEventListener("click", onDocClick, true));
onBeforeUnmount(() => document.removeEventListener("click", onDocClick, true));

// ссылки админа
const adminLinks = [
  { name: "admin-home", labelKey: "admin.dashboard" },
  { name: "admin-users", labelKey: "admin.users" },
  { name: "admin-roles", labelKey: "admin.roles" },
];
</script>

<template>
  <nav class="wrap">
    <div class="brand">{{ t("app.name") }}</div>

    <ul class="menu">
      <li v-if="isParent">
        <LocalizedLink :to="{ name: 'parent-children' }" class="item">{{
          t("parent.children")
        }}</LocalizedLink>
      </li>

      <li v-if="isParent">
        <LocalizedLink :to="{ name: 'parent-results' }" class="item">{{
          t("parent.results")
        }}</LocalizedLink>
      </li>

      <li v-if="isTeacher">
        <LocalizedLink :to="{ name: 'teacher-classes' }" class="item">{{
          t("teacher.classes")
        }}</LocalizedLink>
      </li>
      <li v-if="isTeacher">
        <LocalizedLink :to="{ name: 'teacher-results' }" class="item">{{
          t("teacher.results")
        }}</LocalizedLink>
      </li>

      <li>
        <LocalizedLink
          :to="{ name: 'dashboard' }"
          class="item"
          exact-active-class="router-link-exact-active"
        >
          {{ t("common.dashboard") }}
        </LocalizedLink>
      </li>
      <li>
        <LocalizedLink :to="{ name: 'tests' }" class="item">
          {{ t("common.tests") }}
        </LocalizedLink>
      </li>
      <li>
        <LocalizedLink :to="{ name: 'subjects' }" class="item">
          {{ t("common.subjects") }}
        </LocalizedLink>
      </li>
      <li>
        <LocalizedLink :to="{ name: 'forum' }" class="item">
          {{ t("common.forum") }}
        </LocalizedLink>
      </li>

      <li class="mt">
        <BaseTag tone="success">{{ t("app.beta") }}</BaseTag>
      </li>
    </ul>

    <!-- Нижняя зона -->
    <div class="bottom">
      <!-- Триггер -->
      <button
        v-if="isAdmin"
        class="admin-trigger clickable"
        @click.stop="toggleAdmin"
      >
        <span class="dot"></span>
        <span class="admin-title">{{ t("admin.open") }}</span>
        <span class="chev" :class="{ open: adminOpen }">▾</span>
      </button>

      <!-- Выпадающее меню -->
      <div
        v-if="isAdmin && adminOpen"
        ref="panelEl"
        class="admin-panel"
        @click.stop
      >
        <div class="panel-head">{{ t("admin.section") }}</div>
        <ul class="admin-list">
          <li v-for="l in adminLinks" :key="l.name">
            <LocalizedLink
              :to="{ name: l.name }"
              class="admin-link"
              @click="adminOpen = false"
            >
              {{ t(l.labelKey) }}
            </LocalizedLink>
          </li>
        </ul>
      </div>
    </div>
  </nav>
</template>

<style scoped>
.wrap {
  display: grid;
  grid-template-rows: auto 1fr auto;
  height: 100%;
  padding: var(--s-6);
}

/* бренд */
.brand {
  font-size: var(--fz-20);
  font-weight: 700;
  margin-bottom: var(--s-6);
  color: var(--text);
}

/* список */
.menu {
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  gap: var(--s-2);
  align-content: start; /* фикс “растягивания” по всей высоте */
}
.item {
  display: block;
  padding: 10px 12px;
  border-radius: var(--radius-sm);
  color: var(--text);
  border: 1px solid transparent;
  text-decoration: none;
  transition: background-color 0.15s, border-color 0.15s, box-shadow 0.15s;
}
.item:hover {
  border-color: var(--accent-color, #6c5ce7);
  box-shadow: 0 0 0 2px
    color-mix(in oklab, var(--accent-color, #6c5ce7) 18%, transparent);
}

.item.router-link-exact-active {
  background: color-mix(
    in oklab,
    var(--accent-color, #6c5ce7) 12%,
    var(--card)
  );
  border-color: var(--accent-color, #6c5ce7);
  box-shadow: inset 0 0 0 1px
    color-mix(in oklab, var(--accent-color, #6c5ce7) 35%, var(--border));
}
.mt {
  margin-top: var(--s-8);
}

/* нижняя область */
.bottom {
  position: relative;
  margin-top: auto;
}

/* кнопка-аккордеон */
.admin-trigger {
  width: 100%;
  display: grid;
  grid-template-columns: 12px 1fr auto;
  align-items: center;
  gap: 8px;
  background: var(--bg-elev);
  color: var(--text);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  padding: 10px 12px;
}
.admin-trigger .dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--accent-color, #6c5ce7);
}
.admin-trigger .chev {
  transition: transform 0.15s ease;
  opacity: 0.85;
}
.admin-trigger .chev.open {
  transform: rotate(180deg);
}

/* выпадающее меню */
.admin-panel {
  position: absolute;
  left: 0;
  right: 0;
  bottom: calc(100% + 8px);
  z-index: 20;
  background: var(--bg-elev);
  border: 1px solid var(--border);
  border-radius: 12px;
  box-shadow: 0 10px 30px color-mix(in oklab, #000 35%, transparent);
  padding: 10px;
  max-height: 60vh;
  overflow: auto;
}
.panel-head {
  padding: 8px 10px;
  margin-bottom: 6px;
  font-weight: 600;
  color: var(--text);
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
}
.admin-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  gap: 4px;
}
.admin-link {
  display: block;
  padding: 10px 12px;
  border-radius: var(--radius-sm);
  color: var(--text);
  text-decoration: none;
  border: 1px solid transparent;
}
.admin-link:hover {
  border-color: var(--accent-color, #6c5ce7);
  box-shadow: 0 0 0 2px
    color-mix(in oklab, var(--accent-color, #6c5ce7) 18%, transparent);
}
</style>

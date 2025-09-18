<script setup>
import { useRoute, useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { computed, unref } from "vue";

import { useUiStore } from "@/stores/ui";
import { useAuthStore } from "@/stores/auth";
import { loadLocale } from "@/i18n";

import BaseButton from "@/components/atoms/BaseButton.vue";
import LocalizedLink from "../../i18n/LocalizedLink.vue";

const route = useRoute();
const router = useRouter();
const { t } = useI18n();

const ui = useUiStore();
const auth = useAuthStore();

// текущая локаль из префикса
const locale = computed(() => (route.params.locale || "ru").toString());

// имя и роль для отображения
const userName = computed(() => {
  const name = auth.user?.name;
  if (name && name.trim().length) return name;
  const email = auth.user?.email || "";
  return email ? email.split("@")[0] : "";
});

const roleLabel = computed(() => {
  const role = auth.role || "student";

  return t(`roles.${role}`);
});

// смена языка с сохранением хвоста пути
async function switchLocale(next) {
  if (next === locale.value) return;
  const rest = route.fullPath.replace(/^\/(ru|kk|en)/, "");
  await loadLocale(next);
  localStorage.setItem("locale", next);
  document.documentElement.setAttribute("lang", next);
  router.push(`/${next}${rest || ""}`);
}

// логин/логаут
async function onAuthClick() {
  if (auth.isAuthenticated) {
    const ok = await ui.confirm({
      title: t("confirm.title_exit"),
      text: t("confirm.text_exit"),
      okText: t("confirm.ok"),
      cancelText: t("confirm.cancel"),
    });
    if (ok) {
      auth.logout();
      ui.toast.info(t("toast.logout") || t("auth.logged_out"));
      router.replace({ name: "login", params: { locale: locale.value } });
    }
  } else {
    router.push({ name: "login", params: { locale: locale.value } });
  }
}
</script>

<template>
  <header class="hdr">
    <div class="tabs">
      <LocalizedLink :to="{ name: 'dashboard' }">
        {{ t("common.dashboard") }}
      </LocalizedLink>
      <LocalizedLink :to="{ name: 'tests' }">
        {{ t("common.tests") }}
      </LocalizedLink>
      <LocalizedLink :to="{ name: 'subjects' }">
        {{ t("common.subjects") }}
      </LocalizedLink>
      <LocalizedLink :to="{ name: 'forum' }">
        {{ t("common.forum") }}
      </LocalizedLink>
    </div>

    <div class="right">
      <!-- язык -->
      <select
        :value="locale"
        class="lang"
        @change="switchLocale($event.target.value)"
      >
        <option value="ru">RU</option>
        <option value="kk">KK</option>
        <option value="en">EN</option>
      </select>

      <!-- мини-профиль (только когда залогинен) -->
      <div v-if="auth.isAuthenticated" class="usercard">
        <h3 class="username" :title="userName">{{ userName }}</h3>
        <span class="role">{{ roleLabel }}</span>
      </div>

      <!-- кнопка вход/выход -->
      <BaseButton size="sm" variant="ghost" @click="onAuthClick">
        {{ auth.isAuthenticated ? "→" : t("auth.login") }}
      </BaseButton>
    </div>
  </header>
</template>

<style scoped>
.hdr {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 var(--s-6);
  border-bottom: 1px solid var(--border);
  background: var(--bg-elev);
}
.tabs {
  display: flex;
  gap: var(--s-4);
}
.tabs a {
  padding: 10px 12px;
  border-radius: var(--radius-sm);
  color: var(--muted);
}
.tabs a.router-link-exact-active {
  background: var(--card);
  color: var(--text);
  border: 1px solid var(--border);
}

.right {
  display: flex;
  gap: var(--s-3);
  align-items: center;
}
.lang {
  background: var(--bg);
  color: var(--text);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  padding: 6px 8px;
  margin-right: 4px;
}

/* мини-профиль справа от селекта языка */
.usercard {
  display: grid;
  line-height: 1.1;
  margin-right: 4px;
}
.username {
  margin: 0;
  font-size: var(--fz-14);
  font-weight: 600;
  color: var(--text);
  max-width: 160px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.role {
  font-size: var(--fz-12);
  color: var(--muted);
}
</style>

<script setup>
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";

import { useUiStore } from "../../stores/ui";
import { useAuthStore } from "../../stores/auth";

import BaseButton from "../atoms/BaseButton.vue";

const router = useRouter();
const { t } = useI18n();

const ui = useUiStore();
const auth = useAuthStore();

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
      ui.toast.info("Вы вышли из аккаунта");
      router.replace({ name: "login" });
    }
  } else {
    router.push({ name: "login" });
  }
}
</script>

<template>
  <header class="hdr">
    <div class="tabs">
      <router-link to="/">{{ t("common.dashboard") }}</router-link>
      <router-link to="/tests">{{ t("common.tests") }}</router-link>
      <router-link to="/subjects">{{ t("common.subjects") }}</router-link>
      <router-link to="/forum">{{ t("common.forum") }}</router-link>
    </div>
    <div class="right">
      <select v-model="ui.locale" class="lang">
        <option value="ru">RU</option>
        <option value="kz">KZ</option>
        <option value="en">EN</option>
      </select>
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
.tabs a.router-link-active {
  background: var(--card);
  color: var(--text);
  border: 1px solid var(--border);
}
.right {
  display: flex;
  gap: var(--s-3);
  align-items: center;
}
.user {
  color: var(--muted);
  font-size: var(--fz-14);
}
.lang {
  background: var(--bg);
  color: var(--text);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  padding: 6px 8px;
  margin-right: 8px;
}
</style>

<script setup>
import { useRoute, useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { computed } from "vue";

import { useUiStore } from "@/stores/ui";
import { useAuthStore } from "@/stores/auth";
import { loadLocale } from "@/i18n";

import BaseButton from "@/components/atoms/BaseButton.vue";

const route = useRoute();
const router = useRouter();
const { t } = useI18n();

const ui = useUiStore();
const auth = useAuthStore();

// Текущая локаль берём из префикса
const locale = computed(() => (route.params.locale || "ru").toString());

// Переход с сохранением хвоста пути (после /:locale)
async function switchLocale(next) {
  if (next === locale.value) return;
  const rest = route.fullPath.replace(/^\/(ru|kk|en)/, ""); // убираем старый префикс
  await loadLocale(next); // лениво подгружаем переводы
  localStorage.setItem("locale", next);
  document.documentElement.setAttribute("lang", next);
  router.push(`/${next}${rest || ""}`);
}

// Логаут/логин с учётом локали
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
      ui.toast.info(t("auth.logged_out"));
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
      <router-link :to="{ name: 'dashboard', params: { locale } }" end>
        {{ t("common.dashboard") }}
      </router-link>
      <router-link :to="{ name: 'tests', params: { locale } }" end>
        {{ t("common.tests") }}
      </router-link>
      <router-link :to="{ name: 'subjects', params: { locale } }" end>
        {{ t("common.subjects") }}
      </router-link>
      <router-link :to="{ name: 'forum', params: { locale } }" end>
        {{ t("common.forum") }}
      </router-link>
    </div>

    <div class="right">
      <select
        :value="locale"
        class="lang"
        @change="switchLocale($event.target.value)"
      >
        <option value="ru">RU</option>
        <option value="kk">KK</option>
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
  margin-right: 8px;
}
</style>

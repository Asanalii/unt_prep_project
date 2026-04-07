<!-- App.vue -->
<script setup>
import { useRoute } from "vue-router";
import { computed, onMounted } from "vue";

import { useAuthStore } from "./stores/auth";

import AppSidebar from "./components/layout/AppSidebar.vue";
import AppHeader from "./components/layout/AppHeader.vue";

// UI глобальные
import UiToast from "./components/ui/UiToast.vue";
import UiConfirm from "./components/ui/UiConfirm.vue";
import UiLoader from "./components/ui/UiLoader.vue";
import UiTopBarProgress from "./components/ui/UiTopBarProgress.vue";

const route = useRoute();

const auth = useAuthStore();

const hideChrome = computed(() => route.meta.hideChrome === true);

onMounted(() => {
  auth.tryRestoreSession();
});
</script>

<template>
  <div v-if="route.meta.layout === 'auth'" class="auth-wrap">
    <router-view />
  </div>
  <div v-else class="app" :class="{ 'no-chrome': hideChrome }">
    <aside class="sidebar">
      <AppSidebar v-if="!hideChrome" />
    </aside>
    <main class="main">
      <AppHeader v-if="!hideChrome" />
      <section class="content"><router-view /></section>
    </main>
  </div>

  <!-- Глобальные UI -->
  <UiToast />
  <UiConfirm />
  <UiLoader />
  <UiTopBarProgress />
</template>
<style scoped>
.app {
  display: grid;
  grid-template-columns: 260px 1fr;
  height: 100%;
}

.app.no-chrome {
  grid-template-columns: 1fr;
}

.app.no-chrome .main {
  grid-template-rows: 1fr;
}

.sidebar {
  border-right: 1px solid var(--border);
  background: var(--bg-elev);
}

.main {
  display: grid;
  grid-template-rows: 64px 1fr;
  min-height: 100%;
}

.content {
  padding: var(--s-6);
}

.app.no-chrome .content {
  padding: 0;
}

.auth-wrap {
  min-height: 100%;
  display: grid;
  place-items: center;
  padding: var(--s-6);
}
</style>

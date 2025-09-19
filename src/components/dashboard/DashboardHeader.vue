<script setup>
defineProps({
  user: { type: Object, default: () => ({}) },
  summary: { type: Object, default: () => ({}) },
  onRefresh: { type: Function, required: true },
});
</script>

<template>
  <header class="hdr">
    <div class="left">
      <h2 class="title">{{ $t("dashboard.title") }}</h2>
      <p class="subtitle">
        {{
          $t("dashboard.greeting", {
            name: user?.name || user?.email || "User",
          })
        }}
      </p>
    </div>
    <div class="right">
      <button class="btn" @click="onRefresh">
        {{ $t("dashboard.refresh") }}
      </button>
    </div>
  </header>
</template>

<style scoped>
.hdr {
  display: grid;
  grid-template-columns: 1fr auto;
  align-items: center;
  gap: 12px;
}
.title {
  margin: 0;
  font-size: 22px;
}
.subtitle {
  margin: 4px 0 0;
  color: var(--muted);
}
.btn {
  padding: 8px 12px;
  border: 1px solid var(--border);
  background: var(--bg);
  color: var(--text);
  border-radius: 8px;
  cursor: pointer;
}
.btn:hover {
  background: var(--card);
}
</style>

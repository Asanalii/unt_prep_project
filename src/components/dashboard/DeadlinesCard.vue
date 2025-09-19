<script setup>
import { computed } from "vue";
const props = defineProps({ examDate: { type: String, required: true } });
const fmt = computed(() => new Date(props.examDate).toLocaleDateString());
const days = computed(() => {
  const ms = new Date(props.examDate) - new Date();
  return Math.max(0, Math.ceil(ms / (1000 * 60 * 60 * 24)));
});
</script>

<template>
  <article class="card">
    <div class="ttl">{{ $t("dashboard.deadline.title") }}</div>
    <div class="big">{{ days }} {{ $t("dashboard.deadline.days") }}</div>
    <div class="sub">
      {{ $t("dashboard.deadline.subtitle", { date: fmt }) }}
    </div>
  </article>
</template>

<style scoped>
.card {
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 12px;
  background: var(--bg);
}
.ttl {
  font-weight: 600;
  margin-bottom: 4px;
}
.big {
  font-size: 26px;
  font-weight: 800;
}
.sub {
  color: var(--muted);
  margin-top: 4px;
}
</style>

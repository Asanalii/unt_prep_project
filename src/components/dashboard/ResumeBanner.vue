<script setup>
import { computed } from "vue";
import { useI18n } from "vue-i18n";

const { t } = useI18n();

const props = defineProps({
  hold: { type: Object, default: null }, // { attemptId, since }
  approved: { type: Object, default: null }, // { attemptId, until }
});
const variant = computed(() =>
  props.approved ? "approved" : props.hold ? "hold" : "idle"
);
const title = computed(() =>
  props.approved
    ? // Разрешено продолжение
      `${t("dashboard.banner.approved_title")} #${props.approved.attemptId}`
    : props.hold
    ? `${t("dashboard.banner.hold_title")} #${props.hold.attemptId}`
    : t("dashboard.banner.idle_title")
);
const subtitle = computed(() =>
  props.approved
    ? t("dashboard.banner.approved_sub", {
        time: new Date(props.approved.until).toLocaleTimeString(),
      })
    : props.hold
    ? t("dashboard.banner.hold_sub")
    : t("dashboard.banner.idle_sub")
);
</script>
<template>
  <div class="wrap" :data-variant="variant">
    <div class="left">
      <h3 class="t">{{ title }}</h3>
      <p class="s">{{ subtitle }}</p>
    </div>
    <div class="right">
      <button v-if="approved" class="btn solid" @click="$emit('resume')">
        {{ t("dashboard.banner.resume") }}
      </button>
      <button v-else class="btn" @click="$emit('start-new')">
        {{ t("dashboard.banner.new") }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.wrap {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 10px;
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 12px;
  background: var(--bg);
}
.wrap[data-variant="hold"] {
  border-color: #f57c00;
}
.wrap[data-variant="approved"] {
  border-color: #2e7d32;
}
.t {
  margin: 0;
  font-size: 18px;
}
.s {
  margin: 4px 0 0;
  color: var(--muted);
}
.btn {
  padding: 8px 12px;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: var(--bg);
  color: var(--text);
  cursor: pointer;
}
.btn.solid {
  background: color-mix(in oklab, var(--accent-color) 18%, var(--bg));
  border-color: var(--accent-color);
}
</style>

<script setup>
import { useI18n } from "vue-i18n";

import BaseButton from "@/components/atoms/BaseButton.vue";

const { t } = useI18n();

const props = defineProps({
  subject: { type: Object, required: true },
  username: { type: String, required: true },
  hasPrev: { type: Boolean, default: false },
  hasNext: { type: Boolean, default: false },
});

const emit = defineEmits(["toggle-menu", "prev-subject", "next-subject"]);
</script>

<template>
  <header class="top">
    <button
      class="icon ghost clickable"
      @click="emit('toggle-menu')"
      aria-label="menu"
    >
      ☰
    </button>

    <div class="top-title">
      {{ t("test.subject") }}: <b>{{ subject.name }}</b>
    </div>

    <div class="top-right">
      <div class="username">{{ username }}</div>
      <BaseButton
        variant="ghost"
        size="md"
        :disabled="!hasPrev"
        @click="emit('prev-subject')"
      >
        {{ t("test.prev_subject") }}
      </BaseButton>
      <BaseButton
        variant="primary"
        size="md"
        :disabled="!hasNext"
        @click="emit('next-subject')"
      >
        {{ t("test.next_subject") }}
      </BaseButton>
    </div>
  </header>
</template>

<style scoped>
.top {
  display: flex;
  align-items: center;
  gap: var(--s-3);
  padding: 8px 12px;
  border-bottom: 1px solid var(--border);
  background: var(--bg-elev);
}
.top-title {
  flex: 1;
  color: var(--muted);
}
.top-right {
  display: flex;
  gap: 8px;
  align-items: center;
}
.username {
  color: var(--text);
  font-weight: 600;
}
.icon {
  width: 32px;
  height: 32px;
  display: inline-grid;
  place-items: center;
  border-radius: 10px;

  cursor: pointer;
}

.ghost {
  border: 1px solid var(--border);
  background: var(--bg);
  color: var(--text);
}
</style>

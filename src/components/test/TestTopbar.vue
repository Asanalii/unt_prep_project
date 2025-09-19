<script setup>
const props = defineProps({
  subject: { type: Object, required: true }, // { id, name }
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
      {{ $t("test.subject") }}: <b>{{ subject.name }}</b>
    </div>
    <div class="top-right">
      <div class="username">{{ username }}</div>
      <button class="ghost" :disabled="!hasPrev" @click="emit('prev-subject')">
        {{ $t("test.prev_subject") }}
      </button>
      <button
        class="primary"
        :disabled="!hasNext"
        @click="emit('next-subject')"
      >
        {{ $t("test.next_subject") }}
      </button>
    </div>
  </header>
</template>

<style scoped>
.top {
  position: relative;
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

.ghost {
  padding: 8px 12px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--border);
  background: var(--bg);
  color: var(--text);
}
.primary {
  padding: 8px 12px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--accent-color);
  background: color-mix(in oklab, var(--accent-color) 14%, var(--card));
  color: var(--text);
}

button {
  cursor: pointer;
}
</style>

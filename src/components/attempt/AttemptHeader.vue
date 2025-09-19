<script setup>
const props = defineProps({
  attempt: { type: Object, required: true },
});
const emit = defineEmits(["back"]);

function fmtDate(iso) {
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
}
</script>

<template>
  <div class="hdr panel">
    <div class="l">
      <button class="ghost" @click="$emit('back')">← Назад</button>
      <h2>Попытка #{{ attempt.id }}</h2>
      <div class="meta">
        Банк: {{ attempt.bankVersion }} · Начата:
        {{ fmtDate(attempt.startedAt) }} · Завершена:
        {{ fmtDate(attempt.finishedAt) }}
      </div>
    </div>
    <div class="r">
      <div class="score">
        <div class="big">{{ attempt.score.total }}</div>
        <div class="cap">итоговый балл</div>
      </div>
      <div class="stat">
        <div class="cap">Статус</div>
        <div class="chip" :class="attempt.status">{{ attempt.status }}</div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.panel {
  border: 1px solid var(--border);
  border-radius: 14px;
  padding: 12px;
  background: var(--bg);
}
.hdr {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}
.l h2 {
  margin: 4px 0;
}
.meta {
  color: var(--muted);
  font-size: 12px;
}
.r {
  display: flex;
  gap: 16px;
  align-items: center;
}
.score .big {
  font-size: 28px;
  font-weight: 800;
  line-height: 1;
}
.cap {
  color: var(--muted);
  font-size: 12px;
}
.chip {
  padding: 4px 8px;
  border-radius: 8px;
  border: 1px solid var(--border);
  text-transform: uppercase;
  font-size: 11px;
}
.chip.done {
  background: color-mix(in oklab, limegreen 15%, var(--bg));
}
.ghost {
  padding: 6px 10px;
  border-radius: 8px;
  border: 1px solid var(--border);
  background: var(--bg);
}
</style>

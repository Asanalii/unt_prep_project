<!-- src/components/dashboard/DifficultyBreakdown.vue -->
<script setup>
import { computed } from "vue";

const props = defineProps({
  difficulty: { type: Array, default: () => [] }, // [{difficulty, correct, total, accuracy, avg_seconds}]
  time: { type: Object, default: null }, // { avg_per_question, total_answered }
});

const LEVELS = {
  1: "Лёгкие",
  2: "Средние",
  3: "Сложные",
};

const rows = computed(() =>
  props.difficulty.map((d) => ({
    label: LEVELS[d.difficulty] || `Уровень ${d.difficulty}`,
    accuracy: d.accuracy,
    correct: d.correct,
    total: d.total,
    avgSeconds: d.avg_seconds,
  })),
);

function pct(a) {
  return Math.round((a || 0) * 100);
}
function level(a) {
  if (a >= 0.72) return "strong";
  if (a >= 0.45) return "mid";
  return "weak";
}
function fmtTime(sec) {
  if (!sec) return "—";
  if (sec < 60) return `${Math.round(sec)}с`;
  const m = Math.floor(sec / 60);
  const s = Math.round(sec % 60);
  return s ? `${m}м ${s}с` : `${m}м`;
}
</script>

<template>
  <article class="card">
    <div class="hdr">
      <div class="ttl">Разбор по сложности</div>
      <div v-if="time && time.total_answered" class="meta">
        ⌀ {{ fmtTime(time.avg_per_question) }} на вопрос
      </div>
    </div>

    <div v-if="!rows.length" class="muted">
      Пройдите тест, чтобы увидеть разбор по сложности.
    </div>

    <div v-else class="grid">
      <div v-for="row in rows" :key="row.label" class="lvl">
        <div class="top">
          <span class="name">{{ row.label }}</span>
          <span class="acc" :class="level(row.accuracy)"
            >{{ pct(row.accuracy) }}%</span
          >
        </div>
        <div class="bar">
          <div
            class="fill"
            :class="level(row.accuracy)"
            :style="{ width: pct(row.accuracy) + '%' }"
          />
        </div>
        <div class="sub">
          <span>{{ row.correct }} / {{ row.total }} верно</span>
          <span class="time">⌀ {{ fmtTime(row.avgSeconds) }}</span>
        </div>
      </div>
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
.hdr {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
  gap: 12px;
}
.ttl {
  font-weight: 600;
}
.meta {
  color: var(--muted);
  font-size: 12px;
}
.muted {
  color: var(--muted);
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 16px 24px;
}
.top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 6px;
}
.name {
  font-weight: 600;
}
.acc {
  font-weight: 700;
}
.acc.weak {
  color: var(--danger, #ff5c5c);
}
.acc.mid {
  color: var(--warning, #f5a623);
}
.acc.strong {
  color: var(--success, #19c37d);
}

.bar {
  height: 6px;
  border-radius: 999px;
  background: var(--bg-elev, var(--card));
  overflow: hidden;
}
.fill {
  height: 100%;
  border-radius: 999px;
}
.fill.weak {
  background: var(--danger, #ff5c5c);
}
.fill.mid {
  background: var(--warning, #f5a623);
}
.fill.strong {
  background: var(--success, #19c37d);
}

.sub {
  display: flex;
  justify-content: space-between;
  color: var(--muted);
  font-size: 12px;
  margin-top: 6px;
}
.time {
  color: var(--muted);
}
</style>

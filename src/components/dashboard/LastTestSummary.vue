<!-- src/components/dashboard/LastTestSummary.vue -->
<script setup>
import { computed } from "vue";

const props = defineProps({
  result: { type: Object, default: null }, // one attempt result with .summary
});

const R = 52;
const C = 2 * Math.PI * R;

const summary = computed(() => props.result?.summary || null);

const total = computed(() => {
  const s = summary.value;
  if (!s) return 0;
  return s.correct + s.incorrect + s.not_answered;
});

const segments = computed(() => {
  const s = summary.value;
  if (!s || !total.value) return [];

  const defs = [
    { key: "correct", label: "Верно", value: s.correct, cls: "correct" },
    {
      key: "incorrect",
      label: "Неверно",
      value: s.incorrect,
      cls: "incorrect",
    },
    { key: "na", label: "Без ответа", value: s.not_answered, cls: "na" },
  ];

  let acc = 0;
  return defs.map((d) => {
    const frac = d.value / total.value;
    const seg = {
      ...d,
      pct: Math.round(frac * 100),
      dash: frac * C,
      offset: acc * C,
    };
    acc += frac;
    return seg;
  });
});

const correctPct = computed(() => {
  const s = summary.value;
  if (!s || !total.value) return 0;
  return Math.round((s.correct / total.value) * 100);
});

const naPct = computed(() => {
  const s = summary.value;
  if (!s || !total.value) return 0;
  return Math.round((s.not_answered / total.value) * 100);
});

const showTimeHint = computed(() => naPct.value >= 25);

function fmt(iso) {
  return iso ? new Date(iso).toLocaleString() : "—";
}
</script>

<template>
  <article class="card">
    <div class="hdr">
      <div class="ttl">Последний тест</div>
      <div v-if="result" class="meta">{{ fmt(result.finished_at) }}</div>
    </div>

    <div v-if="!result" class="muted">Пройдите тест, чтобы увидеть сводку.</div>

    <div v-else class="body">
      <div class="donut-wrap">
        <svg viewBox="0 0 120 120" class="donut">
          <g transform="rotate(-90 60 60)">
            <circle
              class="track"
              cx="60"
              cy="60"
              :r="R"
              fill="none"
              stroke-width="14"
            />
            <circle
              v-for="seg in segments"
              :key="seg.key"
              :class="['seg', seg.cls]"
              cx="60"
              cy="60"
              :r="R"
              fill="none"
              stroke-width="14"
              :stroke-dasharray="`${seg.dash} ${C - seg.dash}`"
              :stroke-dashoffset="-seg.offset"
            />
          </g>
          <text x="60" y="58" class="big" text-anchor="middle">
            {{ correctPct }}%
          </text>
          <text x="60" y="74" class="lbl" text-anchor="middle">верно</text>
        </svg>
      </div>

      <div class="side">
        <div class="score">
          Балл: <b>{{ result.score }} / {{ result.total_questions }}</b>
        </div>

        <ul class="legend">
          <li v-for="seg in segments" :key="seg.key">
            <span class="dot" :class="seg.cls" />
            <span class="lname">{{ seg.label }}</span>
            <span class="lval">{{ seg.value }} ({{ seg.pct }}%)</span>
          </li>
        </ul>

        <div v-if="showTimeHint" class="hint">
          ⏱ Без ответа осталось {{ naPct }}% вопросов — обрати внимание на
          тайм-менеджмент: попробуй не застревать на сложных и возвращаться к
          ним позже.
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

.body {
  display: flex;
  align-items: center;
  gap: 24px;
  flex-wrap: wrap;
}

.donut-wrap {
  width: 150px;
  flex-shrink: 0;
}
.donut {
  width: 100%;
  height: auto;
  display: block;
}
.track {
  stroke: var(--bg-elev, var(--card));
}
.seg.correct {
  stroke: var(--success, #19c37d);
}
.seg.incorrect {
  stroke: var(--danger, #ff5c5c);
}
.seg.na {
  stroke: color-mix(in oklab, var(--muted) 60%, var(--bg));
}
.big {
  fill: var(--text);
  font-size: 20px;
  font-weight: 700;
}
.lbl {
  fill: var(--muted);
  font-size: 9px;
}

.side {
  flex: 1;
  min-width: 220px;
  display: grid;
  gap: 10px;
}
.score {
  color: var(--muted);
}
.score b {
  color: var(--text);
}

.legend {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: 6px;
}
.legend li {
  display: flex;
  align-items: center;
  gap: 8px;
}
.dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  flex-shrink: 0;
}
.dot.correct {
  background: var(--success, #19c37d);
}
.dot.incorrect {
  background: var(--danger, #ff5c5c);
}
.dot.na {
  background: color-mix(in oklab, var(--muted) 60%, var(--bg));
}
.lname {
  flex: 1;
}
.lval {
  color: var(--muted);
  font-size: var(--fz-14, 14px);
}

.hint {
  border: 1px solid
    color-mix(in oklab, var(--warning, #f5a623) 45%, var(--border));
  background: color-mix(in oklab, var(--warning, #f5a623) 10%, var(--bg));
  border-radius: 10px;
  padding: 10px 12px;
  color: var(--text);
  font-size: var(--fz-14, 14px);
}
</style>

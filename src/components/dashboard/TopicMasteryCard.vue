<!-- src/components/dashboard/TopicMasteryCard.vue -->
<script setup>
import { topicLabel } from "@/utils/topics";

defineProps({
  topics: { type: Array, default: () => [] }, // [{ topic, correct, total, accuracy }]
});

defineEmits(["select"]);

function pct(a) {
  return Math.round((a || 0) * 100);
}

function level(a) {
  if (a >= 0.72) return "strong";
  if (a >= 0.45) return "mid";
  return "weak";
}
</script>

<template>
  <article class="card">
    <div class="hdr">
      <div class="ttl">Владение темами</div>
      <div class="legend">
        <span class="lg weak">слабо</span>
        <span class="lg mid">средне</span>
        <span class="lg strong">уверенно</span>
      </div>
    </div>

    <div v-if="!topics.length" class="muted">
      Пройдите тест, чтобы увидеть владение темами.
    </div>

    <ul v-else class="list">
      <li
        v-for="t in topics"
        :key="t.topic"
        class="item"
        @click="$emit('select', t.topic)"
      >
        <div class="row">
          <span class="name"
            >{{ topicLabel(t.topic) }} <span class="arrow">→</span></span
          >
          <span class="acc" :class="level(t.accuracy)"
            >{{ pct(t.accuracy) }}%</span
          >
        </div>
        <div class="bar">
          <div
            class="fill"
            :class="level(t.accuracy)"
            :style="{ width: pct(t.accuracy) + '%' }"
          />
        </div>
        <div class="sub">{{ t.correct }} / {{ t.total }} верно</div>
      </li>
    </ul>
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
  flex-wrap: wrap;
}
.ttl {
  font-weight: 600;
}
.legend {
  display: flex;
  gap: 12px;
  font-size: 12px;
  color: var(--muted);
}
.lg {
  display: inline-flex;
  align-items: center;
  gap: 5px;
}
.lg::before {
  content: "";
  width: 8px;
  height: 8px;
  border-radius: 50%;
}
.lg.weak::before {
  background: var(--danger, #ff5c5c);
}
.lg.mid::before {
  background: var(--warning, #f5a623);
}
.lg.strong::before {
  background: var(--success, #19c37d);
}

.muted {
  color: var(--muted);
}

.list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 12px 24px;
}
.item {
  cursor: pointer;
  border-radius: 8px;
  padding: 6px;
  margin: -6px;
  transition: background 120ms ease;
}
.item:hover {
  background: var(--bg-elev, var(--card));
}
.arrow {
  color: var(--muted);
  opacity: 0;
  transition: opacity 120ms ease;
  font-weight: 400;
}
.item:hover .arrow {
  opacity: 1;
}
.row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}
.name {
  font-weight: 600;
}
.acc {
  font-size: var(--fz-14, 14px);
  font-weight: 600;
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
  color: var(--muted);
  font-size: 12px;
  margin-top: 5px;
}
</style>

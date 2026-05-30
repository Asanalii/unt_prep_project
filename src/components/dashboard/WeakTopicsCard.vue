<!-- src/components/dashboard/WeakTopicsCard.vue -->
<script setup>
import { computed } from "vue";

const props = defineProps({
  recommendation: { type: Object, default: null },
});

const topics = computed(() => props.recommendation?.weak_topics || []);
const isReady = computed(() => props.recommendation?.status === "ready");

function pct(accuracy) {
  return Math.round((accuracy || 0) * 100);
}
</script>

<template>
  <article class="card">
    <div class="hdr">
      <div class="ttl">Слабые темы</div>
      <span v-if="recommendation?.model_version" class="badge">
        {{ recommendation.model_version }}
      </span>
    </div>

    <div v-if="!recommendation" class="muted">
      Пройдите тест, чтобы увидеть рекомендации.
    </div>

    <div v-else-if="!isReady" class="muted">Анализ ещё идёт…</div>

    <div v-else-if="!topics.length" class="muted">
      Слабых тем не найдено — отличный результат.
    </div>

    <ul v-else class="list">
      <li v-for="topic in topics" :key="topic.topic" class="item">
        <div class="row">
          <span class="name">{{ topic.display_name || topic.topic }}</span>
          <span class="acc">{{ pct(topic.accuracy) }}%</span>
        </div>
        <div class="bar">
          <div class="fill" :style="{ width: pct(topic.accuracy) + '%' }" />
        </div>
        <div class="hint">{{ topic.recommendation }}</div>
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
  height: 100%;
}
.hdr {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
}
.ttl {
  font-weight: 600;
}
.badge {
  font-size: 11px;
  color: var(--muted);
  border: 1px solid var(--border);
  border-radius: 999px;
  padding: 2px 8px;
}
.muted {
  color: var(--muted);
}

.list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 12px 24px;
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
  color: var(--muted);
  font-size: var(--fz-14, 14px);
}
.bar {
  height: 6px;
  border-radius: 999px;
  background: var(--bg-elev, var(--card));
  overflow: hidden;
}
.fill {
  height: 100%;
  background: linear-gradient(
    90deg,
    var(--danger, #ff5c5c),
    var(--warning, #f5a623)
  );
}
.hint {
  color: var(--muted);
  font-size: var(--fz-14, 14px);
  margin-top: 6px;
}
</style>

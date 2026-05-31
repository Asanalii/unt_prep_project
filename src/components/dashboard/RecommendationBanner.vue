<!-- src/components/dashboard/RecommendationBanner.vue -->
<script setup>
import { computed } from "vue";
import { topicLabel } from "@/utils/topics";

const props = defineProps({
  recommendation: { type: Object, default: null },
});

const emit = defineEmits(["view"]);

const status = computed(() => props.recommendation?.status || null);

const topWeak = computed(() =>
  (props.recommendation?.weak_topics || []).slice(0, 3),
);

function pct(accuracy) {
  return Math.round((accuracy || 0) * 100);
}
</script>

<template>
  <div v-if="status" class="reco" :data-status="status">
    <!-- READY with weak topics -->
    <template v-if="status === 'ready' && topWeak.length">
      <div class="head">
        <div class="titles">
          <div class="t">Над чем поработать</div>
          <div class="s">
            По последнему тесту слабее всего эти темы - начни с них:
          </div>
        </div>
        <button class="btn" @click="emit('view', recommendation.attempt_id)">
          Подробнее →
        </button>
      </div>

      <div class="topics">
        <div v-for="w in topWeak" :key="w.topic" class="topic">
          <div class="trow">
            <span class="name">{{ topicLabel(w.topic) }}</span>
            <span class="acc">{{ pct(w.accuracy) }}%</span>
          </div>
          <div class="bar">
            <div class="fill" :style="{ width: pct(w.accuracy) + '%' }" />
          </div>
          <div class="cap">точность по теме</div>
        </div>
      </div>
    </template>

    <!-- PENDING -->
    <template v-else-if="status === 'pending'">
      <div class="simple">
        <span class="spinner" />
        <div>
          <div class="t">Анализируем ваш последний тест…</div>
          <div class="s">
            Рекомендации появятся через пару секунд, обновление автоматическое.
          </div>
        </div>
      </div>
    </template>

    <!-- READY, no weak topics -->
    <template v-else-if="status === 'ready'">
      <div class="simple">
        <div class="dot ok" />
        <div>
          <div class="t">Отличная работа!</div>
          <div class="s">
            По последнему тесту слабых тем не выявлено — так держать.
          </div>
        </div>
      </div>
    </template>

    <!-- FAILED -->
    <template v-else-if="status === 'failed'">
      <div class="simple">
        <div class="dot warn" />
        <div>
          <div class="t">Не удалось построить рекомендации</div>
          <div class="s">Попробуйте обновить страницу позже.</div>
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>
.reco {
  display: flex;
  flex-direction: column;
  gap: 14px;
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 14px;
  background: var(--bg);
}
.reco[data-status="ready"] {
  border-color: color-mix(in oklab, var(--accent-color) 40%, var(--border));
}
.reco[data-status="failed"] {
  border-color: color-mix(in oklab, var(--danger, crimson) 45%, var(--border));
}

/* header */
.head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}
.t {
  font-weight: 700;
}
.s {
  color: var(--muted);
  margin-top: 2px;
  font-size: var(--fz-14, 14px);
}
.btn {
  padding: 8px 14px;
  border-radius: 10px;
  border: 1px solid var(--accent-color);
  background: color-mix(in oklab, var(--accent-color) 16%, var(--bg));
  color: var(--text);
  cursor: pointer;
  white-space: nowrap;
  flex-shrink: 0;
}

/* weak topic cards */
.topics {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 12px;
}
.topic {
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 10px 12px;
  background: var(--bg-elev, var(--card));
}
.trow {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}
.name {
  font-weight: 600;
}
.acc {
  font-weight: 700;
  color: var(--danger, #ff5c5c);
}
.bar {
  height: 6px;
  border-radius: 999px;
  background: var(--bg);
  overflow: hidden;
}
.fill {
  height: 100%;
  border-radius: 999px;
  background: linear-gradient(
    90deg,
    var(--danger, #ff5c5c),
    var(--warning, #f5a623)
  );
}
.cap {
  color: var(--muted);
  font-size: 11px;
  margin-top: 6px;
}

/* simple single-line states */
.simple {
  display: flex;
  align-items: center;
  gap: 12px;
}
.dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: var(--accent-color);
  flex-shrink: 0;
}
.dot.ok {
  background: var(--success, #19c37d);
}
.dot.warn {
  background: var(--warning, #f5a623);
}
.spinner {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  border: 2px solid color-mix(in oklab, var(--accent-color) 30%, transparent);
  border-top-color: var(--accent-color);
  animation: spin 0.8s linear infinite;
  flex-shrink: 0;
}
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 640px) {
  .head {
    flex-direction: column;
  }
  .btn {
    align-self: flex-start;
  }
}
</style>

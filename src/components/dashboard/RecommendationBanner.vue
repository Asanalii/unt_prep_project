<!-- src/components/dashboard/RecommendationBanner.vue -->
<script setup>
import { computed } from "vue";

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
    <!-- PENDING -->
    <template v-if="status === 'pending'">
      <div class="left">
        <span class="spinner" />
        <div>
          <div class="t">Анализируем ваш последний тест…</div>
          <div class="s">
            Рекомендации появятся через пару секунд, обновление автоматическое.
          </div>
        </div>
      </div>
    </template>

    <!-- READY with weak topics -->
    <template v-else-if="status === 'ready' && topWeak.length">
      <div class="left">
        <div class="dot" />
        <div>
          <div class="t">Рекомендации по последнему тесту</div>
          <div class="chips">
            <span v-for="w in topWeak" :key="w.topic" class="chip">
              {{ w.display_name || w.topic }}
              <b>{{ pct(w.accuracy) }}%</b>
            </span>
          </div>
        </div>
      </div>
      <div class="right">
        <button class="btn" @click="emit('view', recommendation.attempt_id)">
          Подробнее
        </button>
      </div>
    </template>

    <!-- READY, no weak topics -->
    <template v-else-if="status === 'ready'">
      <div class="left">
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
      <div class="left">
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
  display: grid;
  grid-template-columns: 1fr auto;
  align-items: center;
  gap: 10px;
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 12px 14px;
  background: var(--bg);
}
.reco[data-status="ready"] {
  border-color: color-mix(in oklab, var(--accent-color) 45%, var(--border));
}
.reco[data-status="failed"] {
  border-color: color-mix(in oklab, var(--danger, crimson) 45%, var(--border));
}

.left {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
}
.t {
  font-weight: 700;
}
.s {
  color: var(--muted);
  margin-top: 2px;
  font-size: var(--fz-14, 14px);
}

.chips {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 6px;
}
.chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 3px 10px;
  border-radius: 999px;
  font-size: 12px;
  border: 1px solid var(--border);
  background: var(--bg-elev, var(--card));
}
.chip b {
  color: var(--danger, #ff5c5c);
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

.btn {
  padding: 8px 14px;
  border-radius: 10px;
  border: 1px solid var(--accent-color);
  background: color-mix(in oklab, var(--accent-color) 16%, var(--bg));
  color: var(--text);
  cursor: pointer;
  white-space: nowrap;
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
  .reco {
    grid-template-columns: 1fr;
  }
}
</style>

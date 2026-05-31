<!-- src/components/dashboard/ReadinessForecast.vue -->
<script setup>
import { computed } from "vue";

const props = defineProps({
  forecast: { type: Object, default: null },
});

const band = computed(() => {
  const p = props.forecast?.projectedPct ?? 0;
  if (p >= 80) return { label: "Готов к экзамену", cls: "green" };
  if (p >= 60) return { label: "На хорошем пути", cls: "yellow" };
  if (p >= 40) return { label: "В процессе", cls: "orange" };
  return { label: "Нужна серьёзная подготовка", cls: "red" };
});

const confidenceLabel = computed(() => {
  const c = props.forecast?.confidence;
  if (c === "high") return "высокая";
  if (c === "medium") return "средняя";
  return "низкая (мало тестов)";
});
</script>

<template>
  <article class="card">
    <div class="hdr">
      <div class="ttl">Прогноз готовности к ЕНТ</div>
      <div class="meta">проекция по последним тестам</div>
    </div>

    <div v-if="!forecast" class="muted">
      Пройдите тест, чтобы получить прогноз.
    </div>

    <div v-else class="body">
      <div class="headline">
        <div class="score">
          <span class="big">{{ forecast.projectedScore }}</span>
          <span class="den">/ {{ forecast.totalQuestions }}</span>
        </div>
        <div class="approx">≈ {{ forecast.projectedPct }}% правильных</div>
        <span class="band" :class="band.cls">{{ band.label }}</span>
      </div>

      <!-- gauge -->
      <div class="gauge">
        <div class="zones">
          <span class="z red" style="width: 40%" />
          <span class="z orange" style="width: 20%" />
          <span class="z yellow" style="width: 20%" />
          <span class="z green" style="width: 20%" />
        </div>
        <div class="marker" :style="{ left: forecast.projectedPct + '%' }">
          <div class="pin" />
        </div>
        <div class="scale">
          <span style="left: 0%">0</span>
          <span style="left: 40%">40</span>
          <span style="left: 60%">60</span>
          <span style="left: 80%">80</span>
          <span style="left: 100%">100</span>
        </div>
      </div>

      <div class="foot">
        <span
          v-if="forecast.trendDelta !== 0"
          class="trend"
          :class="forecast.trendDelta > 0 ? 'up' : 'down'"
        >
          {{ forecast.trendDelta > 0 ? "▲" : "▼" }}
          {{ Math.abs(forecast.trendDelta) }}% с первого теста
        </span>
        <span class="conf">
          уверенность прогноза: {{ confidenceLabel }} ({{ forecast.attempts }}
          {{ forecast.attempts === 1 ? "тест" : "тестов" }})
        </span>
      </div>

      <div class="note">
        Это ориентир по последним результатам, а не гарантия. Чем больше тестов
        — тем точнее прогноз.
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
  display: grid;
  gap: 14px;
}

.headline {
  display: flex;
  align-items: baseline;
  gap: 12px;
  flex-wrap: wrap;
}
.score {
  display: flex;
  align-items: baseline;
  gap: 4px;
}
.big {
  font-size: 32px;
  font-weight: 800;
  color: var(--accent-color);
  line-height: 1;
}
.den {
  color: var(--muted);
  font-size: 18px;
}
.approx {
  color: var(--muted);
}
.band {
  margin-left: auto;
  padding: 4px 12px;
  border-radius: 999px;
  font-size: 13px;
  font-weight: 600;
  border: 1px solid var(--border);
}
.band.red {
  color: var(--danger, #ff5c5c);
  border-color: color-mix(in oklab, var(--danger, #ff5c5c) 45%, var(--border));
}
.band.orange {
  color: var(--warning, #f5a623);
  border-color: color-mix(in oklab, var(--warning, #f5a623) 45%, var(--border));
}
.band.yellow {
  color: #d4c44a;
  border-color: color-mix(in oklab, #d4c44a 45%, var(--border));
}
.band.green {
  color: var(--success, #19c37d);
  border-color: color-mix(in oklab, var(--success, #19c37d) 45%, var(--border));
}

/* gauge */
.gauge {
  position: relative;
  padding-top: 8px;
}
.zones {
  display: flex;
  height: 10px;
  border-radius: 999px;
  overflow: hidden;
}
.z {
  height: 100%;
}
.z.red {
  background: color-mix(in oklab, var(--danger, #ff5c5c) 55%, transparent);
}
.z.orange {
  background: color-mix(in oklab, var(--warning, #f5a623) 55%, transparent);
}
.z.yellow {
  background: color-mix(in oklab, #d4c44a 55%, transparent);
}
.z.green {
  background: color-mix(in oklab, var(--success, #19c37d) 60%, transparent);
}
.marker {
  position: absolute;
  top: 4px;
  transform: translateX(-50%);
}
.pin {
  width: 3px;
  height: 18px;
  background: var(--text);
  border-radius: 2px;
  box-shadow: 0 0 0 2px var(--bg);
}
.scale {
  position: relative;
  height: 14px;
  margin-top: 6px;
}
.scale span {
  position: absolute;
  transform: translateX(-50%);
  color: var(--muted);
  font-size: 11px;
}
.scale span:first-child {
  transform: none;
}
.scale span:last-child {
  transform: translateX(-100%);
}

.foot {
  display: flex;
  gap: 14px;
  flex-wrap: wrap;
  align-items: center;
  font-size: var(--fz-14, 14px);
}
.trend {
  font-weight: 600;
}
.trend.up {
  color: var(--success, #19c37d);
}
.trend.down {
  color: var(--danger, #ff5c5c);
}
.conf {
  color: var(--muted);
}

.note {
  color: var(--muted);
  font-size: 12px;
}
</style>

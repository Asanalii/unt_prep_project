<script setup>
const props = defineProps({
  items: { type: Array, required: true },
});
</script>

<template>
  <div class="panel">
    <div class="panel-h"><h3>Разрез по предметам</h3></div>
    <div class="row">
      <div v-for="s in items" :key="s.id" class="card">
        <div class="t">{{ s.title }}</div>
        <div class="p">
          <b>{{ s.score }}</b
          ><span>/{{ s.max }}</span>
          <span class="pct">{{ s.pct }}%</span>
        </div>
        <div class="meta">
          Верных: {{ s.correct }}/{{ s.answered }} · Средн. время: ~{{
            s.avgTimeSec
          }}с
        </div>
        <div class="bar">
          <div class="fill" :style="{ width: s.pct + '%' }"></div>
        </div>
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
.row {
  display: grid;
  gap: 10px;
  grid-template-columns: repeat(12, minmax(0, 1fr));
}
.card {
  grid-column: span 4;
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 10px;
  background: var(--card);
}
@media (max-width: 1080px) {
  .card {
    grid-column: 1 / -1;
  }
}
.t {
  font-weight: 600;
  margin-bottom: 6px;
}
.p {
  display: flex;
  align-items: baseline;
  gap: 6px;
}
.pct {
  margin-left: auto;
  color: var(--muted);
}
.meta {
  color: var(--muted);
  font-size: 12px;
  margin-top: 4px;
}
.bar {
  height: 6px;
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: 6px;
  margin-top: 8px;
  overflow: hidden;
}
.fill {
  height: 100%;
  background: color-mix(in oklab, var(--accent-color) 35%, transparent);
}
</style>

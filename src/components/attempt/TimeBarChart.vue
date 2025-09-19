<script setup>
const props = defineProps({
  data: { type: Array, required: true }, // [{q, sec, qid}]
});
</script>

<template>
  <div class="bars">
    <div v-for="p in data" :key="p.qid" class="bar">
      <div class="label">{{ p.q }}</div>
      <div class="track">
        <div class="fill" :style="{ width: Math.min(p.sec, 180) + 'px' }"></div>
      </div>
      <div class="sec">{{ p.sec }}с</div>
    </div>
  </div>
</template>

<style scoped>
.bars {
  display: grid;
  gap: 6px;
}
.bar {
  display: grid;
  grid-template-columns: 24px 1fr auto;
  gap: 8px;
  align-items: center;
}
.label {
  color: var(--muted);
}
.track {
  height: 8px;
  border: 1px solid var(--border);
  border-radius: 6px;
  background: var(--bg);
  overflow: hidden;
}
.fill {
  height: 100%;
  background: color-mix(in oklab, dodgerblue 35%, var(--card));
}
.sec {
  color: var(--muted);
  font-size: 12px;
}
</style>

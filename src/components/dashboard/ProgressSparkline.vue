<template>
  <article class="card">
    <div class="hdr">
      <div class="ttl">{{ $t("dashboard.cards.trend") }}</div>
      <div class="meta">{{ periodLabel }}</div>
    </div>
    <div class="svgbox">
      <svg :viewBox="`0 0 ${w} ${h}`" preserveAspectRatio="none">
        <polyline
          :points="pointsAttr"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          opacity="0.9"
        />
      </svg>
    </div>
  </article>
</template>

<script setup>
import { computed } from "vue";
const props = defineProps({
  points: { type: Array, required: true }, // [0..100]
  period: { type: String, default: "7d" }, // '7d' | '30d'
});
const w = 200,
  h = 60,
  pad = 4;
const pointsAttr = computed(() => {
  if (!props.points.length) return "";
  const maxX = props.points.length - 1;
  return props.points
    .map((v, i) => {
      const x = pad + (i / maxX) * (w - pad * 2);
      const y = pad + (1 - v / 100) * (h - pad * 2);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
});
const periodLabel = computed(() => (props.period === "30d" ? "30d" : "7d"));
</script>

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
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}
.ttl {
  font-weight: 600;
}
.meta {
  color: var(--muted);
  font-size: 12px;
}
.svgbox {
  width: 100%;
  height: 64px;
  color: var(--accent-color);
}
svg {
  width: 100%;
  height: 100%;
  display: block;
}
</style>

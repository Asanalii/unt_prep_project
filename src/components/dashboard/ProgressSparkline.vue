<!-- src/components/dashboard/ProgressSparkline.vue -->
<script setup>
import { computed, ref } from "vue";

const props = defineProps({
  points: { type: Array, required: true }, // values 0..100 (percent score per attempt)
  period: { type: String, default: "7d" },
});

const gid = `spark-${Math.random().toString(36).slice(2, 8)}`;

// currently hovered data point (for the tooltip)
const hovered = ref(null);

// Fixed scale: Y is always 0..100%.
const yTicks = [100, 75, 50, 25, 0];

const n = computed(() => props.points.length);

// x/y as percentages inside the plot (viewBox 0..100)
function xPct(i) {
  return n.value > 1 ? (i / (n.value - 1)) * 100 : 50;
}
function yPct(v) {
  return (1 - v / 100) * 100; // 0% -> bottom (100), 100% -> top (0)
}

const coords = computed(() =>
  props.points.map((v, i) => ({ x: xPct(i), y: yPct(v), v, n: i + 1 })),
);

const linePoints = computed(() =>
  coords.value.map((p) => `${p.x.toFixed(2)},${p.y.toFixed(2)}`).join(" "),
);

const areaPath = computed(() => {
  const c = coords.value;
  if (c.length < 2) return "";
  const top = c.map((p) => `L${p.x.toFixed(2)},${p.y.toFixed(2)}`).join(" ");
  return `M${c[0].x.toFixed(2)},100 ${top} L${c[c.length - 1].x.toFixed(2)},100 Z`;
});

// thin out x labels if there are many attempts
const labelEvery = computed(() =>
  n.value <= 14 ? 1 : Math.ceil(n.value / 12),
);

const last = computed(() =>
  props.points.length ? props.points[props.points.length - 1] : 0,
);
const best = computed(() =>
  props.points.length ? Math.max(...props.points) : 0,
);
const periodLabel = computed(() => (props.period === "30d" ? "30d" : "7d"));
</script>

<template>
  <article class="card">
    <div class="hdr">
      <div class="ttl">{{ $t("dashboard.cards.trend") }}</div>
      <div class="meta">{{ periodLabel }}</div>
    </div>

    <div v-if="!points.length" class="empty">Нет данных</div>

    <template v-else>
      <div class="readout">
        <span class="big">{{ last }}%</span>
        <span class="sub">последний · лучший {{ best }}%</span>
      </div>

      <div class="chart">
        <!-- Y axis -->
        <div class="yaxis">
          <span
            v-for="t in yTicks"
            :key="t"
            class="ytick"
            :style="{ top: (1 - t / 100) * 100 + '%' }"
          >
            {{ t }}
          </span>
        </div>

        <!-- Plot -->
        <div class="plot">
          <svg viewBox="0 0 100 100" preserveAspectRatio="none">
            <defs>
              <linearGradient :id="gid" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="0%"
                  stop-color="currentColor"
                  stop-opacity="0.30"
                />
                <stop
                  offset="100%"
                  stop-color="currentColor"
                  stop-opacity="0"
                />
              </linearGradient>
            </defs>

            <!-- horizontal gridlines -->
            <line
              v-for="t in yTicks"
              :key="'g' + t"
              x1="0"
              :y1="(1 - t / 100) * 100"
              x2="100"
              :y2="(1 - t / 100) * 100"
              class="grid"
              vector-effect="non-scaling-stroke"
            />

            <path v-if="areaPath" :d="areaPath" :fill="`url(#${gid})`" />

            <polyline
              v-if="coords.length > 1"
              :points="linePoints"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linejoin="round"
              stroke-linecap="round"
              vector-effect="non-scaling-stroke"
            />
          </svg>

          <!-- data dots (HTML, so they stay perfectly round) -->
          <span
            v-for="p in coords"
            :key="'d' + p.n"
            class="dot"
            :class="{ lastdot: p.n === coords.length, active: hovered === p }"
            :style="{ left: p.x + '%', top: p.y + '%' }"
            @mouseenter="hovered = p"
            @mouseleave="hovered = null"
          />

          <!-- hover tooltip -->
          <div
            v-if="hovered"
            class="tip"
            :style="{ left: hovered.x + '%', top: hovered.y + '%' }"
          >
            <div class="tip-v">{{ hovered.v }}%</div>
            <div class="tip-n">Попытка {{ hovered.n }}</div>
          </div>
        </div>

        <!-- X axis -->
        <div class="xaxis">
          <span
            v-for="p in coords"
            :key="'x' + p.n"
            v-show="(p.n - 1) % labelEvery === 0 || p.n === coords.length"
            class="xtick"
            :style="{ left: p.x + '%' }"
          >
            {{ p.n }}
          </span>
        </div>
      </div>

      <div class="xtitle">Попытки</div>
    </template>
  </article>
</template>

<style scoped>
.card {
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 12px;
  background: var(--bg);
  height: 100%;
  display: flex;
  flex-direction: column;
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

.readout {
  display: flex;
  align-items: baseline;
  gap: 8px;
  margin-bottom: 10px;
}
.big {
  font-size: 22px;
  font-weight: 700;
  color: var(--accent-color);
}
.sub {
  color: var(--muted);
  font-size: 12px;
}

/* chart grid: [Y labels | plot], then X labels under the plot */
.chart {
  display: grid;
  grid-template-columns: 34px 1fr;
  column-gap: 6px;
  color: var(--accent-color);
}

.yaxis {
  position: relative;
  height: 180px;
}
.ytick {
  position: absolute;
  right: 0;
  transform: translateY(-50%);
  font-size: 11px;
  color: var(--muted);
}

.plot {
  position: relative;
  height: 180px;
}
.plot svg {
  width: 100%;
  height: 100%;
  display: block;
}
.grid {
  stroke: var(--border);
  stroke-width: 1;
}

.dot {
  position: absolute;
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--accent-color);
  transform: translate(-50%, -50%);
  border: 2px solid var(--bg);
  cursor: pointer;
  transition:
    width 120ms ease,
    height 120ms ease;
}
.dot.lastdot {
  width: 10px;
  height: 10px;
}
/* enlarge hit area for easier hovering without changing the visual much */
.dot::after {
  content: "";
  position: absolute;
  inset: -8px;
  border-radius: 50%;
}
.dot.active {
  width: 12px;
  height: 12px;
  box-shadow: 0 0 0 4px
    color-mix(in oklab, var(--accent-color) 25%, transparent);
}

.tip {
  position: absolute;
  transform: translate(-50%, calc(-100% - 12px));
  background: var(--bg-elev, var(--card));
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 6px 10px;
  text-align: center;
  pointer-events: none;
  white-space: nowrap;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.35);
  z-index: 2;
}
.tip-v {
  font-weight: 700;
  color: var(--accent-color);
  font-size: 14px;
  line-height: 1.1;
}
.tip-n {
  color: var(--muted);
  font-size: 11px;
  margin-top: 2px;
}
/* little arrow */
.tip::after {
  content: "";
  position: absolute;
  left: 50%;
  bottom: -5px;
  width: 8px;
  height: 8px;
  background: var(--bg-elev, var(--card));
  border-right: 1px solid var(--border);
  border-bottom: 1px solid var(--border);
  transform: translateX(-50%) rotate(45deg);
}

.xaxis {
  grid-column: 2;
  position: relative;
  height: 18px;
  margin-top: 4px;
}
.xtick {
  position: absolute;
  transform: translateX(-50%);
  font-size: 11px;
  color: var(--muted);
}

.xtitle {
  text-align: center;
  color: var(--muted);
  font-size: 12px;
  margin-top: 2px;
}

.empty {
  color: var(--muted);
  padding: 24px 0;
  text-align: center;
}
</style>

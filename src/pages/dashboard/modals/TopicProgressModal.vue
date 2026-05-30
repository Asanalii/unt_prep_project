<!-- src/components/dashboard/TopicProgressModal.vue -->
<script setup>
import { ref, computed, onMounted, onUnmounted } from "vue";
import { topicLabel } from "@/utils/topics";
import ProgressSparkline from "@/components/dashboard/ProgressSparkline.vue";

const props = defineProps({
  topic: { type: String, required: true },
  results: { type: Array, default: () => [] }, // all attempt results
});

const emit = defineEmits(["close"]);

const limit = ref(10);
const limitOptions = [10, 15, 20, "all"];

// one row per attempt that contains this topic, chronological
const series = computed(() =>
  props.results
    .map((r) => {
      const t = (r.topics || []).find((x) => x.topic === props.topic);
      if (!t) return null;
      const total = t.total || 0;
      const correct = t.correct || 0;
      return {
        attempt_id: r.attempt_id,
        finished_at: r.finished_at,
        correct,
        total,
        accuracy: total ? correct / total : 0,
        score: r.score,
        total_questions: r.total_questions,
      };
    })
    .filter(Boolean)
    .sort((a, b) => new Date(a.finished_at) - new Date(b.finished_at)),
);

const limited = computed(() =>
  limit.value === "all"
    ? series.value
    : series.value.slice(-Number(limit.value)),
);

const points = computed(() =>
  limited.value.map((s) => Math.round(s.accuracy * 100)),
);
const tableRows = computed(() => [...limited.value].reverse()); // newest first

const firstAcc = computed(() =>
  series.value.length ? series.value[0].accuracy : 0,
);
const lastAcc = computed(() =>
  series.value.length ? series.value[series.value.length - 1].accuracy : 0,
);
const delta = computed(() =>
  Math.round((lastAcc.value - firstAcc.value) * 100),
);

function pct(a) {
  return Math.round((a || 0) * 100);
}
function level(a) {
  if (a >= 0.72) return "strong";
  if (a >= 0.45) return "mid";
  return "weak";
}
function fmt(iso) {
  return iso ? new Date(iso).toLocaleString() : "—";
}

function onKey(e) {
  if (e.key === "Escape") emit("close");
}
onMounted(() => document.addEventListener("keydown", onKey));
onUnmounted(() => document.removeEventListener("keydown", onKey));
</script>

<template>
  <Teleport to="body">
    <div class="overlay" @click.self="emit('close')">
      <div class="modal">
        <div class="m-head">
          <div>
            <div class="m-ttl">{{ topicLabel(topic) }}</div>
            <div class="m-sub">Прогресс по теме во времени</div>
          </div>
          <button class="x" @click="emit('close')" aria-label="Закрыть">
            ✕
          </button>
        </div>

        <div class="m-body">
          <div v-if="!series.length" class="muted">
            Пока нет данных по этой теме.
          </div>

          <template v-else>
            <ProgressSparkline
              :points="points"
              :period="''"
              title="Точность по теме"
            />

            <div class="delta" :class="delta >= 0 ? 'up' : 'down'">
              {{ delta >= 0 ? "▲" : "▼" }} {{ Math.abs(delta) }}%
              <span class="muted">с первой попытки</span>
            </div>

            <div class="controls">
              <span class="muted">Показать:</span>
              <button
                v-for="opt in limitOptions"
                :key="opt"
                class="chip"
                :class="{ active: String(limit) === String(opt) }"
                @click="limit = opt"
              >
                {{ opt === "all" ? "все" : opt }}
              </button>
            </div>

            <div class="table-wrap">
              <table class="tbl">
                <thead>
                  <tr>
                    <th>Дата</th>
                    <th>Верно по теме</th>
                    <th>Точность</th>
                    <th>Балл за тест</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="row in tableRows" :key="row.attempt_id">
                    <td>{{ fmt(row.finished_at) }}</td>
                    <td>{{ row.correct }} / {{ row.total }}</td>
                    <td class="bold" :class="level(row.accuracy)">
                      {{ pct(row.accuracy) }}%
                    </td>
                    <td>{{ row.score }} / {{ row.total_questions }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </template>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.55);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  z-index: 1000;
}
.modal {
  width: 100%;
  max-width: 760px;
  max-height: 85vh;
  overflow: auto;
  background: var(--card, var(--bg));
  border: 1px solid var(--border);
  border-radius: 14px;
  padding: 16px;
}
.m-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 14px;
}
.m-ttl {
  font-size: 20px;
  font-weight: 700;
}
.m-sub {
  color: var(--muted);
  font-size: var(--fz-14, 14px);
  margin-top: 2px;
}
.x {
  border: 1px solid var(--border);
  background: var(--bg);
  color: var(--text);
  border-radius: 8px;
  width: 32px;
  height: 32px;
  cursor: pointer;
  flex-shrink: 0;
}

.m-body {
  display: grid;
  gap: 16px;
}
.muted {
  color: var(--muted);
}

.delta {
  font-size: var(--fz-14, 14px);
  font-weight: 600;
}
.delta.up {
  color: var(--success, #19c37d);
}
.delta.down {
  color: var(--danger, #ff5c5c);
}
.delta .muted {
  font-weight: 400;
  margin-left: 4px;
}

.controls {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}
.chip {
  border: 1px solid var(--border);
  background: var(--bg);
  color: var(--text);
  border-radius: 999px;
  padding: 4px 12px;
  font-size: 13px;
  cursor: pointer;
}
.chip.active {
  border-color: var(--accent-color);
  background: color-mix(in oklab, var(--accent-color) 16%, var(--bg));
}

.table-wrap {
  overflow: auto;
  border: 1px solid var(--border);
  border-radius: 12px;
}
.tbl {
  width: 100%;
  border-collapse: collapse;
  background: var(--bg);
}
th,
td {
  padding: 10px 12px;
  border-bottom: 1px solid var(--border);
  text-align: left;
}
thead th {
  position: sticky;
  top: 0;
  background: var(--bg-elev);
  font-size: 13px;
}
.bold {
  font-weight: 600;
}
.bold.weak {
  color: var(--danger, #ff5c5c);
}
.bold.mid {
  color: var(--warning, #f5a623);
}
.bold.strong {
  color: var(--success, #19c37d);
}
</style>

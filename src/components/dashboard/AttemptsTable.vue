<script setup>
import { computed } from "vue";

const props = defineProps({
  items: { type: Array, required: true }, // уже отфильтрованные
  i18n: { type: Object, required: false, default: () => ({}) },
});

const fmt = (iso) => (iso ? new Date(iso).toLocaleString() : "—");

const fmtDur = (sec) => {
  if (!sec && sec !== 0) return "—";
  const m = Math.floor(sec / 60);
  return `${m}m`;
};

const statusPill = (s) => {
  const map = {
    active: { label: "В процессе", cls: "pill blue" },
    hold: { label: "Пауза (ожидание)", cls: "pill orange" },
    approved: { label: "Разрешено продолжить", cls: "pill green" },
    done: { label: "Завершено", cls: "pill gray" },
    cancelled: { label: "Отменено", cls: "pill red" },
  };
  return map[s] || { label: s, cls: "pill" };
};

const columns = computed(() => [
  { key: "startedAt", label: "Начат" },
  { key: "status", label: "Статус" },
  { key: "subjects", label: "Предметы" },
  { key: "score", label: "Балл" },
  { key: "durationSec", label: "Длительность" },
  { key: "bankVersion", label: "Банк" },
  { key: "actions", label: "Действия" },
]);
</script>

<template>
  <div class="table-wrap">
    <table class="tbl">
      <thead>
        <tr>
          <th v-for="c in columns" :key="c.key">{{ c.label }}</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="a in items" :key="a.id">
          <td>{{ fmt(a.startedAt) }}</td>
          <td>
            <span :class="statusPill(a.status).cls">
              {{ statusPill(a.status).label }}
            </span>
          </td>
          <td class="mono">
            {{ a.subjects.join(", ") }}
          </td>
          <td class="bold">
            {{ a.score.total ?? "—" }}
          </td>
          <td>{{ fmtDur(a.durationSec) }}</td>
          <td class="mono">{{ a.bankVersion }}</td>
          <td class="actions">
            <button class="ghost" @click="$emit('open', a.id)">Открыть</button>
            <button
              v-if="a.status === 'approved'"
              class="primary"
              @click="$emit('resume', a.id)"
            >
              Продолжить
            </button>
          </td>
        </tr>
        <tr v-if="!items.length">
          <td colspan="7" class="empty">
            Пока нет попыток.
            <button class="primary" @click="$emit('new')">
              Начать первую попытку
            </button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
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
  z-index: 1;
}
.mono {
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 12px;
}
.bold {
  font-weight: 600;
}
.actions {
  display: flex;
  gap: 8px;
}
.primary {
  padding: 6px 10px;
  border-radius: 8px;
  background: var(--accent-color);
  color: #fff;
  border: 0;
}
.ghost {
  padding: 6px 10px;
  border-radius: 8px;
  border: 1px solid var(--border);
  background: var(--bg);
  color: var(--text);
}
.pill {
  padding: 2px 8px;
  border-radius: 999px;
  font-size: 12px;
  border: 1px solid var(--border);
}
.pill.blue {
  background: color-mix(in oklab, dodgerblue 14%, var(--card));
}
.pill.orange {
  background: color-mix(in oklab, orange 18%, var(--card));
}
.pill.green {
  background: color-mix(in oklab, mediumseagreen 16%, var(--card));
}
.pill.gray {
  background: color-mix(in oklab, gray 16%, var(--card));
}
.pill.red {
  background: color-mix(in oklab, crimson 16%, var(--card));
}
.empty {
  text-align: center;
  padding: 24px;
  color: var(--muted);
}
</style>

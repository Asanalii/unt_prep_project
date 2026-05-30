<!-- src/components/dashboard/AttemptsTable.vue -->
<script setup>
defineProps({
  items: { type: Array, required: true },
});

defineEmits(["open", "resume", "new"]);

const TOTAL_QUESTIONS = 40;

const SUBJECT_LABELS = {
  math: "Математика",
};

const fmt = (iso) => (iso ? new Date(iso).toLocaleString() : "—");

function subjectLabel(code) {
  return SUBJECT_LABELS[code] || code;
}

function statusPill(status) {
  const map = {
    in_progress: { label: "В процессе", cls: "pill blue" },
    finished: { label: "Завершено", cls: "pill green" },
    timed_out: { label: "Время вышло", cls: "pill orange" },
  };
  return map[status] || { label: status, cls: "pill" };
}

function scoreLabel(attempt) {
  if (attempt.status !== "finished") return "—";
  return `${attempt.score ?? 0} / ${TOTAL_QUESTIONS}`;
}
</script>

<template>
  <div class="table-wrap">
    <table class="tbl">
      <thead>
        <tr>
          <th>Начат</th>
          <th>Предмет</th>
          <th>Статус</th>
          <th>Балл</th>
          <th>Действия</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="a in items" :key="a.attempt_id">
          <td>{{ fmt(a.started_at) }}</td>
          <td>{{ subjectLabel(a.subject) }}</td>
          <td>
            <span :class="statusPill(a.status).cls">
              {{ statusPill(a.status).label }}
            </span>
          </td>
          <td class="bold">{{ scoreLabel(a) }}</td>
          <td class="actions">
            <button
              v-if="a.status === 'in_progress'"
              class="primary"
              @click="$emit('resume', a.attempt_id)"
            >
              Продолжить
            </button>
            <button v-else class="ghost" @click="$emit('open', a.attempt_id)">
              Открыть
            </button>
          </td>
        </tr>

        <tr v-if="!items.length">
          <td colspan="5" class="empty">
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
  cursor: pointer;
}
.ghost {
  padding: 6px 10px;
  border-radius: 8px;
  border: 1px solid var(--border);
  background: var(--bg);
  color: var(--text);
  cursor: pointer;
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
.pill.green {
  background: color-mix(in oklab, mediumseagreen 16%, var(--card));
}
.pill.orange {
  background: color-mix(in oklab, orange 18%, var(--card));
}
.empty {
  text-align: center;
  padding: 24px;
  color: var(--muted);
}
</style>

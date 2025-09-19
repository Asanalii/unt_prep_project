<script setup>
import { ref, computed, watch, toRefs } from "vue";
import { useI18n } from "vue-i18n";
import { fmtDateTime, fmtDuration } from "@/helpers/format";

const props = defineProps({
  attempts: { type: Array, required: true },
  filters: { type: Object, required: true },
  loading: { type: Boolean, default: false },
});
const emit = defineEmits(["update:filters", "open-attempt"]);

const { t } = useI18n();

const subjects = [
  { id: "history", name: t("subjects.history") },
  { id: "literacy", name: t("ent.literacy") },
  { id: "mathlit", name: t("ent.math_literacy") },
  { id: "math", name: t("subjects.math") },
  { id: "cs", name: t("subjects.cs") },
];

const local = ref({ ...props.filters });
watch(
  () => props.filters,
  (v) => (local.value = { ...v })
);

function apply() {
  emit("update:filters", { ...local.value });
}
function reset() {
  emit("update:filters", {
    q: "",
    subject: "all",
    status: "all",
    dateFrom: null,
    dateTo: null,
    sort: "-startedAt",
  });
}

const computedRows = computed(() => {
  const sMap = new Map(subjects.map((s) => [s.id, s.name]));
  let rows = props.attempts.map((a) => ({
    ...a,
    subjectName: sMap.get(a.subject) || a.subject,
  }));

  // search
  const q = (local.value.q || "").trim().toLowerCase();
  if (q) {
    rows = rows.filter(
      (a) =>
        a.subjectName.toLowerCase().includes(q) ||
        (a.meta?.title || "").toLowerCase().includes(q)
    );
  }
  // subject
  if (local.value.subject !== "all") {
    rows = rows.filter((a) => a.subject === local.value.subject);
  }
  // status
  if (local.value.status !== "all") {
    rows = rows.filter((a) => a.status === local.value.status);
  }
  // dates
  if (local.value.dateFrom) {
    const from = new Date(local.value.dateFrom + "T00:00:00");
    rows = rows.filter((a) => new Date(a.startedAt) >= from);
  }
  if (local.value.dateTo) {
    const to = new Date(local.value.dateTo + "T23:59:59");
    rows = rows.filter((a) => new Date(a.startedAt) <= to);
  }
  // sort
  const s = local.value.sort || "-startedAt";
  const dir = s.startsWith("-") ? -1 : 1;
  const key = s.replace(/^-/, "");
  rows.sort((a, b) => {
    const av = key === "score" ? a.score ?? -Infinity : new Date(a[key]);
    const bv = key === "score" ? b.score ?? -Infinity : new Date(b[key]);
    if (av < bv) return -1 * dir;
    if (av > bv) return 1 * dir;
    return 0;
  });

  return rows;
});
</script>

<template>
  <section class="wrap">
    <div class="toolbar">
      <input
        :placeholder="$t('dashboard.filters.search')"
        v-model="local.q"
        class="inp"
        type="search"
      />
      <select v-model="local.subject" class="inp">
        <option value="all">{{ $t("dashboard.filters.subject_all") }}</option>
        <option v-for="s in subjects" :key="s.id" :value="s.id">
          {{ s.name }}
        </option>
      </select>
      <select v-model="local.status" class="inp">
        <option value="all">{{ $t("dashboard.filters.status_all") }}</option>
        <option value="completed">
          {{ $t("dashboard.filters.status_completed") }}
        </option>
        <option value="in_progress">
          {{ $t("dashboard.filters.status_in_progress") }}
        </option>
        <option value="review_required">
          {{ $t("dashboard.filters.status_review_required") }}
        </option>
      </select>

      <input v-model="local.dateFrom" class="inp" type="date" />
      <input v-model="local.dateTo" class="inp" type="date" />

      <select v-model="local.sort" class="inp">
        <option value="-startedAt">{{ $t("dashboard.sort.newest") }}</option>
        <option value="startedAt">{{ $t("dashboard.sort.oldest") }}</option>
        <option value="-score">{{ $t("dashboard.sort.score_desc") }}</option>
        <option value="score">{{ $t("dashboard.sort.score_asc") }}</option>
      </select>

      <button class="btn" @click="apply">{{ $t("dashboard.apply") }}</button>
      <button class="btn ghost" @click="reset">
        {{ $t("dashboard.reset") }}
      </button>
    </div>

    <div class="tablebox" v-if="!loading">
      <table class="tbl">
        <thead>
          <tr>
            <th>{{ $t("dashboard.table.subject") }}</th>
            <th>{{ $t("dashboard.table.started") }}</th>
            <th>{{ $t("dashboard.table.duration") }}</th>
            <th>{{ $t("dashboard.table.score") }}</th>
            <th>{{ $t("dashboard.table.status") }}</th>
            <th class="r">{{ $t("dashboard.table.actions") }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="a in computedRows" :key="a.id">
            <td>{{ a.subjectName }}</td>
            <td>{{ fmtDateTime(a.startedAt) }}</td>
            <td>{{ fmtDuration(a.durationSec) }}</td>
            <td>{{ a.score != null ? a.score + "%" : "—" }}</td>
            <td>
              <span class="badge" :data-type="a.status">
                {{ $t("dashboard.status." + a.status) }}
              </span>
            </td>
            <td class="r">
              <button class="btn" @click="$emit('open-attempt', a.id)">
                {{ $t("dashboard.view") }}
              </button>
            </td>
          </tr>
          <tr v-if="computedRows.length === 0">
            <td colspan="6" class="empty">{{ $t("dashboard.empty") }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-else class="loading">{{ $t("dashboard.loading") }}</div>
  </section>
</template>

<style scoped>
.wrap {
  border: 1px solid var(--border);
  border-radius: 12px;
  background: var(--bg);
}
.toolbar {
  display: grid;
  grid-template-columns: 1fr repeat(5, minmax(140px, auto)) auto auto;
  gap: 8px;
  padding: 12px;
  border-bottom: 1px solid var(--border);
}
.inp {
  width: 100%;
  padding: 8px 10px;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: var(--bg);
  color: var(--text);
}
.btn {
  padding: 8px 12px;
  border: 1px solid var(--border);
  background: var(--bg);
  color: var(--text);
  border-radius: 8px;
  cursor: pointer;
}
.btn.ghost {
  background: var(--card);
}
.tablebox {
  overflow: auto;
}
.tbl {
  width: 100%;
  border-collapse: collapse;
}
th,
td {
  padding: 10px;
  border-bottom: 1px solid var(--border);
  text-align: left;
}
th {
  background: var(--bg-elev);
  position: sticky;
  top: 0;
  z-index: 1;
}
.r {
  text-align: right;
}
.badge {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 999px;
  font-size: 12px;
  border: 1px solid var(--border);
  background: var(--card);
}
.badge[data-type="completed"] {
  border-color: #2e7d32;
}
.badge[data-type="in_progress"] {
  border-color: #f57c00;
}
.badge[data-type="review_required"] {
  border-color: #6a1b9a;
}
.loading,
.empty {
  padding: 20px;
  text-align: center;
  color: var(--muted);
}
@media (max-width: 1080px) {
  .toolbar {
    grid-template-columns: 1fr 150px 150px 1fr 1fr 170px auto auto;
  }
}
@media (max-width: 820px) {
  .toolbar {
    grid-template-columns: 1fr 150px 150px 1fr 1fr;
  }
  .toolbar .btn.ghost,
  .toolbar select:nth-of-type(3) {
    display: none;
  }
}
</style>

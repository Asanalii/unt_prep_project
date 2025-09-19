<script setup>
import { useRouter } from "vue-router";

import { useDashboardData } from "@/composables/useDashboardData";

import DashboardHeader from "@/components/dashboard/DashboardHeader.vue";

import StatsCards from "@/components/dashboard/StatsCards.vue";
import ProgressSparkline from "@/components/dashboard/ProgressSparkline.vue";
import DeadlinesCard from "@/components/dashboard/DeadlinesCard.vue";

import ResumeBanner from "@/components/dashboard/ResumeBanner.vue";
import WeakStrongTopics from "@/components/dashboard/WeakStrongTopics.vue";
import ActivityFeed from "@/components/dashboard/ActivityFeed.vue";

import AttemptsTable from "@/components/dashboard/AttemptsTable.vue";
import AttemptFiltersBar from "@/components/dashboard/AttemptFiltersBar.vue";

import { useAttempts } from "@/composables/useAttempts";
import { useAttemptFilters } from "@/composables/useAttemptFilters";

const router = useRouter();

// ----- данные дэшки
const {
  user,
  fetchAll,
  hold,
  approvedResume,
  weakTopics,
  strongTopics,
  activity,
} = useDashboardData();

function reload() {
  fetchAll();
}

const examDate = new Date("2025-11-20");

// ----- попытки + фильтры
const { attempts, summary, trend } = useAttempts();
const { q, status, subject, sort, filtered } = useAttemptFilters(attempts);

// alias-функции для кнопок
function openAttempt(id) {
  // console.debug("View (read-only):", id);
  router.push({ name: "attempt", params: { id } });
}
function startNewAttempt() {
  console.debug("Start new attempt flow");
}
function resumeAttempt() {
  console.debug("Resume with token flow");
}

// фильтры: apply/reactive и reset
function apply() {
  // всё реактивно, поэтому здесь ничего не делаем
}
function reset() {
  q.value = "";
  status.value = "all";
  subject.value = "all";
  sort.value = "date_desc";
}
</script>

<template>
  <div class="dash">
    <DashboardHeader :user="user" :summary="summary" :on-refresh="reload" />

    <ResumeBanner
      class="mt"
      :hold="hold"
      :approved="approvedResume"
      @start-new="startNewAttempt"
      @resume="resumeAttempt"
    />

    <section class="grid g-top mt">
      <StatsCards :summary="summary" />
      <ProgressSparkline :points="trend.points" :period="trend.period" />
      <WeakStrongTopics :weak="weakTopics" :strong="strongTopics" />
      <DeadlinesCard :exam-date="examDate" />
    </section>

    <section class="panel">
      <div class="panel-h">
        <h3>Мои попытки</h3>
        <button class="primary" @click="startNewAttempt">Новая попытка</button>
      </div>

      <AttemptFiltersBar
        :q="q"
        :status="status"
        :subject="subject"
        :sort="sort"
        @update:q="(v) => (q.value = v)"
        @update:status="(v) => (status.value = v)"
        @update:subject="(v) => (subject.value = v)"
        @update:sort="(v) => (sort.value = v)"
        @apply="apply"
        @reset="reset"
      />

      <AttemptsTable
        :items="filtered"
        @open="openAttempt"
        @resume="resumeAttempt"
        @new="startNewAttempt"
      />
    </section>

    <ActivityFeed class="mt" :items="activity" />
  </div>
</template>

<style scoped>
.dash {
  padding: 16px;
  display: grid;
  gap: 16px;
  grid-auto-rows: min-content;
}
.mt {
  margin-top: 6px;
}

.grid.g-top {
  display: grid;
  gap: 12px;
  grid-template-columns: repeat(12, minmax(0, 1fr));
}
/* защита от «наездов» */
.grid.g-top > * {
  min-width: 0;
  min-height: 0;
}

.grid.g-top > :nth-child(1) {
  grid-column: span 4;
} /* StatsCards */
.grid.g-top > :nth-child(2) {
  grid-column: span 4;
} /* Sparkline */
.grid.g-top > :nth-child(3) {
  grid-column: span 4;
} /* Weak/Strong */
.grid.g-top > :nth-child(4) {
  grid-column: 1 / -1;
} /* Deadlines */

@media (max-width: 1080px) {
  .grid.g-top > * {
    grid-column: 1 / -1;
  }
}

.panel {
  border: 1px solid var(--border);
  border-radius: 14px;
  padding: 12px;
  background: var(--bg);
}
.panel-h {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
}
.primary {
  padding: 8px 12px;
  border-radius: 10px;
  background: var(--accent-color);
  color: #fff;
  border: 0;
}
</style>

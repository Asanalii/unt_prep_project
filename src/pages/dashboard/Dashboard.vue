<!-- src/pages/Dashboard.vue -->
<script setup>
import { ref, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";

import { useAuthStore } from "@/stores/auth";
import { useDashboard } from "@/composables/useDashboard";

import DashboardHeader from "@/components/dashboard/DashboardHeader.vue";
import StatsCards from "@/components/dashboard/StatsCards.vue";
import ReadinessForecast from "@/components/dashboard/ReadinessForecast.vue";
import LastTestSummary from "@/components/dashboard/LastTestSummary.vue";
import ProgressSparkline from "@/components/dashboard/ProgressSparkline.vue";
import DifficultyBreakdown from "@/components/dashboard/DifficultyBreakdown.vue";
import RecommendationBanner from "@/components/dashboard/RecommendationBanner.vue";
import WeakTopicsCard from "@/components/dashboard/WeakTopicsCard.vue";
import TopicMasteryCard from "@/components/dashboard/TopicMasteryCard.vue";
import TopicProgressModal from "./modals/TopicProgressModal.vue";
import AttemptsTable from "@/components/dashboard/AttemptsTable.vue";
// import DeadlinesCard from "@/components/dashboard/DeadlinesCard.vue"; // не нужно пока

const router = useRouter();
const route = useRoute();
const auth = useAuthStore();

const {
  loading,
  attempts,
  recommendation,
  results,
  summary,
  trend,
  lastResult,
  forecast,
  topicMastery,
  difficultyMastery,
  timeStats,
  fetchAll,
} = useDashboard();

const selectedTopic = ref(null);

// const examDate = "2025-11-20"; // дедлайн пока не используем

onMounted(fetchAll);

function reload() {
  fetchAll();
}

function openAttempt(attemptId) {
  router.push({
    name: "attempt",
    params: { locale: route.params.locale, id: attemptId },
  });
}

function resumeAttempt(attemptId) {
  router.push({
    name: "test-run",
    params: { locale: route.params.locale },
    query: { attemptId },
  });
}

function startNewAttempt() {
  // route name of the tests list page — adjust if yours differs
  router.push({ name: "tests", params: { locale: route.params.locale } });
}
</script>

<template>
  <div class="dash">
    <DashboardHeader
      :user="auth.user || {}"
      :summary="summary"
      :on-refresh="reload"
    />

    <RecommendationBanner
      v-if="recommendation"
      :recommendation="recommendation"
      @view="openAttempt"
    />

    <!-- 1. Карточки статистики -->
    <StatsCards :summary="summary" />

    <!-- 2. Прогноз готовности к ЕНТ -->
    <ReadinessForecast :forecast="forecast" />

    <!-- 3. Сводка последнего теста -->
    <LastTestSummary :result="lastResult" />

    <!-- 4. График динамики -->
    <ProgressSparkline :points="trend.points" :period="trend.period" />

    <!-- 5. Разбор по сложности + время -->
    <DifficultyBreakdown :difficulty="difficultyMastery" :time="timeStats" />

    <!-- 6. Слабые темы -->
    <WeakTopicsCard :recommendation="recommendation" />

    <!-- 7. Карта владения темами -->
    <TopicMasteryCard :topics="topicMastery" @select="selectedTopic = $event" />

    <!-- Мои попытки -->
    <section class="panel">
      <div class="panel-h">
        <h3>Мои попытки</h3>
        <button class="primary" @click="startNewAttempt">Новая попытка</button>
      </div>

      <div v-if="loading" class="muted">Загрузка…</div>
      <AttemptsTable
        v-else
        :items="attempts"
        @open="openAttempt"
        @resume="resumeAttempt"
        @new="startNewAttempt"
      />
    </section>

    <TopicProgressModal
      v-if="selectedTopic"
      :topic="selectedTopic"
      :results="results"
      @close="selectedTopic = null"
    />
  </div>
</template>

<style scoped>
.dash {
  padding: 16px;
  display: grid;
  gap: 16px;
  grid-auto-rows: min-content;
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
  cursor: pointer;
}
.muted {
  color: var(--muted);
}
</style>

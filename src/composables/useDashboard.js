// src/composables/useDashboard.js
import { ref, computed, onUnmounted } from "vue";

import { fetchMyAttempts } from "@/pages/dashboard/api/assessment";
import { fetchLatestRecommendation } from "@/pages/dashboard/api/ml";

// Math test has 40 questions; score is the number of correct answers.
const TOTAL_QUESTIONS = 40;

export function useDashboard() {
  const loading = ref(false);
  const attempts = ref([]);
  const recommendation = ref(null);

  const finishedAttempts = computed(() =>
    attempts.value.filter((a) => a.status === "finished"),
  );

  const summary = computed(() => {
    const list = attempts.value;
    const finished = finishedAttempts.value;
    const inProgress = list.filter((a) => a.status === "in_progress");

    const avgScore = finished.length
      ? Math.round(
          finished.reduce(
            (sum, a) => sum + ((a.score || 0) / TOTAL_QUESTIONS) * 100,
            0,
          ) / finished.length,
        )
      : 0;

    return {
      totalAttempts: list.length,
      avgScore,
      completed: finished.length,
      inProgress: inProgress.length,
    };
  });

  const trend = computed(() => {
    const points = [...finishedAttempts.value]
      .sort((a, b) => new Date(a.finished_at) - new Date(b.finished_at))
      .map((a) => Math.round(((a.score || 0) / TOTAL_QUESTIONS) * 100));

    return { points: points.length ? points : [0], period: "7d" };
  });

  async function loadAttempts() {
    const res = await fetchMyAttempts();
    attempts.value = res?.data || [];
  }

  async function loadRecommendation() {
    const res = await fetchLatestRecommendation();
    recommendation.value = res?.data || null;
  }

  // ----- polling: keep refreshing while the recommendation is still computing
  let pollTimer = null;

  function stopPolling() {
    if (pollTimer) {
      clearInterval(pollTimer);
      pollTimer = null;
    }
  }

  function maybePoll() {
    stopPolling();
    if (recommendation.value?.status === "pending") {
      pollTimer = setInterval(async () => {
        await loadRecommendation();
        if (recommendation.value?.status !== "pending") stopPolling();
      }, 3000);
    }
  }

  async function fetchAll() {
    loading.value = true;
    try {
      await Promise.all([loadAttempts(), loadRecommendation()]);
      maybePoll();
    } finally {
      loading.value = false;
    }
  }

  onUnmounted(stopPolling);

  return {
    loading,
    attempts,
    recommendation,
    summary,
    trend,
    fetchAll,
    loadRecommendation,
  };
}

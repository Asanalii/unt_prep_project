// src/composables/useDashboard.js
import { ref, computed, onUnmounted } from "vue";

import {
  fetchMyAttempts,
  fetchAllResults,
} from "@/pages/dashboard/api/assessment";
import { fetchLatestRecommendation } from "@/pages/dashboard/api/ml";

// Math test has 40 questions; score is the number of correct answers.
const TOTAL_QUESTIONS = 40;

export function useDashboard() {
  const loading = ref(false);
  const attempts = ref([]);
  const recommendation = ref(null);
  const results = ref([]); // per-attempt result details (for future learning curves)
  const topicMastery = ref([]); // aggregated accuracy per topic (from backend)

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

  // most recent finished attempt's full result (for the summary donut)
  const lastResult = computed(() => {
    if (!results.value.length) return null;
    return [...results.value].sort(
      (a, b) => new Date(b.finished_at) - new Date(a.finished_at),
    )[0];
  });

  // ENT readiness forecast: a recency-weighted projection of recent test scores.
  // NOTE: heuristic projection, not the ML model — clearly framed as an estimate.
  const forecast = computed(() => {
    const finished = [...finishedAttempts.value].sort(
      (a, b) => new Date(a.finished_at) - new Date(b.finished_at),
    );
    if (!finished.length) return null;

    const pcts = finished.map((a) => ((a.score || 0) / TOTAL_QUESTIONS) * 100);
    const recent = pcts.slice(-3); // last up to 3 tests
    const weights = recent.map((_, i) => i + 1); // most recent weighs most
    const wsum = weights.reduce((s, w) => s + w, 0);

    const projectedPct = Math.round(
      recent.reduce((s, p, i) => s + p * weights[i], 0) / wsum,
    );
    const projectedScore = Math.round((projectedPct / 100) * TOTAL_QUESTIONS);
    const trendDelta = Math.round(pcts[pcts.length - 1] - pcts[0]);
    const n = finished.length;
    const confidence = n >= 5 ? "high" : n >= 3 ? "medium" : "low";

    return {
      projectedPct,
      projectedScore,
      totalQuestions: TOTAL_QUESTIONS,
      trendDelta,
      confidence,
      attempts: n,
    };
  });

  async function loadAttempts() {
    const res = await fetchMyAttempts();
    attempts.value = res?.data || [];
  }

  async function loadRecommendation() {
    const res = await fetchLatestRecommendation();
    recommendation.value = res?.data || null;
  }

  // single call -> backend computes every finished attempt + topic mastery
  async function loadResults() {
    const res = await fetchAllResults();
    results.value = res?.data?.attempts || [];
    topicMastery.value = res?.data?.topic_mastery || [];
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
      // all three are independent now -> run in parallel
      await Promise.all([loadAttempts(), loadRecommendation(), loadResults()]);
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
    results,
    summary,
    trend,
    lastResult,
    forecast,
    topicMastery,
    fetchAll,
    loadRecommendation,
  };
}

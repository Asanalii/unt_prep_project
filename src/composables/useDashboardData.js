import { ref, computed } from "vue";

export function useDashboardData() {
  const user = ref({
    id: "u1",
    email: "student@example.com",
    name: "Aruzhan T.",
  });

  // Моки попыток (read-only, нельзя продолжить)
  const attempts = ref([
    {
      id: "a1",
      subject: "math",
      startedAt: "2025-09-15T09:10:00Z",
      durationSec: 47 * 60,
      score: 72,
      status: "completed", // completed | in_progress | review_required
      meta: { title: "Алгебра. Блок A" },
    },
    {
      id: "a2",
      subject: "history",
      startedAt: "2025-09-17T12:30:00Z",
      durationSec: 52 * 60,
      score: 81,
      status: "completed",
      meta: { title: "История Казахстана. Раздел 2" },
    },
    {
      id: "a3",
      subject: "cs",
      startedAt: "2025-09-20T08:00:00Z",
      durationSec: 35 * 60,
      score: null,
      status: "review_required",
      meta: { title: "CS. Алгоритмы (свободные ответы)" },
    },
    {
      id: "a4",
      subject: "literacy",
      startedAt: "2025-09-22T07:00:00Z",
      durationSec: 60 * 60,
      score: 64,
      status: "completed",
      meta: { title: "Чит. грамотность. Практикум" },
    },
    {
      id: "a5",
      subject: "mathlit",
      startedAt: "2025-09-23T10:45:00Z",
      durationSec: 42 * 60,
      score: 55,
      status: "in_progress", // отображаем как «есть незавершённая», но продолжать нельзя
      meta: { title: "Матем. грамотность. Тест №3" },
    },
  ]);

  const loading = ref(false);

  const summary = computed(() => {
    const total = attempts.value.length;
    const done = attempts.value.filter((a) => a.status === "completed").length;
    const inProg = attempts.value.filter(
      (a) => a.status === "in_progress"
    ).length;
    const scored = attempts.value.filter((a) => typeof a.score === "number");
    const avg = scored.length
      ? Math.round(scored.reduce((s, a) => s + a.score, 0) / scored.length)
      : 0;
    return {
      totalAttempts: total,
      completed: done,
      inProgress: inProg,
      avgScore: avg,
    };
  });

  async function fetchAll() {
    loading.value = true;
    // имитация запроса
    await new Promise((r) => setTimeout(r, 400));
    loading.value = false;
  }

  return {
    user,
    attempts,
    summary,
    loading,
    fetchAll,
  };
}

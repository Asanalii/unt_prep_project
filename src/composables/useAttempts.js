import { ref, computed } from "vue";

export function useAttempts() {
  // Моки попыток (id, дата, статус, балл и предметы этой попытки)
  const attempts = ref([
    {
      id: "a86",
      startedAt: "2025-09-23T15:45:00Z",
      finishedAt: null,
      status: "hold", // active | hold | approved | done | cancelled
      subjects: ["mathlit", "history", "math"],
      score: { total: null, bySubject: {} },
      durationSec: 2520, // если закончена — итоговая, если нет — прошедшее на момент паузы
      bankVersion: "2025.09",
    },
    {
      id: "a85",
      startedAt: "2025-09-20T10:10:00Z",
      finishedAt: "2025-09-20T11:05:00Z",
      status: "done",
      subjects: ["literacy", "mathlit", "history"],
      score: {
        total: 69,
        bySubject: { literacy: 24, mathlit: 22, history: 23 },
      },
      durationSec: 3300,
      bankVersion: "2025.09",
    },
    {
      id: "a84",
      startedAt: "2025-09-14T12:00:00Z",
      finishedAt: "2025-09-14T12:48:00Z",
      status: "done",
      subjects: ["math", "cs", "history"],
      score: { total: 73, bySubject: { math: 26, cs: 22, history: 25 } },
      durationSec: 2880,
      bankVersion: "2025.08",
    },
    {
      id: "a83",
      startedAt: "2025-09-07T09:00:00Z",
      finishedAt: "2025-09-07T09:51:00Z",
      status: "done",
      subjects: ["mathlit", "cs", "literacy"],
      score: { total: 62, bySubject: { mathlit: 18, cs: 22, literacy: 22 } },
      durationSec: 3060,
      bankVersion: "2025.08",
    },
  ]);

  // сводка для верхних карточек
  const summary = computed(() => {
    const total = attempts.value.length;
    const done = attempts.value.filter((a) => a.status === "done");
    const active = attempts.value.filter((a) => a.status === "active").length;
    const hold = attempts.value.filter((a) => a.status === "hold").length;
    const avgScore = done.length
      ? Math.round(
          done.reduce((s, a) => s + (a.score.total || 0), 0) / done.length
        )
      : 0;
    const bestScore = done.length
      ? Math.max(...done.map((a) => a.score.total || 0))
      : 0;
    return { total, active, hold, avgScore, bestScore };
  });

  // тренд для спарклайна (баллы по датам завершённых)
  const trend = computed(() => {
    const pts = attempts.value
      .filter((a) => a.status === "done")
      .sort((a, b) => new Date(a.finishedAt) - new Date(b.finishedAt))
      .map((a) => ({ x: new Date(a.finishedAt).getTime(), y: a.score.total }));
    return { period: "7d", points: pts };
  });

  return { attempts, summary, trend };
}

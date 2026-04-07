import { ref, computed } from "vue";

export function useDashboardData() {
  const user = ref({
    id: "u1",
    email: "student@example.com",
    name: "Asan T.",
  });

  // === Статусы попыток (read-only список внизу)
  const attempts = ref([
    {
      id: "a1",
      subject: "math",
      startedAt: "2025-09-15T09:10:00Z",
      durationSec: 47 * 60,
      score: 72,
      status: "completed",
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
      id: "a5",
      subject: "mathlit",
      startedAt: "2025-09-23T10:45:00Z",
      durationSec: 42 * 60,
      score: 55,
      status: "in_progress",
      meta: { title: "Матем. грамотность. Тест №3" },
    },
  ]);

  // === Сводка
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

  // === Hold / Approved (анти-читинг витрины)
  // Одна из них может быть не null
  const hold = ref({ attemptId: "a6", since: "2025-09-24T07:10:00Z" }); // ожидание разрешения
  const approvedResume = ref(null);
  // пример разрешения:
  // const approvedResume = ref({ attemptId: 'a6', until: '2025-09-24T12:00:00Z' }); hold.value = null

  // === Тренд (для спарклайна)
  const trend = ref({
    period: "7d",
    points: [60, 62, 65, 70, 68, 74, 72],
  });

  // === Темы
  const weakTopics = ref([
    { id: "w1", name: "Вероятность", correct: 42 },
    { id: "w2", name: "Хим. уравнения", correct: 48 },
    { id: "w3", name: "Ист. даты (XVIII)", correct: 51 },
  ]);
  const strongTopics = ref([
    { id: "s1", name: "Линейные функции", correct: 91 },
    { id: "s2", name: "Алгоритмы (база)", correct: 88 },
    { id: "s3", name: "Лексический анализ", correct: 86 },
  ]);

  // === Дедлайн экзамена
  const examDate = ref("2025-11-20T09:00:00Z");

  // === Активность
  const activity = ref([
    {
      id: "ev1",
      ts: "2025-09-23T12:00:00Z",
      text: "Завершена попытка по Чит. грамотности (64%)",
    },
    {
      id: "ev2",
      ts: "2025-09-20T08:40:00Z",
      text: "Отправлена на проверку попытка по CS",
    },
    {
      id: "ev3",
      ts: "2025-09-17T13:25:00Z",
      text: "Новый рекорд: История Казахстана — 81%",
    },
  ]);

  const loading = ref(false);
  async function fetchAll() {
    loading.value = true;
    await new Promise((r) => setTimeout(r, 350));
    loading.value = false;
  }

  return {
    user,
    attempts,
    summary,
    loading,
    fetchAll,
    hold,
    approvedResume,
    trend: trend.value,
    weakTopics: weakTopics.value,
    strongTopics: strongTopics.value,
    examDate: examDate.value,
    activity: activity.value,
  };
}

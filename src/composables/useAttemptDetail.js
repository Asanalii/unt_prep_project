import { ref, computed, watchEffect } from "vue";

/**
 * Мок-деталка. В реале: подтягиваем по id с бэка.
 * Модель attempt совпадает с тем, что обсуждали.
 */
const MOCK = {
  id: "a-42",
  startedAt: "2025-09-23T12:15:00Z",
  finishedAt: "2025-09-23T12:57:00Z",
  status: "done",
  subjects: ["literacy", "mathlit", "history"],
  score: {
    total: 69,
    bySubject: { literacy: 14, mathlit: 25, history: 30 },
    maxBySubject: { literacy: 20, mathlit: 30, history: 40 },
  },
  timing: {
    totalSec: 2520,
    perQuestionSec: {
      q1: 35,
      q2: 42,
      q3: 55,
      q4: 18,
      q5: 120,
      q6: 28,
      q7: 40,
      q8: 34,
      q9: 69,
      q10: 22,
    },
  },
  answers: [
    { qid: "q1", subject: "literacy", isCorrect: true },
    { qid: "q2", subject: "literacy", isCorrect: true },
    { qid: "q3", subject: "literacy", isCorrect: false },
    { qid: "q4", subject: "mathlit", isCorrect: true },
    { qid: "q5", subject: "mathlit", isCorrect: false },
    { qid: "q6", subject: "mathlit", isCorrect: true },
    { qid: "q7", subject: "history", isCorrect: true },
    { qid: "q8", subject: "history", isCorrect: false },
    { qid: "q9", subject: "history", isCorrect: true },
    { qid: "q10", subject: "history", isCorrect: true },
  ],
  bankVersion: "2025.03",
};

const SUBJECT_LABELS = {
  literacy: "Грамотность чтения",
  mathlit: "Математическая грамотность",
  history: "История Казахстана",
};

export function useAttemptDetail(idRef) {
  const loading = ref(false);
  const attempt = ref(null);

  watchEffect(() => {
    if (!idRef?.value) return;
    loading.value = true;
    // имитация fetch
    setTimeout(() => {
      attempt.value = { ...MOCK, id: idRef.value };
      loading.value = false;
    }, 0);
  });

  const bySubject = computed(() => {
    if (!attempt.value) return [];
    const totalQ = Object.keys(attempt.value.timing.perQuestionSec).length;
    return attempt.value.subjects.map((s) => {
      const score = attempt.value.score.bySubject[s] || 0;
      const max = attempt.value.score.maxBySubject[s] || 0;
      const answered = attempt.value.answers.filter(
        (a) => a.subject === s
      ).length;
      const correct = attempt.value.answers.filter(
        (a) => a.subject === s && a.isCorrect
      ).length;
      return {
        id: s,
        title: SUBJECT_LABELS[s] || s,
        score,
        max,
        pct: max ? Math.round((score / max) * 100) : 0,
        answered,
        correct,
        avgTimeSec: Math.round(
          answered ? attempt.value.timing.totalSec / totalQ : 0
        ),
      };
    });
  });

  const timeSeries = computed(() => {
    if (!attempt.value) return [];
    return Object.entries(attempt.value.timing.perQuestionSec).map(
      ([qid, sec], i) => ({ q: i + 1, sec, qid })
    );
  });

  const mistakes = computed(() => {
    // очень простой мок: берём предметы, где pct < 70
    return bySubject.value
      .filter((s) => s.pct < 70)
      .map((s) => ({
        key: s.id,
        topic: `${s.title}`,
        rate: 100 - s.pct,
        hint: "Есть просадка по теме. Рекомендуем 15-минутный блиц-разбор и мини-практику.",
      }));
  });

  return { loading, attempt, bySubject, timeSeries, mistakes };
}

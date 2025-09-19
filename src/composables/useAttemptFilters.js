import { ref, computed } from "vue";

export function useAttemptFilters(attemptsRef) {
  const q = ref("");
  const status = ref("all"); // all | active | hold | approved | done | cancelled
  const subject = ref("all");
  const sort = ref("date_desc"); // date_desc | date_asc | score_desc | score_asc

  const filtered = computed(() => {
    let list = attemptsRef.value.slice();

    if (status.value !== "all")
      list = list.filter((a) => a.status === status.value);
    if (subject.value !== "all")
      list = list.filter((a) => a.subjects.includes(subject.value));
    if (q.value.trim()) {
      const s = q.value.trim().toLowerCase();
      list = list.filter(
        (a) =>
          a.id.toLowerCase().includes(s) ||
          a.bankVersion.toLowerCase().includes(s)
      );
    }

    switch (sort.value) {
      case "date_asc":
        list.sort((a, b) => new Date(a.startedAt) - new Date(b.startedAt));
        break;
      case "score_desc":
        list.sort((a, b) => (b.score.total ?? -1) - (a.score.total ?? -1));
        break;
      case "score_asc":
        list.sort((a, b) => (a.score.total ?? 9999) - (b.score.total ?? 9999));
        break;
      default:
        list.sort((a, b) => new Date(b.startedAt) - new Date(a.startedAt));
    }
    return list;
  });

  return { q, status, subject, sort, filtered };
}

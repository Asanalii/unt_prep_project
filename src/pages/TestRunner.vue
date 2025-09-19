<script setup>
import { ref, computed, watch, onMounted } from "vue";
import { useI18n } from "vue-i18n";
import { useAuthStore } from "@/stores/auth";

import TestTopbar from "@/components/test/TestTopbar.vue";
import TestSidebar from "@/components/test/TestSidebar.vue";
import TestPaginator from "@/components/test/TestPaginator.vue";
import TestQuestion from "@/components/test/TestQuestion.vue";
import TestAnswerMap from "@/components/test/TestAnswerMap.vue";
import TestCalculator from "@/components/test/TestCalculator.vue";
import MendeleevPanel from "@/components/tools/MendeleevPanel.vue";
import SolubilityPanel from "@/components/tools/SolubilityPanel.vue";
import BaseButton from "../components/atoms/BaseButton.vue";

const { t } = useI18n();
const auth = useAuthStore();

const subjects = [
  { id: "literacy", name: t("ent.literacy") }, // 10 single
  { id: "mathlit", name: t("ent.math_literacy") }, // 10 single
  { id: "history", name: t("subjects.history") }, // 20 single
  { id: "math", name: t("subjects.math") }, // 40 (микст)
  { id: "cs", name: t("subjects.cs") }, // 40 (микст)
];

const subjectFiles = {
  literacy: "/questions/reading_literacy.json",
  mathlit: "/questions/math_literacy.json",
  history: "/questions/history.json",
  math: "/questions/math.json",
  cs: "/questions/informatics.json",
};

// Норматив ЕНТ (валидация)
const spec = {
  literacy: { total: 10, types: { single: 10 } },
  mathlit: { total: 10, types: { single: 10 } },
  history: { total: 20, types: { single: 20 } },
  math: { total: 40, types: { single: 25, context: 5, match: 5, multi: 5 } },
  cs: { total: 40, types: { single: 25, context: 5, match: 5, multi: 5 } },
};

const allQuestions = ref([]);
const loadError = ref("");

onMounted(async () => {
  try {
    const chunks = await Promise.all(
      Object.entries(subjectFiles).map(async ([sid, url]) => {
        const r = await fetch(url);
        const data = await r.json();
        validateAgainstSpec(sid, data); // бросит ошибку, если не сходится
        return data.map((q, i) => ({
          ...q,
          id: q.id || `${sid}-${i + 1}`,
          subject: sid,
        }));
      })
    );
    allQuestions.value = chunks.flat();
  } catch (e) {
    loadError.value = String(e?.message || e);
    console.error(e);
  }
});

// function validateAgainstSpec(sid, arr) {
//   const s = spec[sid];
//   if (!s) return;
//   if (arr.length !== s.total)
//     throw new Error(
//       `[${sid}] Ожидалось ${s.total} задач, получено ${arr.length}`
//     );
//   const counters = arr.reduce(
//     (m, q) => ((m[q.type] = (m[q.type] || 0) + 1), m),
//     {}
//   );
//   for (const [t, need] of Object.entries(s.types)) {
//     if ((counters[t] || 0) !== need)
//       throw new Error(
//         `[${sid}] Тип "${t}": нужно ${need}, есть ${counters[t] || 0}`
//       );
//   }
// }

function validateAgainstSpec(sid, arr) {
  const s = spec[sid];
  if (!s) return;
  const counters = arr.reduce(
    (m, q) => ((m[q.type] = (m[q.type] || 0) + 1), m),
    {}
  );
  const problems = [];

  if (arr.length !== s.total)
    problems.push(`ожидалось ${s.total}, получено ${arr.length}`);
  for (const [t, need] of Object.entries(s.types)) {
    const have = counters[t] || 0;
    if (have !== need) problems.push(`тип "${t}": нужно ${need}, есть ${have}`);
  }

  // if (problems.length) {
  //   throw new Error(`[${sid}] ${problems.join("; ")}`);
  // } else if (problems.length) {
  //   console.warn(`[${sid}] SPEC WARN: ${problems.join("; ")}`);
  // }
}

const subjectIndex = ref(0);
const currentSubject = computed(() => subjects[subjectIndex.value]);
const username = computed(() => auth.user?.name || auth.user?.email || "User");

// Фильтруем текущий предмет
const questions = computed(() =>
  allQuestions.value.filter((q) => q.subject === currentSubject.value.id)
);

// Ответы
const answers = ref(new Map());
// рядом с answers
const matchAnswers = ref({}); // { [qId]: { "1":"B", "2":"D", ... } }

function toggleMatch(qId, index, letter) {
  const obj = { ...(matchAnswers.value[qId] || {}) };
  obj[index] = letter;
  matchAnswers.value[qId] = obj;
}

function toggleAnswer(qId, choiceId, multiple) {
  const set = answers.value.get(qId) || new Set();
  if (multiple) set.has(choiceId) ? set.delete(choiceId) : set.add(choiceId);
  else {
    set.clear();
    set.add(choiceId);
  }
  answers.value.set(qId, set);
}
const isChecked = (qId, cId) => !!answers.value.get(qId)?.has(cId);

// Пагинация / предметы
const qIndex = ref(0);
watch(currentSubject, () => {
  qIndex.value = 0;
});
const total = computed(() => questions.value.length);
const current = computed(() => questions.value[qIndex.value]);
const goTo = (i) => {
  if (i >= 0 && i < total.value) qIndex.value = i;
};
const prevQ = () => goTo(qIndex.value - 1);
const nextQ = () => goTo(qIndex.value + 1);

const answerSections = computed(() =>
  subjects.map((s) => {
    const subjectQuestions = allQuestions.value.filter(
      (q) => q.subject === s.id
    );
    const items = subjectQuestions.map((q, idx) => {
      const set = answers.value.get(q.id) || new Set();
      return { num: idx + 1, answers: Array.from(set) };
    });
    const answered = items.filter((i) => i.answers.length > 0).length;
    return { id: s.id, name: s.name, items, answered, total: items.length };
  })
);

// Сайдбар/панели
const showMap = ref(false);
const showCalc = ref(false);
const openMendeleev = ref(false);
const openSolubility = ref(false);
const collapsed = ref(false);

const hasPrevSubject = computed(() => subjectIndex.value > 0);
const hasNextSubject = computed(() => subjectIndex.value < subjects.length - 1);
const prevSubject = () => {
  if (hasPrevSubject.value) subjectIndex.value--;
};
const nextSubject = () => {
  if (hasNextSubject.value) subjectIndex.value++;
};
function onPickSubject(subjectId) {
  const idx = subjects.findIndex((s) => s.id === subjectId);
  if (idx !== -1 && idx !== subjectIndex.value) subjectIndex.value = idx;
}
</script>

<template>
  <div class="runner" :class="{ 'is-collapsed': collapsed }">
    <TestTopbar
      :subject="currentSubject"
      :username="username"
      :has-prev="hasPrevSubject"
      :has-next="hasNextSubject"
      @toggle-menu="collapsed = !collapsed"
      @prev-subject="prevSubject"
      @next-subject="nextSubject"
    />

    <div class="layout">
      <Transition name="slide-x" mode="out-in">
        <!-- :key="collapsed ? 'rail' : 'full'" -->
        <TestSidebar
          :collapsed="collapsed"
          :username="username"
          :subjects="subjects"
          :active-subject-id="currentSubject.id"
          @pick-subject="onPickSubject"
          @toggle="collapsed = !collapsed"
          @open-answer-map="showMap = true"
          @open-calculator="showCalc = true"
          @open-mendeleev="openMendeleev = true"
          @open-solubility="openSolubility = true"
        />
      </Transition>

      <main class="main">
        <TestPaginator
          :items="questions"
          :index="qIndex"
          :answers="answers"
          @go="goTo"
        />

        <div class="bar">
          <div class="subj">
            {{ t("test.section") }}: <b>{{ currentSubject.name }}</b>
          </div>
          <div class="meta">
            <span>{{ t("test.question_no", { n: qIndex + 1 }) }}</span>
            <div class="sp"></div>
            <BaseButton
              variant="ghost"
              size="md"
              :disabled="qIndex === 0"
              @click="prevQ"
            >
              {{ t("test.prev") }}
            </BaseButton>
            <BaseButton
              size="md"
              :disabled="qIndex === total - 1"
              @click="nextQ"
            >
              {{ t("test.next") }}
            </BaseButton>
          </div>
        </div>

        <Transition name="fade" mode="out-in">
          <TestQuestion
            v-if="current"
            :question="current"
            :checked="(cId) => isChecked(current.id, cId)"
            :match-state="matchAnswers[current.id] || {}"
            @toggle="
              (cId) =>
                toggleAnswer(
                  current.id,
                  cId,
                  current.multiple || current.type === 'multi'
                )
            "
            @matchChange="
              ({ index, letter }) => toggleMatch(current.id, index, letter)
            "
          />
        </Transition>
      </main>
    </div>

    <!-- Модалка карты ответов -->
    <TestAnswerMap
      v-if="showMap"
      :open="showMap"
      :sections="answerSections"
      @close="showMap = false"
    />

    <TestCalculator
      v-if="showCalc"
      :open="showCalc"
      @close="showCalc = false"
    />

    <MendeleevPanel
      v-if="openMendeleev"
      :open="openMendeleev"
      @close="openMendeleev = false"
    />

    <SolubilityPanel
      v-if="openSolubility"
      :open="openSolubility"
      @close="openSolubility = false"
    />
  </div>
</template>

<style scoped>
/* общий каркас */
.runner {
  display: grid;
  grid-template-rows: auto 1fr;
  height: 100%;
}
.layout {
  display: grid;
  grid-template-columns: var(--aside-w, 260px) 1fr;
  height: calc(100vh - 48px);
}
.runner.is-collapsed {
  --aside-w: 72px;
}

/* .main {
  padding: 14px;
  overflow: auto;
  display: grid;
  gap: var(--s-4);
} */

.main {
  padding: 14px;
  overflow: auto;

  /* фикс: оставляем grid, но не даём строкам растягиваться */
  display: grid;
  grid-auto-rows: min-content; /* каждая секция ровно по контенту */
  align-content: start; /* при коротком контенте прижимаем к верху */
  gap: var(--s-4);
}

.bar {
  display: grid;
  grid-template-columns: 1fr auto;
  align-items: center;
  gap: 10px;
}
.subj {
  color: var(--muted);
}
.meta {
  display: inline-flex;
  align-items: center;
  gap: 10px;
}
.meta .sp {
  width: 6px;
}
</style>

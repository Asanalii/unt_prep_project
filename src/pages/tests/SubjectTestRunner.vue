<!-- src/pages/tests/SubjectTestRunner.vue -->
<script setup>
import { computed, onMounted, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
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
import BaseButton from "@/components/atoms/BaseButton.vue";

import { useUiStore } from "@/stores/ui";
import { fetchAttemptDetail, saveAnswer, finishAttempt } from "./api/tests";

const route = useRoute();
const router = useRouter();
const { t } = useI18n();
const auth = useAuthStore();
const ui = useUiStore();

const attemptId = computed(() =>
  Number(route.query.attemptId || route.params.id),
);

const loading = ref(false);
const finishing = ref(false);
const loadError = ref("");

const attempt = ref(null);
const questions = ref([]);

const qIndex = ref(0);
const collapsed = ref(false);

const showMap = ref(false);
const showCalc = ref(false);
const openMendeleev = ref(false);
const openSolubility = ref(false);

const answers = ref(new Map());
const savingIds = ref(new Set());

const username = computed(() => auth.user?.name || auth.user?.email || "User");

const currentSubjectCode = computed(() => attempt.value?.subject || "");
const currentSubjectName = computed(() => {
  const code = currentSubjectCode.value;
  return t(`subjects.${code}`) || code || t("tests_page.subject_test");
});

const currentSubject = computed(() => ({
  id: currentSubjectCode.value,
  name: currentSubjectName.value,
}));

const total = computed(() => questions.value.length);
const current = computed(() => questions.value[qIndex.value] || null);

const canUseCalculator = computed(() => currentSubjectCode.value === "math");
const canUseChemistryTools = computed(() =>
  ["chemistry", "biology"].includes(currentSubjectCode.value),
);

const subjects = computed(() => [
  {
    id: currentSubjectCode.value || "subject",
    name: currentSubjectName.value || t("tests_page.subject_test"),
  },
]);

function setInitialAnswersFromQuestions(items) {
  const map = new Map();

  items.forEach((q) => {
    map.set(q.question_id, new Set(q.selected_answers || []));
  });

  answers.value = map;
}

async function loadAttempt() {
  if (!attemptId.value) {
    loadError.value = t("tests_page.attempt_not_found");
    return;
  }

  loading.value = true;
  loadError.value = "";

  try {
    const res = await fetchAttemptDetail(attemptId.value);
    const data = res?.data;

    attempt.value = data;
    questions.value = data?.questions || [];
    setInitialAnswersFromQuestions(questions.value);

    if (qIndex.value >= questions.value.length) {
      qIndex.value = 0;
    }
  } catch (e) {
    loadError.value = e.message || t("tests_page.load_attempt_error");
    ui.toast.error(loadError.value);
  } finally {
    loading.value = false;
  }
}

onMounted(loadAttempt);

watch(
  () => route.query.attemptId,
  () => {
    qIndex.value = 0;
    loadAttempt();
  },
);

function goTo(i) {
  if (i >= 0 && i < total.value) {
    qIndex.value = i;
  }
}

function prevQ() {
  goTo(qIndex.value - 1);
}

function nextQ() {
  goTo(qIndex.value + 1);
}

function isChecked(qId, cId) {
  return !!answers.value.get(qId)?.has(cId);
}

async function persistAnswer(questionId) {
  const question = questions.value.find((q) => q.question_id === questionId);
  if (!question) return;

  const selected = Array.from(answers.value.get(questionId) || []);
  const startedAt = question._startedAt || Date.now();
  const spentSeconds = Math.max(1, Math.round((Date.now() - startedAt) / 1000));

  savingIds.value.add(questionId);

  try {
    await saveAnswer(attemptId.value, {
      question_id: questionId,
      selected_answers: selected,
      time_spent_seconds: spentSeconds,
    });

    question.selected_answers = selected;
    question._startedAt = Date.now();
  } catch (e) {
    ui.toast.error(e.message || t("tests_page.save_answer_error"));
  } finally {
    savingIds.value.delete(questionId);
  }
}

async function toggleAnswer(qId, choiceId, multiple) {
  const currentSet = new Set(answers.value.get(qId) || []);

  if (multiple) {
    if (currentSet.has(choiceId)) {
      currentSet.delete(choiceId);
    } else {
      currentSet.add(choiceId);
    }
  } else {
    currentSet.clear();
    currentSet.add(choiceId);
  }

  answers.value.set(qId, currentSet);

  await persistAnswer(qId);
}

const answerSections = computed(() => {
  const items = questions.value.map((q, idx) => {
    const set = answers.value.get(q.question_id) || new Set();

    return {
      num: idx + 1,
      answers: Array.from(set),
    };
  });

  const answered = items.filter((i) => i.answers.length > 0).length;

  return [
    {
      id: currentSubjectCode.value || "subject",
      name: currentSubjectName.value || t("tests_page.subject_test"),
      items,
      answered,
      total: items.length,
    },
  ];
});

watch(
  () => current.value?.question_id,
  (newId, oldId) => {
    if (!newId) return;

    const question = questions.value.find((q) => q.question_id === newId);
    if (question && !question._startedAt) {
      question._startedAt = Date.now();
    }

    if (oldId) {
      const oldQuestion = questions.value.find((q) => q.question_id === oldId);
      if (oldQuestion && !oldQuestion._startedAt) {
        oldQuestion._startedAt = Date.now();
      }
    }
  },
  { immediate: true },
);

async function onFinish() {
  try {
    finishing.value = true;
    ui.setLoading(true, t("tests_page.finishing"));

    await finishAttempt(attemptId.value);

    ui.toast.success(t("tests_page.finish_success"));

    router.push({
      name: "attempt",
      params: {
        locale: route.params.locale,
        id: attemptId.value,
      },
    });
  } catch (e) {
    ui.toast.error(e.message || t("tests_page.finish_error"));
  } finally {
    finishing.value = false;
    ui.setLoading(false);
  }
}

function onPickSubject() {
  // single subject runner, ничего не делаем
}
</script>

<template>
  <div class="runner" :class="{ 'is-collapsed': collapsed }">
    <template v-if="loading">
      <div class="loading-wrap">{{ t("common.loading") }}</div>
    </template>

    <template v-else-if="loadError">
      <div class="loading-wrap error">{{ loadError }}</div>
    </template>

    <template v-else-if="attempt">
      <TestTopbar
        :subject="currentSubject"
        :username="username"
        :has-prev="false"
        :has-next="false"
        @toggle-menu="collapsed = !collapsed"
        @prev-subject="null"
        @next-subject="null"
      />

      <div class="layout">
        <TestSidebar
          :collapsed="collapsed"
          :username="username"
          :subjects="subjects"
          :active-subject-id="currentSubject.id"
          @pick-subject="onPickSubject"
          @toggle="collapsed = !collapsed"
          @open-answer-map="showMap = true"
          @open-calculator="canUseCalculator ? (showCalc = true) : null"
          @open-mendeleev="canUseChemistryTools ? (openMendeleev = true) : null"
          @open-solubility="
            canUseChemistryTools ? (openSolubility = true) : null
          "
        />

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
              :key="current.question_id"
              :question="current"
              :checked="(cId) => isChecked(current.question_id, cId)"
              @toggle="
                (cId) =>
                  toggleAnswer(
                    current.question_id,
                    cId,
                    String(current.type).toLowerCase() === 'multi',
                  )
              "
            />
          </Transition>

          <div class="finish-row">
            <BaseButton :disabled="finishing" @click="onFinish">
              {{
                finishing
                  ? t("tests_page.finishing")
                  : t("tests_page.finish_test")
              }}
            </BaseButton>
          </div>
        </main>
      </div>

      <TestAnswerMap
        v-if="showMap"
        :open="showMap"
        :sections="answerSections"
        @close="showMap = false"
      />

      <TestCalculator
        v-if="showCalc && canUseCalculator"
        :open="showCalc"
        @close="showCalc = false"
      />

      <MendeleevPanel
        v-if="openMendeleev && canUseChemistryTools"
        :open="openMendeleev"
        @close="openMendeleev = false"
      />

      <SolubilityPanel
        v-if="openSolubility && canUseChemistryTools"
        :open="openSolubility"
        @close="openSolubility = false"
      />
    </template>
  </div>
</template>

<style scoped>
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

.main {
  padding: 14px;
  overflow: auto;
  display: grid;
  grid-auto-rows: min-content;
  align-content: start;
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

.finish-row {
  display: flex;
  justify-content: flex-end;
  padding-bottom: 16px;
}

.loading-wrap {
  height: 100%;
  display: grid;
  place-items: center;
  color: var(--muted);
  padding: 24px;
}

.loading-wrap.error {
  color: var(--danger);
}
</style>

<!-- src/pages/tests/TopicQuizRunnerPage.vue -->
<script setup>
import { computed, onBeforeUnmount, onMounted, reactive, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useI18n } from "vue-i18n";

import BaseButton from "@/components/atoms/BaseButton.vue";
import BaseCard from "@/components/atoms/BaseCard.vue";

import { useUiStore } from "@/stores/ui";
import {
  fetchTopicQuizDetail,
  saveQuizAnswer,
  fetchQuizHint,
  finishTopicQuiz,
} from "@/api/topicQuiz";

const route = useRoute();
const router = useRouter();
const { t } = useI18n();
const ui = useUiStore();

const loading = ref(false);
const error = ref("");
const finishing = ref(false);

const quiz = ref(null);
const questions = ref([]);
const currentIndex = ref(0);

// question_id -> selected answers []
const answers = reactive({});
// question_id -> seconds accumulated
const timeSpent = reactive({});
// question_id -> { open, loading, text, error }
const hints = reactive({});

let enteredAt = Date.now();

const quizId = computed(() => Number(route.params.quizId));

const current = computed(() => questions.value[currentIndex.value] || null);

const answeredCount = computed(
  () => Object.values(answers).filter((a) => a && a.length).length,
);

const progressPercent = computed(() =>
  questions.value.length
    ? Math.round((answeredCount.value / questions.value.length) * 100)
    : 0,
);

function isMulti(question) {
  return String(question?.type || "")
    .toLowerCase()
    .includes("mult");
}

function isSelected(question, option) {
  return (answers[question.question_id] || []).includes(option);
}

function hintState(questionId) {
  if (!hints[questionId]) {
    hints[questionId] = { open: false, loading: false, text: "", error: "" };
  }
  return hints[questionId];
}

// ---- math-ish formatting (same spirit as the explanation modal) ----
function cleanText(text) {
  if (!text) return "";
  return String(text)
    .replace(/\*\*/g, "")
    .replace(/\$/g, "")
    .replace(/\\le/g, "≤")
    .replace(/\\ge/g, "≥")
    .replace(/\\neq/g, "≠")
    .replace(/\\times/g, "×")
    .replace(/\\cdot/g, "·")
    .replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, "$1/$2")
    .replace(/\\\(/g, "")
    .replace(/\\\)/g, "")
    .trim();
}

function escapeHtml(text) {
  return String(text || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function formatMath(text) {
  return escapeHtml(cleanText(text))
    .replace(/(\([^()]+\))\^(\d+)/g, "$1<sup>$2</sup>")
    .replace(/([a-zA-Zа-яА-Я])\^(\d+)/g, "$1<sup>$2</sup>")
    .replace(/([a-zA-Zа-яА-Я])_(\d+)/g, "$1<sub>$2</sub>")
    .replace(/&gt;=/g, "≥")
    .replace(/&lt;=/g, "≤");
}

// ---- timing ----
function flushTime() {
  const q = current.value;
  if (!q) return;
  const delta = Math.round((Date.now() - enteredAt) / 1000);
  timeSpent[q.question_id] =
    (timeSpent[q.question_id] || 0) + Math.max(0, delta);
  enteredAt = Date.now();
}

// ---- loading ----
async function loadQuiz() {
  loading.value = true;
  error.value = "";

  try {
    const res = await fetchTopicQuizDetail(quizId.value);
    quiz.value = res.data;
    questions.value = res.data?.questions || [];

    if (quiz.value?.status === "finished") {
      router.replace({
        name: "topic-quiz-result",
        params: {
          locale: route.params.locale,
          subject: route.params.subject,
          quizId: quizId.value,
        },
      });
      return;
    }

    for (const q of questions.value) {
      answers[q.question_id] = [...(q.selected_answers || [])];
      timeSpent[q.question_id] = 0;
    }

    enteredAt = Date.now();
  } catch (e) {
    error.value =
      e?.response?.data?.detail || e.message || t("quiz.load_error");
    ui.toast.error(error.value);
  } finally {
    loading.value = false;
  }
}

// ---- answering ----
async function selectOption(question, option) {
  const qid = question.question_id;
  const currentSel = answers[qid] || [];

  if (isMulti(question)) {
    answers[qid] = currentSel.includes(option)
      ? currentSel.filter((x) => x !== option)
      : [...currentSel, option];
  } else {
    answers[qid] = currentSel.includes(option) ? [] : [option];
  }

  await persistAnswer(qid);
}

async function persistAnswer(questionId) {
  flushTime();
  try {
    await saveQuizAnswer({
      quiz_id: quizId.value,
      question_id: questionId,
      selected_answers: answers[questionId] || [],
      time_spent_seconds: timeSpent[questionId] || 0,
    });
  } catch (e) {
    // silent autosave failure — keep local state, surface once
    ui.toast.error(e?.response?.data?.detail || t("quiz.save_error"));
  }
}

// ---- navigation ----
function goTo(index) {
  if (index < 0 || index >= questions.value.length) return;
  flushTime();
  if (current.value) persistAnswer(current.value.question_id);
  currentIndex.value = index;
  enteredAt = Date.now();
}

function next() {
  goTo(currentIndex.value + 1);
}

function prev() {
  goTo(currentIndex.value - 1);
}

// ---- hint ----
async function requestHint(question) {
  const state = hintState(question.question_id);
  state.open = true;

  if (state.text || state.loading) return;

  state.loading = true;
  state.error = "";

  try {
    const res = await fetchQuizHint({
      quiz_id: quizId.value,
      question_id: question.question_id,
    });
    state.text = res.data?.hint || "";
  } catch (e) {
    state.error =
      e?.response?.data?.detail || e.message || t("quiz.hint_error");
  } finally {
    state.loading = false;
  }
}

function toggleHint(question) {
  const state = hintState(question.question_id);
  if (state.open) {
    state.open = false;
  } else {
    requestHint(question);
  }
}

// ---- finish ----
async function finishQuiz() {
  if (finishing.value) return;
  if (!window.confirm(t("quiz.confirm_finish"))) return;

  finishing.value = true;
  flushTime();

  try {
    if (current.value) await persistAnswer(current.value.question_id);

    await finishTopicQuiz(quizId.value);

    router.push({
      name: "topic-quiz-result",
      params: {
        locale: route.params.locale,
        subject: route.params.subject,
        quizId: quizId.value,
      },
    });
  } catch (e) {
    ui.toast.error(e?.response?.data?.detail || t("quiz.finish_error"));
    finishing.value = false;
  }
}

onMounted(loadQuiz);
onBeforeUnmount(() => {
  // best-effort flush so time isn't lost on navigation
  if (current.value) flushTime();
});
</script>

<template>
  <div class="runner">
    <div v-if="loading" class="state">{{ t("common.loading") }}</div>

    <div v-else-if="error" class="state error">{{ error }}</div>

    <template v-else-if="current">
      <!-- header -->
      <div class="head">
        <div class="head-info">
          <span class="q-counter">
            {{ t("quiz.question_n", { n: currentIndex + 1 }) }}
            <span class="muted">{{
              t("quiz.of_total", { n: questions.length })
            }}</span>
          </span>
          <span class="answered">
            {{ answeredCount }} / {{ questions.length }}
          </span>
        </div>
        <div class="progress">
          <div class="progress-bar" :style="{ width: `${progressPercent}%` }" />
        </div>
      </div>

      <!-- question navigator -->
      <div class="nav-strip">
        <button
          v-for="(q, i) in questions"
          :key="q.question_id"
          type="button"
          class="nav-dot"
          :class="{
            active: i === currentIndex,
            answered: (answers[q.question_id] || []).length,
          }"
          @click="goTo(i)"
        >
          {{ i + 1 }}
        </button>
      </div>

      <!-- question card -->
      <BaseCard class="q-card">
        <div class="q-meta">
          <span>{{ t(`quiz_topics.${current.topic}`) || current.topic }}</span>
        </div>

        <div class="q-title" v-html="formatMath(current.question_title)" />

        <div class="options">
          <button
            v-for="option in current.options"
            :key="option"
            type="button"
            class="option"
            :class="{ selected: isSelected(current, option) }"
            @click="selectOption(current, option)"
          >
            <span class="mark" :class="{ multi: isMulti(current) }">
              <span v-if="isSelected(current, option)">✓</span>
            </span>
            <span v-html="formatMath(option)" />
          </button>
        </div>

        <!-- hint -->
        <div class="hint-zone">
          <BaseButton variant="ghost" @click="toggleHint(current)">
            💡 {{ t("quiz.hint") }}
          </BaseButton>

          <div v-if="hintState(current.question_id).open" class="hint-panel">
            <div
              v-if="hintState(current.question_id).loading"
              class="hint-loading"
            >
              <span class="loader" />
              {{ t("quiz.hint_loading") }}
            </div>

            <div
              v-else-if="hintState(current.question_id).error"
              class="hint-error"
            >
              {{ hintState(current.question_id).error }}
            </div>

            <template v-else>
              <p
                class="hint-text"
                v-html="formatMath(hintState(current.question_id).text)"
              />
              <p class="hint-note">{{ t("quiz.hint_note") }}</p>
            </template>
          </div>
        </div>
      </BaseCard>

      <!-- controls -->
      <div class="controls">
        <BaseButton
          variant="ghost"
          :disabled="currentIndex === 0"
          @click="prev"
        >
          {{ t("quiz.prev") }}
        </BaseButton>

        <BaseButton v-if="currentIndex < questions.length - 1" @click="next">
          {{ t("quiz.next") }}
        </BaseButton>

        <BaseButton v-else :disabled="finishing" @click="finishQuiz">
          {{ finishing ? t("quiz.finishing") : t("quiz.finish") }}
        </BaseButton>
      </div>

      <div class="finish-row">
        <BaseButton variant="ghost" :disabled="finishing" @click="finishQuiz">
          {{ t("quiz.finish") }}
        </BaseButton>
      </div>
    </template>
  </div>
</template>

<style scoped>
.runner {
  padding: 16px;
  display: grid;
  gap: 16px;
  max-width: 820px;
  margin: 0 auto;
  width: 100%;
}

.state {
  min-height: 240px;
  display: grid;
  place-items: center;
  color: var(--muted);
}

.state.error {
  color: var(--danger);
}

.head {
  display: grid;
  gap: 10px;
}

.head-info {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.q-counter {
  font-weight: 700;
  font-size: var(--fz-20);
}

.q-counter .muted {
  color: var(--muted);
  font-weight: 400;
  font-size: var(--fz-16);
  margin-left: 6px;
}

.answered {
  color: var(--muted);
  font-size: var(--fz-14);
}

.progress {
  height: 8px;
  background: var(--bg-elev);
  border: 1px solid var(--border);
  border-radius: 999px;
  overflow: hidden;
}

.progress-bar {
  height: 100%;
  background: var(--color-primary);
  transition: width 0.25s ease;
}

.nav-strip {
  display: flex;
  gap: 6px;
  overflow-x: auto;
  padding-bottom: 4px;
}

.nav-dot {
  width: 34px;
  height: 34px;
  flex: 0 0 auto;
  border-radius: 9px;
  border: 1px solid var(--border);
  background: var(--bg-elev);
  color: var(--muted);
  cursor: pointer;
  font-size: var(--fz-14);
  font-weight: 600;
  transition: 0.15s ease;
}

.nav-dot.answered {
  color: var(--text);
  border-color: var(--color-primary);
}

.nav-dot.active {
  background: var(--color-primary);
  border-color: var(--color-primary);
  color: #fff;
}

.q-card {
  padding: 20px;
  display: grid;
  gap: 16px;
}

.q-meta {
  display: flex;
  gap: 10px;
  color: var(--muted);
  font-size: var(--fz-14);
}

.q-title {
  font-size: var(--fz-20);
  line-height: 1.5;
}

.options {
  display: grid;
  gap: 10px;
}

.option {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 14px 16px;
  border: 1px solid var(--border);
  border-radius: var(--radius-sm, 10px);
  background: var(--bg-elev);
  color: var(--text);
  cursor: pointer;
  text-align: left;
  font-size: var(--fz-16);
  line-height: 1.5;
  transition: 0.15s ease;
}

.option:hover {
  border-color: var(--color-primary);
}

.option.selected {
  border-color: var(--color-primary);
  box-shadow: inset 0 0 0 1px var(--color-primary);
  background: color-mix(in oklab, var(--color-primary) 12%, var(--bg-elev));
}

.mark {
  width: 22px;
  height: 22px;
  flex-shrink: 0;
  border-radius: 50%;
  border: 1.5px solid var(--border);
  display: grid;
  place-items: center;
  font-size: 13px;
  color: #fff;
}

.mark.multi {
  border-radius: 7px;
}

.option.selected .mark {
  background: var(--color-primary);
  border-color: var(--color-primary);
}

.hint-zone {
  display: grid;
  gap: 10px;
}

.hint-panel {
  border: 1px solid var(--border);
  border-radius: var(--radius-sm, 10px);
  background: var(--bg-elev);
  padding: 14px 16px;
}

.hint-loading {
  display: flex;
  align-items: center;
  gap: 10px;
  color: var(--muted);
}

.hint-error {
  color: var(--danger);
}

.hint-text {
  margin: 0 0 8px;
  line-height: 1.6;
}

.hint-note {
  margin: 0;
  font-size: var(--fz-14);
  color: var(--muted);
  font-style: italic;
}

.loader {
  width: 18px;
  height: 18px;
  border: 2px solid var(--border);
  border-top-color: var(--color-primary);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

.controls {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.finish-row {
  display: flex;
  justify-content: center;
}

.q-title :deep(sup),
.option :deep(sup),
.hint-text :deep(sup) {
  font-size: 0.7em;
  vertical-align: super;
  line-height: 0;
}

.q-title :deep(sub),
.option :deep(sub),
.hint-text :deep(sub) {
  font-size: 0.7em;
  vertical-align: sub;
  line-height: 0;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 640px) {
  .controls {
    flex-wrap: wrap;
  }
}
</style>

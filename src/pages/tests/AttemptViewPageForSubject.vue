<!-- src/pages/tests/AttemptViewPageForSubject.vue -->
<script setup>
import { computed, onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useI18n } from "vue-i18n";

import BaseButton from "@/components/atoms/BaseButton.vue";
import BaseCard from "@/components/atoms/BaseCard.vue";
import { useUiStore } from "@/stores/ui";
import { fetchAttemptResult, fetchAttemptDetail } from "./api/tests";

const route = useRoute();
const router = useRouter();
const { t } = useI18n();
const ui = useUiStore();

const loading = ref(false);
const error = ref("");

const result = ref(null);
const attemptDetail = ref(null);

const showQuestions = ref(false);

const attemptId = computed(() => Number(route.params.id));

const subjectName = computed(() => {
  const code = result.value?.subject || attemptDetail.value?.subject;
  return t(`subjects.${code}`) || code || "—";
});

const summaryCards = computed(() => {
  if (!result.value?.summary) return [];

  return [
    {
      key: "correct",
      label: t("attempt_subject.correct"),
      value: result.value.summary.correct ?? 0,
    },
    {
      key: "incorrect",
      label: t("attempt_subject.incorrect"),
      value: result.value.summary.incorrect ?? 0,
    },
    {
      key: "not_answered",
      label: t("attempt_subject.not_answered"),
      value: result.value.summary.not_answered ?? 0,
    },
  ];
});

const questions = computed(() => attemptDetail.value?.questions || []);

async function loadPage() {
  loading.value = true;
  error.value = "";

  try {
    const [resultRes, detailRes] = await Promise.all([
      fetchAttemptResult(attemptId.value),
      fetchAttemptDetail(attemptId.value),
    ]);

    result.value = resultRes?.data || null;
    attemptDetail.value = detailRes?.data || null;
  } catch (e) {
    error.value = e.message || t("attempt_subject.load_error");
    ui.toast.error(error.value);
  } finally {
    loading.value = false;
  }
}

onMounted(loadPage);

function goBack() {
  router.push({
    name: "tests",
    params: {
      locale: route.params.locale,
    },
  });
}

function formatDifficultyLabel(level) {
  if (level === 1) return t("attempt_subject.difficulty_easy");
  if (level === 2) return t("attempt_subject.difficulty_medium");
  if (level === 3) return t("attempt_subject.difficulty_hard");
  return `${t("attempt_subject.difficulty")} ${level}`;
}

function getQuestionState(question) {
  return question?.selected_answers?.length
    ? t("attempt_subject.answered")
    : t("attempt_subject.not_answered");
}

function isSelected(question, option) {
  return (question.selected_answers || []).includes(option);
}
</script>

<template>
  <div class="attempt-page">
    <div v-if="loading" class="state">
      {{ t("common.loading") }}
    </div>

    <div v-else-if="error" class="state error">
      <p>{{ error }}</p>
      <BaseButton @click="goBack">
        {{ t("common.back") || "Назад" }}
      </BaseButton>
    </div>

    <template v-else-if="result">
      <div class="head">
        <div>
          <h1 class="title">{{ t("attempt_subject.title") }}</h1>
          <p class="subtitle">{{ subjectName }} · ID {{ result.attempt_id }}</p>
        </div>

        <BaseButton variant="ghost" @click="goBack">
          {{ t("common.back") || "Назад" }}
        </BaseButton>
      </div>

      <div class="top-grid">
        <BaseCard class="hero-card">
          <div class="hero-main">
            <div>
              <div class="hero-label">{{ t("attempt_subject.score") }}</div>
              <div class="hero-score">
                {{ result.score }} / {{ result.total_questions }}
              </div>
            </div>

            <div class="hero-side">
              <div class="hero-mini">
                <span>{{ t("attempt_subject.correct_answers_count") }}</span>
                <b>{{ result.correct_answers_count }}</b>
              </div>
              <div class="hero-mini">
                <span>{{ t("attempt_subject.subject") }}</span>
                <b>{{ subjectName }}</b>
              </div>
            </div>
          </div>
        </BaseCard>

        <div class="summary-grid">
          <BaseCard
            v-for="card in summaryCards"
            :key="card.key"
            class="summary-card"
          >
            <div class="summary-label">{{ card.label }}</div>
            <div class="summary-value">{{ card.value }}</div>
          </BaseCard>
        </div>
      </div>

      <div class="content-grid">
        <BaseCard class="panel">
          <div class="panel-h">
            <h3>{{ t("attempt_subject.by_topic") }}</h3>
          </div>

          <div v-if="result.topics?.length" class="stats-list">
            <div
              v-for="item in result.topics"
              :key="item.topic"
              class="stat-row"
            >
              <div class="stat-head">
                <div class="stat-title">
                  {{ item.topic }}
                </div>
                <div class="stat-total">
                  {{ item.correct }} / {{ item.total }}
                </div>
              </div>

              <div class="progress">
                <div
                  class="progress-bar"
                  :style="{
                    width: `${item.total ? (item.correct / item.total) * 100 : 0}%`,
                  }"
                />
              </div>

              <div class="stat-meta">
                <span
                  >{{ t("attempt_subject.correct") }}: {{ item.correct }}</span
                >
                <span
                  >{{ t("attempt_subject.incorrect") }}:
                  {{ item.incorrect }}</span
                >
                <span
                  >{{ t("attempt_subject.not_answered") }}:
                  {{ item.not_answered }}</span
                >
              </div>
            </div>
          </div>

          <div v-else class="muted">
            {{ t("attempt_subject.no_topic_stats") }}
          </div>
        </BaseCard>

        <BaseCard class="panel">
          <div class="panel-h">
            <h3>{{ t("attempt_subject.by_difficulty") }}</h3>
          </div>

          <div v-if="result.difficulty_stats?.length" class="stats-list">
            <div
              v-for="item in result.difficulty_stats"
              :key="item.difficulty"
              class="stat-row"
            >
              <div class="stat-head">
                <div class="stat-title">
                  {{ formatDifficultyLabel(item.difficulty) }}
                </div>
                <div class="stat-total">
                  {{ item.correct }} / {{ item.total }}
                </div>
              </div>

              <div class="progress">
                <div
                  class="progress-bar"
                  :style="{
                    width: `${item.total ? (item.correct / item.total) * 100 : 0}%`,
                  }"
                />
              </div>

              <div class="stat-meta">
                <span
                  >{{ t("attempt_subject.correct") }}: {{ item.correct }}</span
                >
                <span
                  >{{ t("attempt_subject.incorrect") }}:
                  {{ item.incorrect }}</span
                >
                <span
                  >{{ t("attempt_subject.not_answered") }}:
                  {{ item.not_answered }}</span
                >
              </div>
            </div>
          </div>

          <div v-else class="muted">
            {{ t("attempt_subject.no_difficulty_stats") }}
          </div>
        </BaseCard>
      </div>

      <BaseCard class="panel">
        <div class="panel-h questions-head">
          <h3>{{ t("attempt_subject.questions_review") }}</h3>

          <BaseButton variant="ghost" @click="showQuestions = !showQuestions">
            {{
              showQuestions
                ? t("attempt_subject.hide_questions")
                : t("attempt_subject.show_questions")
            }}
          </BaseButton>
        </div>

        <div v-if="showQuestions">
          <div v-if="questions.length" class="questions-list">
            <div
              v-for="(question, index) in questions"
              :key="question.question_id"
              class="question-card"
            >
              <div class="question-top">
                <div class="question-number">
                  {{ t("attempt_subject.question_n", { n: index + 1 }) }}
                </div>
                <div class="question-state">
                  {{ getQuestionState(question) }}
                </div>
              </div>

              <div class="question-title">
                {{ question.question_title }}
              </div>

              <div class="question-meta">
                <span
                  >{{ t("attempt_subject.topic") }}: {{ question.topic }}</span
                >
                <span>
                  {{ t("attempt_subject.difficulty") }}:
                  {{ formatDifficultyLabel(question.difficulty) }}
                </span>
                <span
                  >{{ t("attempt_subject.type") }}: {{ question.type }}</span
                >
              </div>

              <div class="options-list">
                <div
                  v-for="option in question.options"
                  :key="option"
                  class="option-item"
                  :class="{ selected: isSelected(question, option) }"
                >
                  <span class="option-mark">
                    {{ isSelected(question, option) ? "✓" : "•" }}
                  </span>
                  <span>{{ option }}</span>
                </div>
              </div>

              <div class="selected-line">
                <b>{{ t("attempt_subject.selected_answers") }}:</b>
                <span v-if="question.selected_answers?.length">
                  {{ question.selected_answers.join(", ") }}
                </span>
                <span v-else class="muted">
                  {{ t("attempt_subject.not_answered") }}
                </span>
              </div>
            </div>
          </div>

          <div v-else class="muted">
            {{ t("attempt_subject.no_questions_data") }}
          </div>
        </div>
      </BaseCard>
    </template>
  </div>
</template>

<style scoped>
.attempt-page {
  padding: 16px;
  display: grid;
  gap: 16px;
}

.state {
  min-height: 240px;
  display: grid;
  place-items: center;
  color: var(--muted);
}

.state.error {
  color: var(--danger);
  gap: 12px;
}

.head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
}

.title {
  margin: 0 0 6px;
  font-size: var(--fz-24);
}

.subtitle {
  margin: 0;
  color: var(--muted);
}

.top-grid {
  display: grid;
  gap: 16px;
}

.hero-card,
.summary-card,
.panel {
  padding: 16px;
}

.hero-main {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  align-items: center;
}

.hero-label {
  color: var(--muted);
  margin-bottom: 6px;
}

.hero-score {
  font-size: 32px;
  font-weight: 800;
}

.hero-side {
  display: grid;
  gap: 10px;
  min-width: 220px;
}

.hero-mini {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  color: var(--muted);
}

.hero-mini b {
  color: var(--text);
}

.summary-grid {
  display: grid;
  gap: 12px;
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.summary-label {
  color: var(--muted);
  margin-bottom: 6px;
}

.summary-value {
  font-size: 28px;
  font-weight: 700;
}

.content-grid {
  display: grid;
  gap: 16px;
  grid-template-columns: 1fr 1fr;
}

.panel-h {
  margin-bottom: 12px;
}

.questions-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.panel-h h3 {
  margin: 0;
}

.stats-list {
  display: grid;
  gap: 14px;
}

.stat-row {
  display: grid;
  gap: 8px;
}

.stat-head {
  display: flex;
  justify-content: space-between;
  gap: 12px;
}

.stat-title {
  font-weight: 600;
}

.stat-total {
  color: var(--muted);
}

.progress {
  height: 10px;
  background: var(--bg-elev);
  border: 1px solid var(--border);
  border-radius: 999px;
  overflow: hidden;
}

.progress-bar {
  height: 100%;
  background: var(--color-primary);
}

.stat-meta {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  color: var(--muted);
  font-size: var(--fz-14);
}

.questions-list {
  display: grid;
  gap: 14px;
}

.question-card {
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 14px;
  background: var(--bg-elev);
  display: grid;
  gap: 10px;
}

.question-top {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: center;
}

.question-number {
  font-weight: 700;
}

.question-state {
  color: var(--muted);
  font-size: var(--fz-14);
}

.question-title {
  font-size: var(--fz-16);
  line-height: 1.5;
}

.question-meta {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  color: var(--muted);
  font-size: var(--fz-14);
}

.options-list {
  display: grid;
  gap: 8px;
}

.option-item {
  display: flex;
  gap: 10px;
  align-items: flex-start;
  padding: 10px 12px;
  border: 1px solid var(--border);
  border-radius: 10px;
  background: var(--bg);
}

.option-item.selected {
  border-color: var(--color-primary);
  box-shadow: inset 0 0 0 1px var(--color-primary);
}

.option-mark {
  min-width: 14px;
  color: var(--muted);
}

.selected-line {
  font-size: var(--fz-14);
}

.muted {
  color: var(--muted);
}

@media (max-width: 900px) {
  .content-grid {
    grid-template-columns: 1fr;
  }

  .summary-grid {
    grid-template-columns: 1fr;
  }

  .hero-main {
    flex-direction: column;
    align-items: flex-start;
  }

  .hero-side {
    min-width: 100%;
    width: 100%;
  }

  .head {
    flex-direction: column;
    align-items: stretch;
  }

  .question-top {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>

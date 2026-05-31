<!-- src/pages/tests/TopicQuizResultPage.vue -->
<script setup>
import { computed, onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useI18n } from "vue-i18n";

import BaseButton from "@/components/atoms/BaseButton.vue";
import BaseCard from "@/components/atoms/BaseCard.vue";
import TopicQuizHistory from "./components/TopicQuizHistory.vue";

import { useUiStore } from "@/stores/ui";
import { fetchTopicQuizResult } from "@/api/topicQuiz";

const route = useRoute();
const router = useRouter();
const { t } = useI18n();
const ui = useUiStore();

const loading = ref(false);
const error = ref("");
const result = ref(null);

const quizId = computed(() => Number(route.params.quizId));
const subject = computed(() => route.params.subject || "math");

const summaryCards = computed(() => {
  if (!result.value?.summary) return [];
  const s = result.value.summary;
  return [
    {
      key: "correct",
      label: t("quiz.correct"),
      value: s.correct ?? 0,
      tone: "ok",
    },
    {
      key: "incorrect",
      label: t("quiz.incorrect"),
      value: s.incorrect ?? 0,
      tone: "bad",
    },
    {
      key: "not_answered",
      label: t("quiz.not_answered"),
      value: s.not_answered ?? 0,
      tone: "muted",
    },
  ];
});

const scorePercent = computed(() => {
  const r = result.value;
  if (!r || !r.total_questions) return 0;
  return Math.round((r.score / r.total_questions) * 100);
});

function topicLabel(topic) {
  return t(`quiz_topics.${topic}`) || topic;
}

function difficultyLabel(level) {
  if (level === 1) return t("attempt_subject.difficulty_easy") || "Лёгкий";
  if (level === 2) return t("attempt_subject.difficulty_medium") || "Средний";
  if (level === 3) return t("attempt_subject.difficulty_hard") || "Сложный";
  return `${level}`;
}

async function loadResult() {
  loading.value = true;
  error.value = "";
  try {
    const res = await fetchTopicQuizResult(quizId.value);
    result.value = res.data;
  } catch (e) {
    error.value =
      e?.response?.data?.detail || e.message || t("quiz.load_error");
    ui.toast.error(error.value);
  } finally {
    loading.value = false;
  }
}

function newQuiz() {
  router.push({
    name: "topic-quiz-setup",
    params: { locale: route.params.locale, subject: subject.value },
  });
}

function goSubjects() {
  router.push({ name: "subjects", params: { locale: route.params.locale } });
}

onMounted(loadResult);
</script>

<template>
  <div class="result-page">
    <div v-if="loading" class="state">{{ t("common.loading") }}</div>

    <div v-else-if="error" class="state error">{{ error }}</div>

    <template v-else-if="result">
      <div class="head">
        <div>
          <h1 class="title">{{ t("quiz.result_title") }}</h1>
          <p class="subtitle">
            {{ t(`subjects.${subject}`) || subject }} · ID {{ result.quiz_id }}
          </p>
        </div>
        <BaseButton variant="ghost" @click="goSubjects">
          {{ t("common.back") || "Назад" }}
        </BaseButton>
      </div>

      <div class="top-grid">
        <BaseCard class="hero">
          <div class="hero-label">{{ t("quiz.score") }}</div>
          <div class="hero-score">
            {{ result.score }} / {{ result.total_questions }}
          </div>
          <div class="hero-ring">
            <div class="ring-bar" :style="{ width: `${scorePercent}%` }" />
          </div>
          <div class="hero-pct">{{ scorePercent }}%</div>
        </BaseCard>

        <div class="summary-grid">
          <BaseCard
            v-for="card in summaryCards"
            :key="card.key"
            class="summary-card"
            :class="card.tone"
          >
            <div class="summary-label">{{ card.label }}</div>
            <div class="summary-value">{{ card.value }}</div>
          </BaseCard>
        </div>
      </div>

      <div class="content-grid">
        <BaseCard class="panel">
          <h3>{{ t("quiz.by_topic") }}</h3>
          <div v-if="result.topics?.length" class="stats-list">
            <div
              v-for="item in result.topics"
              :key="item.topic"
              class="stat-row"
            >
              <div class="stat-head">
                <div class="stat-title">{{ topicLabel(item.topic) }}</div>
                <div class="stat-total">
                  {{ item.correct }} / {{ item.total }}
                </div>
              </div>
              <div class="bar">
                <div
                  class="bar-fill"
                  :style="{
                    width: `${item.total ? (item.correct / item.total) * 100 : 0}%`,
                  }"
                />
              </div>
              <div class="stat-meta">
                <span>{{ t("quiz.correct") }}: {{ item.correct }}</span>
                <span>{{ t("quiz.incorrect") }}: {{ item.incorrect }}</span>
                <span
                  >{{ t("quiz.not_answered") }}: {{ item.not_answered }}</span
                >
              </div>
            </div>
          </div>
        </BaseCard>

        <BaseCard class="panel">
          <h3>{{ t("quiz.by_difficulty") }}</h3>
          <div v-if="result.difficulty_stats?.length" class="stats-list">
            <div
              v-for="item in result.difficulty_stats"
              :key="item.difficulty"
              class="stat-row"
            >
              <div class="stat-head">
                <div class="stat-title">
                  {{ difficultyLabel(item.difficulty) }}
                </div>
                <div class="stat-total">
                  {{ item.correct }} / {{ item.total }}
                </div>
              </div>
              <div class="bar">
                <div
                  class="bar-fill"
                  :style="{
                    width: `${item.total ? (item.correct / item.total) * 100 : 0}%`,
                  }"
                />
              </div>
              <div class="stat-meta">
                <span>{{ t("quiz.correct") }}: {{ item.correct }}</span>
                <span>{{ t("quiz.incorrect") }}: {{ item.incorrect }}</span>
                <span
                  >{{ t("quiz.not_answered") }}: {{ item.not_answered }}</span
                >
              </div>
            </div>
          </div>
        </BaseCard>
      </div>

      <div class="actions">
        <BaseButton @click="newQuiz">{{ t("quiz.new_quiz") }}</BaseButton>
        <BaseButton variant="ghost" @click="goSubjects">
          {{ t(`subjects.${subject}`) || subject }}
        </BaseButton>
      </div>

      <!-- all quizzes the user has taken, with topic filter -->
      <BaseCard class="history-card">
        <TopicQuizHistory :subject="subject" />
      </BaseCard>
    </template>
  </div>
</template>

<style scoped>
.result-page {
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
  grid-template-columns: 1fr 1.4fr;
}

.hero,
.summary-card,
.panel,
.history-card {
  padding: 16px;
}

.hero {
  display: grid;
  gap: 10px;
  align-content: center;
}

.hero-label {
  color: var(--muted);
}

.hero-score {
  font-size: 34px;
  font-weight: 800;
}

.hero-ring {
  height: 10px;
  background: var(--bg-elev);
  border: 1px solid var(--border);
  border-radius: 999px;
  overflow: hidden;
}

.ring-bar {
  height: 100%;
  background: var(--color-primary);
}

.hero-pct {
  color: var(--muted);
  font-weight: 600;
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

.summary-card.ok .summary-value {
  color: var(--success);
}

.summary-card.bad .summary-value {
  color: var(--danger);
}

.content-grid {
  display: grid;
  gap: 16px;
  grid-template-columns: 1fr 1fr;
}

.panel h3 {
  margin: 0 0 12px;
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

.bar {
  height: 10px;
  background: var(--bg-elev);
  border: 1px solid var(--border);
  border-radius: 999px;
  overflow: hidden;
}

.bar-fill {
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

.actions {
  display: flex;
  gap: 12px;
}

@media (max-width: 900px) {
  .top-grid,
  .content-grid,
  .summary-grid {
    grid-template-columns: 1fr;
  }
}
</style>

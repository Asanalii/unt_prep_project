<!-- src/pages/tests/components/TopicQuizHistory.vue -->
<script setup>
import { computed, onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useI18n } from "vue-i18n";

import BaseCard from "@/components/atoms/BaseCard.vue";
import BaseButton from "@/components/atoms/BaseButton.vue";

import { useUiStore } from "@/stores/ui";
import { fetchTopicQuizHistory } from "@/api/topicQuiz";

const props = defineProps({
  subject: {
    type: String,
    default: "math",
  },
  // hide the title when embedding under another heading
  hideTitle: {
    type: Boolean,
    default: false,
  },
});

const route = useRoute();
const router = useRouter();
const { t } = useI18n();
const ui = useUiStore();

const loading = ref(false);
const error = ref("");
const quizzes = ref([]);

// selected topic codes for filtering ([] = show all)
const activeTopics = ref([]);

function topicLabel(topic) {
  return t(`quiz_topics.${topic}`) || topic;
}

// distinct topics present across all quizzes (for filter chips)
const availableTopics = computed(() => {
  const set = new Set();
  for (const quiz of quizzes.value) {
    for (const topic of quiz.topics || []) set.add(topic);
  }
  return [...set].sort();
});

const filteredQuizzes = computed(() => {
  if (!activeTopics.value.length) return quizzes.value;
  return quizzes.value.filter((quiz) =>
    (quiz.topics || []).some((topic) => activeTopics.value.includes(topic)),
  );
});

function toggleTopic(topic) {
  activeTopics.value = activeTopics.value.includes(topic)
    ? activeTopics.value.filter((x) => x !== topic)
    : [...activeTopics.value, topic];
}

function clearFilter() {
  activeTopics.value = [];
}

function formatDate(value) {
  if (!value) return "—";
  const d = new Date(value);
  return d.toLocaleDateString(undefined, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function openQuiz(quiz) {
  if (quiz.status === "finished") {
    router.push({
      name: "topic-quiz-result",
      params: {
        locale: route.params.locale,
        subject: quiz.subject,
        quizId: quiz.quiz_id,
      },
    });
  } else {
    router.push({
      name: "topic-quiz",
      params: {
        locale: route.params.locale,
        subject: quiz.subject,
        quizId: quiz.quiz_id,
      },
    });
  }
}

async function loadHistory() {
  loading.value = true;
  error.value = "";
  try {
    const res = await fetchTopicQuizHistory(props.subject);
    quizzes.value = res.data || [];
  } catch (e) {
    error.value =
      e?.response?.data?.detail || e.message || t("quiz.load_error");
    ui.toast.error(error.value);
  } finally {
    loading.value = false;
  }
}

onMounted(loadHistory);
defineExpose({ reload: loadHistory });
</script>

<template>
  <section class="history">
    <div v-if="!hideTitle" class="history-head">
      <h3>{{ t("quiz.history_title") }}</h3>
    </div>

    <!-- topic filter -->
    <div v-if="availableTopics.length" class="filter">
      <button
        type="button"
        class="chip"
        :class="{ active: !activeTopics.length }"
        @click="clearFilter"
      >
        {{ t("quiz.filter_all") }}
      </button>
      <button
        v-for="topic in availableTopics"
        :key="topic"
        type="button"
        class="chip"
        :class="{ active: activeTopics.includes(topic) }"
        @click="toggleTopic(topic)"
      >
        {{ topicLabel(topic) }}
      </button>
    </div>

    <div v-if="loading" class="state">{{ t("common.loading") }}</div>

    <div v-else-if="error" class="state error">{{ error }}</div>

    <div v-else-if="!quizzes.length" class="state muted">
      {{ t("quiz.no_history") }}
    </div>

    <div v-else-if="!filteredQuizzes.length" class="state muted">
      {{ t("quiz.nothing_found") }}
    </div>

    <div v-else class="list">
      <BaseCard v-for="quiz in filteredQuizzes" :key="quiz.quiz_id" class="row">
        <div class="row-main">
          <div class="row-top">
            <span
              class="badge"
              :class="quiz.status === 'finished' ? 'ok' : 'pending'"
            >
              {{
                quiz.status === "finished"
                  ? t("quiz.finished")
                  : t("quiz.in_progress")
              }}
            </span>
            <span class="date">{{ formatDate(quiz.started_at) }}</span>
          </div>

          <div class="topics">
            <span v-for="topic in quiz.topics" :key="topic" class="topic-tag">
              {{ topicLabel(topic) }}
            </span>
          </div>
        </div>

        <div class="row-side">
          <div v-if="quiz.status === 'finished'" class="score">
            {{ quiz.score }} / {{ quiz.total_questions }}
          </div>
          <div v-else class="score muted">
            {{ quiz.total_questions }} {{ t("quiz.questions_short") }}
          </div>

          <BaseButton
            :variant="quiz.status === 'finished' ? 'ghost' : 'primary'"
            @click="openQuiz(quiz)"
          >
            {{
              quiz.status === "finished" ? t("quiz.open") : t("quiz.continue")
            }}
          </BaseButton>
        </div>
      </BaseCard>
    </div>
  </section>
</template>

<style scoped>
.history {
  display: grid;
  gap: 14px;
}

.history-head h3 {
  margin: 0;
  font-size: var(--fz-20);
}

.filter {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.chip {
  padding: 7px 14px;
  border-radius: 999px;
  border: 1px solid var(--border);
  background: var(--bg-elev);
  color: var(--muted);
  cursor: pointer;
  font-size: var(--fz-14);
  transition: 0.15s ease;
}

.chip:hover {
  border-color: var(--color-primary);
}

.chip.active {
  background: var(--color-primary);
  border-color: var(--color-primary);
  color: #fff;
}

.state {
  min-height: 120px;
  display: grid;
  place-items: center;
  color: var(--muted);
}

.state.error {
  color: var(--danger);
}

.list {
  display: grid;
  gap: 12px;
}

.row {
  padding: 14px 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.row-main {
  display: grid;
  gap: 10px;
  min-width: 0;
}

.row-top {
  display: flex;
  align-items: center;
  gap: 10px;
}

.badge {
  font-size: var(--fz-12, 12px);
  padding: 3px 10px;
  border-radius: 999px;
  font-weight: 600;
}

.badge.ok {
  background: color-mix(in oklab, var(--success) 20%, transparent);
  color: var(--success);
}

.badge.pending {
  background: color-mix(in oklab, var(--warning) 20%, transparent);
  color: var(--warning);
}

.date {
  color: var(--muted);
  font-size: var(--fz-14);
}

.topics {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.topic-tag {
  font-size: var(--fz-12, 12px);
  padding: 3px 9px;
  border-radius: 8px;
  background: var(--bg-elev);
  border: 1px solid var(--border);
  color: var(--muted);
}

.row-side {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-shrink: 0;
}

.score {
  font-weight: 700;
  font-size: var(--fz-16);
}

.score.muted {
  color: var(--muted);
  font-weight: 400;
}

.muted {
  color: var(--muted);
}

@media (max-width: 640px) {
  .row {
    flex-direction: column;
    align-items: stretch;
  }

  .row-side {
    justify-content: space-between;
  }
}
</style>

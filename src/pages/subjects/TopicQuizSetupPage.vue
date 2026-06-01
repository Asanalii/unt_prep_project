<!-- src/pages/tests/TopicQuizSetupPage.vue -->
<script setup>
import { computed, onMounted, reactive, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useI18n } from "vue-i18n";

import BaseButton from "@/components/atoms/BaseButton.vue";
import BaseCard from "@/components/atoms/BaseCard.vue";

import { useUiStore } from "@/stores/ui";
import { fetchQuizTopics, createTopicQuiz } from "@/api/topicQuiz";

const route = useRoute();
const router = useRouter();
const { t } = useI18n();
const ui = useUiStore();

const MIN_PER_TOPIC = 10;
const MAX_PER_TOPIC = 50;
const STEP = 5;

const loading = ref(false);
const creating = ref(false);
const error = ref("");

const topics = ref([]);
// { [topic]: { selected: bool, count: number } }
const selection = reactive({});

const subject = computed(() => route.params.subject || "math");

const subjectLabel = computed(
  () => t(`subjects.${subject.value}`) || subject.value,
);

function topicLabel(topic) {
  return t(`quiz_topics.${topic}`) || topic;
}

function maxFor(topic) {
  const available = topics.value.find((x) => x.topic === topic)?.available ?? 0;
  return Math.min(MAX_PER_TOPIC, available);
}

const selectedList = computed(() =>
  topics.value
    .filter((x) => selection[x.topic]?.selected)
    .map((x) => ({ topic: x.topic, count: selection[x.topic].count })),
);

const totalQuestions = computed(() =>
  selectedList.value.reduce((sum, item) => sum + item.count, 0),
);

const canStart = computed(
  () => selectedList.value.length > 0 && !creating.value,
);

async function loadTopics() {
  loading.value = true;
  error.value = "";

  try {
    const res = await fetchQuizTopics(subject.value);
    topics.value = res.data?.topics || [];

    for (const item of topics.value) {
      selection[item.topic] = {
        selected: false,
        count: Math.min(MIN_PER_TOPIC, maxFor(item.topic)),
      };
    }
  } catch (e) {
    error.value =
      e?.response?.data?.detail || e.message || t("quiz.load_error");
    ui.toast.error(error.value);
  } finally {
    loading.value = false;
  }
}

function toggleTopic(topic) {
  const entry = selection[topic];
  if (!entry) return;
  if (maxFor(topic) < MIN_PER_TOPIC) return; // not enough questions
  entry.selected = !entry.selected;
}

function changeCount(topic, delta) {
  const entry = selection[topic];
  if (!entry) return;

  const next = entry.count + delta;
  entry.count = Math.max(MIN_PER_TOPIC, Math.min(maxFor(topic), next));
}

async function startQuiz() {
  if (!canStart.value) return;

  creating.value = true;
  error.value = "";

  try {
    const res = await createTopicQuiz({
      subject: subject.value,
      topics: selectedList.value,
    });

    const quizId = res.data?.quiz_id;

    router.push({
      name: "topic-quiz",
      params: {
        locale: route.params.locale,
        subject: subject.value,
        quizId,
      },
    });
  } catch (e) {
    error.value =
      e?.response?.data?.detail || e.message || t("quiz.create_error");
    ui.toast.error(error.value);
    creating.value = false;
  }
}

function goBack() {
  router.push({
    name: "subjects",
    params: { locale: route.params.locale },
  });
}

onMounted(loadTopics);
</script>

<template>
  <div class="setup-page">
    <div class="head">
      <div>
        <h1 class="title">{{ t("quiz.setup_title") }}</h1>
        <p class="subtitle">{{ subjectLabel }}</p>
      </div>
      <BaseButton variant="ghost" @click="goBack">
        {{ t("common.back") || "Назад" }}
      </BaseButton>
    </div>

    <BaseCard class="intro">
      <div class="intro-icon">🎯</div>
      <div>
        <h3>{{ t("quiz.intro_title") }}</h3>
        <p>{{ t("quiz.intro_text") }}</p>
      </div>
    </BaseCard>

    <div v-if="loading" class="state">{{ t("common.loading") }}</div>

    <div v-else-if="error && !topics.length" class="state error">
      {{ error }}
    </div>

    <template v-else>
      <div class="topics">
        <BaseCard
          v-for="item in topics"
          :key="item.topic"
          class="topic-card"
          :class="{ active: selection[item.topic]?.selected }"
        >
          <button
            class="topic-main"
            type="button"
            :disabled="maxFor(item.topic) < MIN_PER_TOPIC"
            @click="toggleTopic(item.topic)"
          >
            <span
              class="checkbox"
              :class="{ checked: selection[item.topic]?.selected }"
            >
              <span v-if="selection[item.topic]?.selected">✓</span>
            </span>

            <span class="topic-text">
              <span class="topic-name">{{ topicLabel(item.topic) }}</span>
              <span class="topic-available">
                {{ t("quiz.available_n", { n: item.available * 3 }) }}
              </span>
            </span>
          </button>

          <div v-if="selection[item.topic]?.selected" class="stepper">
            <button
              type="button"
              class="step-btn"
              :disabled="selection[item.topic].count <= MIN_PER_TOPIC"
              @click="changeCount(item.topic, -STEP)"
            >
              −
            </button>
            <span class="step-value">{{ selection[item.topic].count }}</span>
            <button
              type="button"
              class="step-btn"
              :disabled="selection[item.topic].count >= maxFor(item.topic)"
              @click="changeCount(item.topic, STEP)"
            >
              +
            </button>
          </div>
        </BaseCard>
      </div>

      <div class="footer">
        <div class="summary">
          <div class="summary-item">
            <span>{{ t("quiz.selected_topics") }}</span>
            <b>{{ selectedList.length }}</b>
          </div>
          <div class="summary-item">
            <span>{{ t("quiz.total_questions") }}</span>
            <b>{{ totalQuestions }}</b>
          </div>
        </div>

        <BaseButton :disabled="!canStart" @click="startQuiz">
          {{ creating ? t("quiz.creating") : t("quiz.start") }}
        </BaseButton>
      </div>
    </template>
  </div>
</template>

<style scoped>
.setup-page {
  padding: 16px;
  display: grid;
  gap: 16px;
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

.intro {
  display: flex;
  gap: 14px;
  align-items: flex-start;
  padding: 16px;
}

.intro-icon {
  font-size: 26px;
  line-height: 1;
}

.intro h3 {
  margin: 0 0 4px;
  font-size: var(--fz-16);
}

.intro p {
  margin: 0;
  color: var(--muted);
  line-height: 1.5;
}

.state {
  min-height: 160px;
  display: grid;
  place-items: center;
  color: var(--muted);
}

.state.error {
  color: var(--danger);
}

.topics {
  display: grid;
  gap: 12px;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
}

.topic-card {
  padding: 14px 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  transition: border-color 0.15s ease;
}

.topic-card.active {
  border-color: var(--color-primary);
  box-shadow: inset 0 0 0 1px var(--color-primary);
}

.topic-main {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
  min-width: 0;
  background: none;
  border: none;
  cursor: pointer;
  text-align: left;
  color: inherit;
  padding: 0;
}

.topic-main:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.checkbox {
  width: 22px;
  height: 22px;
  border-radius: 7px;
  border: 1.5px solid var(--border);
  display: grid;
  place-items: center;
  flex-shrink: 0;
  font-size: 13px;
  color: #fff;
  transition: 0.15s ease;
}

.checkbox.checked {
  background: var(--color-primary);
  border-color: var(--color-primary);
}

.topic-text {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.topic-name {
  font-weight: 600;
}

.topic-available {
  font-size: var(--fz-14);
  color: var(--muted);
}

.stepper {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.step-btn {
  width: 32px;
  height: 32px;
  border-radius: 9px;
  border: 1px solid var(--border);
  background: var(--bg-elev);
  color: var(--text);
  cursor: pointer;
  font-size: 18px;
  line-height: 1;
  display: grid;
  place-items: center;
  transition: 0.15s ease;
}

.step-btn:hover:not(:disabled) {
  border-color: var(--color-primary);
}

.step-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.step-value {
  min-width: 28px;
  text-align: center;
  font-weight: 700;
}

.footer {
  position: sticky;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 14px 16px;
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  box-shadow: var(--shadow);
}

.summary {
  display: flex;
  gap: 24px;
}

.summary-item {
  display: flex;
  flex-direction: column;
  gap: 2px;
  color: var(--muted);
  font-size: var(--fz-14);
}

.summary-item b {
  color: var(--text);
  font-size: var(--fz-20);
}

@media (max-width: 640px) {
  .head,
  .footer {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>

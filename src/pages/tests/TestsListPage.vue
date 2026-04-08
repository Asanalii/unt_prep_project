<!-- src/pages/tests/TestsListPage.vue -->
<script setup>
import { computed, onMounted, ref } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useI18n } from "vue-i18n";

import BaseCard from "@/components/atoms/BaseCard.vue";
import BaseButton from "@/components/atoms/BaseButton.vue";
import { useUiStore } from "@/stores/ui";

import { fetchSubjects, fetchMyAttempts, createAttempt } from "./api/tests";

const router = useRouter();
const route = useRoute();
const { t } = useI18n();
const ui = useUiStore();

const loading = ref(false);
const attemptsLoading = ref(false);
const starting = ref(false);

const mode = ref("subject"); // full | subject
const selectedSubject = ref("");

const subjects = ref([]);
const attempts = ref([]);

const fullTestAvailable = ref(false); // пока backend не поддерживает

const subjectOptions = computed(() =>
  subjects.value.map((item) => ({
    value: item.code,
    label: t(`subjects.${item.code}`) || item.name || item.code,
    duration: item.duration_minutes,
    questionCount: item.question_count,
  })),
);

const currentSubject = computed(() =>
  subjectOptions.value.find((item) => item.value === selectedSubject.value),
);

const currentTitle = computed(() => {
  if (mode.value === "full") {
    return t("tests_page.full_test");
  }

  return `${t("tests_page.subject_test")}: ${currentSubject.value?.label || "—"}`;
});

const currentDescription = computed(() => {
  if (mode.value === "full") {
    return t("tests_page.full_test_desc");
  }

  if (!currentSubject.value) {
    return t("tests_page.choose_subject_first");
  }

  return t("tests_page.subject_test_desc_with_meta", {
    questions: currentSubject.value.questionCount || 0,
    duration: currentSubject.value.duration || 0,
  });
});

async function loadSubjects() {
  try {
    const res = await fetchSubjects();
    subjects.value = res?.data || [];

    if (!selectedSubject.value && subjects.value.length) {
      selectedSubject.value = subjects.value[0].code;
    }
  } catch (e) {
    ui.toast.error(e.message || t("tests_page.load_error"));
  }
}

async function loadAttempts() {
  attemptsLoading.value = true;

  try {
    const res = await fetchMyAttempts();
    attempts.value = res?.data || [];
  } catch (e) {
    ui.toast.error(e.message || t("tests_page.load_attempts_error"));
  } finally {
    attemptsLoading.value = false;
  }
}

async function loadPage() {
  loading.value = true;

  try {
    await Promise.all([loadSubjects(), loadAttempts()]);
  } finally {
    loading.value = false;
  }
}

onMounted(loadPage);

async function onStart() {
  try {
    if (mode.value === "full") {
      ui.toast.info?.(t("tests_page.full_test_soon"));
      return;
    }

    if (!selectedSubject.value) {
      ui.toast.error(t("tests_page.choose_subject_first"));
      return;
    }

    starting.value = true;
    ui.setLoading(true, t("tests_page.starting"));

    const res = await createAttempt({
      subject: selectedSubject.value,
    });

    const attemptId = res?.data?.attempt_id;

    if (!attemptId) {
      throw new Error(t("tests_page.start_error"));
    }

    router.push({
      name: "test-run",
      params: {
        locale: route.params.locale,
      },
      query: {
        attemptId,
      },
    });
  } catch (e) {
    ui.toast.error(e.message || t("tests_page.start_error"));
  } finally {
    starting.value = false;
    ui.setLoading(false);
  }
}

function openAttempt(attempt) {
  router.push({
    name: "attempt",
    params: {
      locale: route.params.locale,
      id: attempt.attempt_id,
    },
  });
}

function getAttemptTitle(attempt) {
  return `${t("tests_page.subject_test")} — ${
    t(`subjects.${attempt.subject}`) || attempt.subject
  }`;
}
</script>

<template>
  <div class="page">
    <BaseCard class="hero">
      <div class="hero-head">
        <div>
          <h1 class="page-title">{{ t("tests_page.title") }}</h1>
          <p class="page-subtitle">{{ t("tests_page.subtitle") }}</p>
        </div>
      </div>

      <div class="mode-switch">
        <button
          class="mode-btn"
          :class="{ active: mode === 'full' }"
          @click="mode = 'full'"
        >
          {{ t("tests_page.full_test") }}
        </button>

        <button
          class="mode-btn"
          :class="{ active: mode === 'subject' }"
          @click="mode = 'subject'"
        >
          {{ t("tests_page.subject_test") }}
        </button>
      </div>

      <div v-if="mode === 'full' && !fullTestAvailable" class="soon-box">
        {{ t("tests_page.full_test_soon") }}
      </div>

      <div v-if="mode === 'subject'" class="field">
        <label>{{ t("tests_page.choose_subject") }}</label>
        <select v-model="selectedSubject" class="native-select">
          <option
            v-for="item in subjectOptions"
            :key="item.value"
            :value="item.value"
          >
            {{ item.label }}
          </option>
        </select>
      </div>

      <div class="current-box">
        <div class="current-title">{{ currentTitle }}</div>
        <div class="current-text">{{ currentDescription }}</div>
      </div>

      <div class="actions">
        <BaseButton
          :disabled="starting || (mode === 'full' && !fullTestAvailable)"
          @click="onStart"
        >
          {{
            starting
              ? t("tests_page.starting")
              : mode === "full"
                ? t("tests_page.start_full")
                : t("tests_page.start_subject")
          }}
        </BaseButton>
      </div>
    </BaseCard>

    <section class="section">
      <div class="section-head">
        <h2>{{ t("tests_page.available_templates") }}</h2>
      </div>

      <div v-if="loading" class="muted">{{ t("common.loading") }}</div>

      <div v-else-if="subjectOptions.length" class="grid">
        <BaseCard v-for="item in subjectOptions" :key="item.value" class="tile">
          <div class="title">
            {{ item.label }}
          </div>

          <div class="muted">
            {{
              t("tests_page.questions_count", {
                count: item.questionCount || 0,
              })
            }}
          </div>

          <div class="muted">
            {{ t("common.duration_m", { min: item.duration || 0 }) }}
          </div>
        </BaseCard>
      </div>

      <div v-else class="muted">
        {{ t("tests_page.no_templates") }}
      </div>
    </section>

    <section class="section">
      <div class="section-head">
        <h2>{{ t("tests_page.all_attempts") }}</h2>
      </div>

      <div v-if="attemptsLoading" class="muted">{{ t("common.loading") }}</div>

      <div v-else-if="attempts.length" class="attempts-list">
        <BaseCard
          v-for="attempt in attempts"
          :key="attempt.attempt_id"
          class="attempt-card"
        >
          <div class="attempt-main">
            <div class="attempt-title">
              {{ getAttemptTitle(attempt) }}
            </div>

            <div class="attempt-meta">
              <span>
                {{ t("dashboard.table.started") }}:
                {{ attempt.started_at || "—" }}
              </span>
              <span>
                {{ t("dashboard.table.score") }}:
                {{ attempt.score ?? "—" }}
              </span>
              <span>
                {{ t("dashboard.table.status") }}:
                {{ attempt.status || "—" }}
              </span>
            </div>
          </div>

          <div class="attempt-actions">
            <BaseButton variant="ghost" @click="openAttempt(attempt)">
              {{ t("dashboard.view") }}
            </BaseButton>
          </div>
        </BaseCard>
      </div>

      <div v-else class="muted">
        {{ t("tests_page.no_attempts") }}
      </div>
    </section>
  </div>
</template>

<style scoped>
.page {
  display: grid;
  gap: var(--s-4);
}

.hero,
.tile,
.attempt-card {
  padding: var(--s-5);
}

.hero-head {
  margin-bottom: var(--s-4);
}

.page-title {
  margin: 0 0 var(--s-2);
  font-size: var(--fz-24);
}

.page-subtitle {
  margin: 0;
  color: var(--muted);
}

.mode-switch {
  display: inline-grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--s-2);
  margin-bottom: var(--s-4);
}

.mode-btn {
  border: 1px solid var(--border);
  background: var(--bg-elev);
  color: var(--text);
  border-radius: var(--radius-sm);
  padding: 10px 14px;
  cursor: pointer;
}

.mode-btn.active {
  background: var(--color-primary);
  border-color: var(--color-primary);
  color: white;
}

.field {
  margin-bottom: var(--s-4);
}

label {
  display: block;
  margin-bottom: 6px;
  color: var(--muted);
  font-size: var(--fz-14);
}

.native-select {
  width: 100%;
  border: 1px solid var(--border);
  background: var(--bg-elev);
  color: var(--text);
  border-radius: var(--radius-sm);
  padding: 12px 14px;
  outline: none;
}

.current-box,
.soon-box {
  border: 1px solid var(--border);
  background: var(--bg-elev);
  border-radius: var(--radius-sm);
  padding: var(--s-4);
  margin-bottom: var(--s-4);
}

.current-title {
  font-weight: 700;
  margin-bottom: var(--s-2);
}

.current-text,
.soon-box {
  color: var(--muted);
}

.actions {
  display: flex;
  justify-content: flex-start;
}

.section {
  display: grid;
  gap: var(--s-3);
}

.section-head h2 {
  margin: 0;
}

.grid {
  display: grid;
  gap: var(--s-4);
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
}

.title {
  font-weight: 700;
  margin-bottom: var(--s-1);
}

.muted {
  color: var(--muted);
}

.attempts-list {
  display: grid;
  gap: var(--s-3);
}

.attempt-card {
  display: flex;
  justify-content: space-between;
  gap: var(--s-4);
  align-items: center;
}

.attempt-title {
  font-weight: 700;
  margin-bottom: var(--s-2);
}

.attempt-meta {
  display: flex;
  gap: var(--s-4);
  flex-wrap: wrap;
  color: var(--muted);
  font-size: var(--fz-14);
}

.attempt-actions {
  flex-shrink: 0;
}

@media (max-width: 768px) {
  .attempt-card {
    flex-direction: column;
    align-items: stretch;
  }

  .mode-switch {
    width: 100%;
  }
}
</style>

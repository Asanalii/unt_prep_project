<script setup>
// ===== Libraries
import { ref, computed } from "vue";
import { useRoute } from "vue-router";
import { useI18n } from "vue-i18n";

// ===== Actions / Composables / Helpers
import { useUiStore } from "@/stores/ui";

// ===== Components / Atoms / UI
import BaseCard from "@/components/atoms/BaseCard.vue";
import BaseButton from "@/components/atoms/BaseButton.vue";

// ===== Local state
const { t } = useI18n();
const ui = useUiStore();

// Предметы (активны только Математика и Информатика)
const subjects = [
  { id: "math", labelKey: "subjects.math", enabled: true },
  { id: "cs", labelKey: "subjects.cs", enabled: true },
  { id: "physics", labelKey: "subjects.physics", enabled: false },
  { id: "chemistry", labelKey: "subjects.chemistry", enabled: false },
  { id: "biology", labelKey: "subjects.biology", enabled: false },
  { id: "history", labelKey: "subjects.history", enabled: false },
  { id: "geography", labelKey: "subjects.geography", enabled: false },
  { id: "english", labelKey: "subjects.english", enabled: false },
];

const selectedSubject = ref(null); //<null | string>(null);

// Топики по предмету
// const topicsBySubject: Record<string, { id: string; labelKey: string }[]> = {
const topicsBySubject = {
  math: [
    { id: "algebra", labelKey: "topics.math.algebra" },
    { id: "geometry", labelKey: "topics.math.geometry" },
    { id: "trig", labelKey: "topics.math.trigonometry" },
    { id: "calculus", labelKey: "topics.math.calculus" },
    { id: "probstat", labelKey: "topics.math.probstat" },
    { id: "number", labelKey: "topics.math.numberTheory" },
  ],
  cs: [
    { id: "algorithms", labelKey: "topics.cs.algorithms" },
    { id: "ds", labelKey: "topics.cs.dataStructures" },
    { id: "prog", labelKey: "topics.cs.programmingBasics" },
    { id: "db", labelKey: "topics.cs.databases" },
    { id: "logic", labelKey: "topics.cs.booleanLogic" },
    { id: "net", labelKey: "topics.cs.networks" },
  ],
};

const visibleTopics = computed(() =>
  selectedSubject.value ? topicsBySubject[selectedSubject.value] : []
);

// выбор нескольких топиков
const selectedTopics = ref([]);
function toggleTopic(id) {
  const i = selectedTopics.value.indexOf(id);
  if (i === -1) selectedTopics.value.push(id);
  else selectedTopics.value.splice(i, 1);
}

// тип вопроса
const questionType = ref("single"); // 'single' | 'multi' | 'context'

// prompt
const promptText = ref("");

// генерировать (пока — заглушка)
function onGenerate() {
  if (!selectedSubject.value) {
    ui.toast.info(t("dashboard.pick_subject_first"));
    return;
  }
  ui.toast.success(t("toast.welcome"));
}

function selectSubject(id) {
  selectedSubject.value = id;
  selectedTopics.value = [];
}
</script>

<template>
  <div class="dash">
    <!-- Title -->
    <h1 class="title">{{ t("dashboard.title") }}</h1>

    <!-- Subject selector -->
    <BaseCard class="panel">
      <div class="section-title">{{ t("dashboard.pick_subject") }}</div>

      <div class="subjects">
        <button
          v-for="s in subjects"
          :key="s.id"
          class="subject clickable"
          :class="{
            'is-active': selectedSubject === s.id,
            disabled: !s.enabled,
          }"
          :disabled="!s.enabled"
          @click="selectSubject(s.id)"
          :title="s.enabled ? '' : t('dashboard.soon')"
        >
          {{ t(s.labelKey) }}
          <span v-if="!s.enabled" class="badge">{{ t("common.soon") }}</span>
        </button>
      </div>

      <!-- Tabs (как в макете) -->
      <div class="tabs">
        <button class="tab clickable" :class="{ 'is-active': true }">
          <span class="dot"></span>{{ t("dashboard.add_prompt_image") }}
        </button>
        <button class="tab">{{ t("dashboard.prompt_using_image") }}</button>
      </div>

      <!-- Controls row (topics + question type), показываем только после выбора предмета -->
      <div v-if="selectedSubject" class="controls">
        <!-- Topics -->
        <div class="group">
          <div class="group-title">{{ t("dashboard.topics") }}</div>
          <div class="chips">
            <button
              v-for="tpc in visibleTopics"
              :key="tpc.id"
              class="chip clickable"
              :class="{ 'is-active': selectedTopics.includes(tpc.id) }"
              @click="toggleTopic(tpc.id)"
            >
              {{ t(tpc.labelKey) }}
            </button>
          </div>
        </div>

        <!-- Question type -->
        <div class="group type">
          <div class="group-title">{{ t("dashboard.question_type") }}</div>
          <div class="type-switch">
            <button
              class="type-btn clickable"
              :class="{ 'is-active': questionType === 'single' }"
              @click="questionType = 'single'"
            >
              {{ t("dashboard.type_single") }}
            </button>
            <button
              class="type-btn clickable"
              :class="{ 'is-active': questionType === 'multi' }"
              @click="questionType = 'multi'"
            >
              {{ t("dashboard.type_multi") }}
            </button>
            <button
              class="type-btn clickable"
              :class="{ 'is-active': questionType === 'context' }"
              @click="questionType = 'context'"
            >
              {{ t("dashboard.type_context") }}
            </button>
          </div>
        </div>
      </div>

      <!-- Prompt area -->
      <div class="prompt">
        <textarea
          v-model="promptText"
          class="prompt-input"
          rows="5"
          :placeholder="t('dashboard.prompt_placeholder')"
        ></textarea>

        <div class="prompt-actions">
          <BaseButton size="md" @click="onGenerate">{{
            t("dashboard.generate")
          }}</BaseButton>
        </div>
      </div>
    </BaseCard>
  </div>
</template>

<style scoped>
/* ===== Layout */
.dash {
  display: grid;
  gap: var(--s-5);
}
.title {
  font-size: 28px;
  line-height: 1.2;
  font-weight: 700;
  margin: 0;
  color: var(--text);
}
.panel {
  padding: var(--s-5);
  display: grid;
  gap: var(--s-5);
}
.section-title {
  color: var(--muted);
  font-size: var(--fz-13);
}

/* ===== Utility: clickable */
:root {
  --accent-color: var(--accent, #6c5ce7);
}

.clickable {
  cursor: pointer;
  user-select: none;
  transition: background-color 0.15s, box-shadow 0.15s, border-color 0.15s,
    color 0.15s, transform 0.05s;
}
.clickable:hover {
  border-color: var(--accent-color);
  box-shadow: 0 0 0 2px
    color-mix(in oklab, var(--accent-color) 22%, transparent);
}
.clickable:active {
  transform: translateY(0.5px);
}
.clickable.is-active {
  background: color-mix(in oklab, var(--accent-color) 14%, var(--card));
  color: var(--text);
  border-color: var(--accent-color);
  box-shadow: 0 0 0 2px
      color-mix(in oklab, var(--accent-color) 28%, transparent),
    inset 0 0 0 1px color-mix(in oklab, var(--accent-color) 35%, var(--border));
}
.clickable:focus-visible,
.prompt-input:focus-visible {
  outline: 2px solid var(--accent-color);
  outline-offset: 2px;
}

/* ===== Subjects */
.subjects {
  display: flex;
  flex-wrap: wrap;
  gap: var(--s-2);
}
.subject {
  padding: 8px 12px;
  border-radius: 999px;
  border: 1px solid var(--border);
  background: var(--bg);
  color: var(--muted);
  position: relative;
}
.subject.disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
.subject.active {
  /* fallback для старой разметки */
  background: color-mix(in oklab, var(--accent-color) 14%, var(--card));
  color: var(--text);
  border-color: var(--accent-color);
}
.badge {
  margin-left: 8px;
  font-size: 11px;
  padding: 2px 6px;
  border-radius: 999px;
  background: var(--card);
  border: 1px solid var(--border);
}

/* ===== Tabs */
.tabs {
  display: flex;
  gap: var(--s-3);
}
.tab {
  padding: 10px 14px;
  border-radius: 999px;
  border: 1px solid var(--border);
  background: var(--bg);
  color: var(--muted);
}
.tab.active {
  /* fallback */
  background: color-mix(in oklab, var(--accent-color) 12%, var(--card));
  color: var(--text);
  border-color: var(--accent-color);
}
.tab .dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--accent-color);
  display: inline-block;
  margin-right: 8px;
}

/* ===== Controls (topics + type) */
.controls {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: var(--s-4);
  align-items: start;
}
.group {
  display: grid;
  gap: var(--s-2);
}
.group-title {
  color: var(--muted);
  font-size: var(--fz-13);
}

/* Topics (chips) */
.chips {
  display: flex;
  flex-wrap: wrap;
  gap: var(--s-2);
}
.chip {
  padding: 8px 12px;
  border-radius: 999px;
  border: 1px solid var(--border);
  background: var(--bg);
  color: var(--muted);
}
.chip.selected {
  /* fallback */
  background: color-mix(in oklab, var(--accent-color) 10%, var(--card));
  color: var(--text);
  border-color: var(--accent-color);
}

/* Question type */
.type {
  justify-self: end;
}
.type-switch {
  display: inline-flex;
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: 999px;
}
.type-btn {
  padding: 8px 12px;
  border: 1px solid transparent;
  background: transparent;
  color: var(--muted);
  border-radius: 999px;
}
.type-btn.active {
  /* fallback */
  background: color-mix(in oklab, var(--accent-color) 12%, var(--card));
  color: var(--text);
  border-color: var(--accent-color);
  box-shadow: 0 0 0 2px
    color-mix(in oklab, var(--accent-color) 25%, transparent);
}

/* ===== Prompt */
.prompt {
  display: grid;
  gap: var(--s-3);
}
.prompt-input {
  width: 100%;
  border-radius: 16px;
  padding: 16px 18px;
  background: var(--bg);
  color: var(--text);
  border: 1px solid var(--border);
  outline: none;
  resize: vertical;
}
.prompt-input::placeholder {
  color: var(--muted);
}
.prompt-actions {
  display: flex;
  justify-content: flex-end;
}
</style>

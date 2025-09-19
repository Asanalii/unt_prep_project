<script setup>
// ===== Libraries
import { ref, computed, watch } from "vue";
import { useI18n } from "vue-i18n";
import { useAuthStore } from "@/stores/auth";

// ===== UI
import TestTopbar from "@/components/test/TestTopbar.vue";
import TestSidebar from "@/components/test/TestSidebar.vue";
import TestPaginator from "@/components/test/TestPaginator.vue";
import TestQuestion from "@/components/test/TestQuestion.vue";

const { t } = useI18n();
const auth = useAuthStore();

// ---- Предметы ЕНТ (3 обязательных + 2 выборочных)
const subjects = [
  { id: "literacy", name: t("ent.literacy") }, // Грамотность чтения
  { id: "mathlit", name: t("ent.math_literacy") }, // Математическая грамотность
  { id: "history", name: t("subjects.history") }, // История Казахстана
  { id: "math", name: t("subjects.math") }, // Выборочный 1
  { id: "cs", name: t("subjects.cs") }, // Выборочный 2
];

// ---- Мок вопросов (пока)
const allQuestions = ref([
  // history
  {
    id: "h1",
    subject: "history",
    stem: "Земли древних кочевников на территории Казахстана называли...",
    choices: [
      { id: "A", text: "пазырыкской" },
      { id: "B", text: "андроновской" },
      { id: "C", text: "ботайской" },
      { id: "D", text: "ужской" },
    ],
    multiple: false,
  },

  // literacy (грамотность чтения)
  {
    id: "l1",
    subject: "literacy",
    stem:
      "Среди жителей деревни Кок-Маржан было много ремесленников... (обрезано). " +
      "Согласно тексту, бубны:",
    choices: [
      { id: "A", text: "изготавливались из железа" },
      { id: "B", text: "ковали по одному шаблону" },
      { id: "C", text: "имели практическое применение" },
      { id: "D", text: "делали из фаната собак" },
    ],
    multiple: false,
  },

  // math
  {
    id: "m1",
    subject: "math",
    stem:
      "Во время дождя лист лотоса полностью наполнился водой. " +
      "Определите объём воды (π≈3,14).",
    media: { img: "https://picsum.photos/seed/lotus/720/320" },
    choices: [
      { id: "A", text: "6,28 м³" },
      { id: "B", text: "0,0628 м³" },
      { id: "C", text: "0,628 м³" },
      { id: "D", text: "0,328 м³" },
    ],
    multiple: false,
  },

  // мат. грамотность (пока маленькая заглушка)
  {
    id: "ml1",
    subject: "mathlit",
    stem: "Какое из чисел больше: 0.3 или 0.25?",
    choices: [
      { id: "A", text: "0.3" },
      { id: "B", text: "0.25" },
      { id: "C", text: "равны" },
      { id: "D", text: "недостаточно данных" },
    ],
    multiple: false,
  },

  // cs
  {
    id: "cs1",
    subject: "cs",
    stem: "Что такое алгоритм?",
    choices: [
      { id: "A", text: "Последовательность шагов для решения задачи" },
      { id: "B", text: "Файл с расширением .exe" },
      { id: "C", text: "Язык программирования" },
      { id: "D", text: "Сеть компьютеров" },
    ],
    multiple: false,
  },
]);

// ====== Состояние ======
const subjectIndex = ref(0); // текущий предмет
const currentSubject = computed(() => subjects[subjectIndex.value]);
const username = computed(() => auth.user?.name || auth.user?.email || "User");

// Фильтр вопросов по предмету
const questions = computed(() =>
  allQuestions.value.filter((q) => q.subject === currentSubject.value.id)
);

// Индекс вопроса внутри предмета
const qIndex = ref(0);
watch(currentSubject, () => {
  qIndex.value = 0;
}); // при смене предмета — на 1-й вопрос
const total = computed(() => questions.value.length);
const current = computed(() => questions.value[qIndex.value]);

// Ответы: Map<questionId, Set<choiceId>>
const answers = ref(new Map());
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

// Навигация по вопросам
function goTo(i) {
  if (i >= 0 && i < total.value) qIndex.value = i;
}
const prevQ = () => goTo(qIndex.value - 1);
const nextQ = () => goTo(qIndex.value + 1);

// Навигация по предметам
const hasPrevSubject = computed(() => subjectIndex.value > 0);
const hasNextSubject = computed(() => subjectIndex.value < subjects.length - 1);
function prevSubject() {
  if (hasPrevSubject.value) subjectIndex.value--;
}
function nextSubject() {
  if (hasNextSubject.value) subjectIndex.value++;
}

// Левый сайдбар (бургер)
const showLeft = ref(true);
</script>

<template>
  <div class="runner">
    <TestTopbar
      :subject="currentSubject"
      :username="username"
      :has-prev="hasPrevSubject"
      :has-next="hasNextSubject"
      @toggle-menu="showLeft = !showLeft"
      @prev-subject="prevSubject"
      @next-subject="nextSubject"
    />

    <div class="layout">
      <TestSidebar
        :show="showLeft"
        :username="username"
        :subjects="subjects"
        :active-subject-id="currentSubject.id"
        @pick-subject="
          (id) => {
            subjectIndex.value = subjects.findIndex((s) => s.id === id);
          }
        "
        @toggle="showLeft = !showLeft"
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
            <button class="ghost" :disabled="qIndex === 0" @click="prevQ">
              {{ t("test.prev") }}
            </button>
            <button
              class="primary"
              :disabled="qIndex === total - 1"
              @click="nextQ"
            >
              {{ t("test.next") }}
            </button>
          </div>
        </div>

        <TestQuestion
          v-if="current"
          :question="current"
          :checked="(cId) => isChecked(current.id, cId)"
          @toggle="(cId) => toggleAnswer(current.id, cId, current.multiple)"
        />
      </main>
    </div>
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
  grid-template-columns: 260px 1fr;
  height: calc(100vh - 48px);
}
.main {
  padding: 14px;
  overflow: auto;
  display: grid;
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
button.primary {
  padding: 8px 12px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--accent-color);
  background: color-mix(in oklab, var(--accent-color) 14%, var(--card));
  color: var(--text);
  cursor: pointer;
}
button.primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
button.ghost {
  padding: 8px 12px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--border);
  background: var(--bg);
  color: var(--text);
  cursor: pointer;
}
button.ghost:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>

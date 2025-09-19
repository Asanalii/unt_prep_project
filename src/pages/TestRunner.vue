<script setup>
import { ref, computed, watch } from "vue";
import { useI18n } from "vue-i18n";
import { useAuthStore } from "@/stores/auth";

import TestTopbar from "@/components/test/TestTopbar.vue";
import TestSidebar from "@/components/test/TestSidebar.vue";
import TestPaginator from "@/components/test/TestPaginator.vue";
import TestQuestion from "@/components/test/TestQuestion.vue";

const { t } = useI18n();
const auth = useAuthStore();

// ----- Предметы ЕНТ (3 обязательных + 2 выборочных)
const subjects = [
  { id: "literacy", name: t("ent.literacy") }, // Грамотность чтения
  { id: "mathlit", name: t("ent.math_literacy") }, // Математическая грамотность
  { id: "history", name: t("subjects.history") }, // История Казахстана
  { id: "math", name: t("subjects.math") }, // Математика
  { id: "cs", name: t("subjects.cs") }, // Информатика
];

// ----- Моки вопросов: по 5 на предмет
const allQuestions = ref([
  // HISTORY (5)
  {
    id: "h1",
    subject: "history",
    stem: "К какой культуре относят петроглифы Тамгалы?",
    choices: [
      { id: "A", text: "Сакской" },
      { id: "B", text: "Ботайской" },
      { id: "C", text: "Андроновской" },
      { id: "D", text: "Уйсунской" },
    ],
    multiple: false,
  },
  {
    id: "h2",
    subject: "history",
    stem: "Период правления Абылай хана:",
    choices: [
      { id: "A", text: "XVII в." },
      { id: "B", text: "XVIII в." },
      { id: "C", text: "XIX в." },
      { id: "D", text: "XVI в." },
    ],
    multiple: false,
  },
  {
    id: "h3",
    subject: "history",
    stem: "Земли древних кочевников на территории Казахстана называли…",
    choices: [
      { id: "A", text: "пазырыкской" },
      { id: "B", text: "андроновской" },
      { id: "C", text: "ботайской" },
      { id: "D", text: "ужской" },
    ],
    multiple: false,
  },
  {
    id: "h4",
    subject: "history",
    stem: "Столица Казахского ханства при Касым хане:",
    choices: [
      { id: "A", text: "Сыгнак" },
      { id: "B", text: "Тараз" },
      { id: "C", text: "Отрар" },
      { id: "D", text: "Суяб" },
    ],
    multiple: false,
  },
  {
    id: "h5",
    subject: "history",
    stem: "Год принятия Декларации о государственном суверенитете КазССР:",
    choices: [
      { id: "A", text: "1990" },
      { id: "B", text: "1991" },
      { id: "C", text: "1989" },
      { id: "D", text: "1992" },
    ],
    multiple: false,
  },

  // LITERACY (5)
  {
    id: "l1",
    subject: "literacy",
    stem: "Выберите утверждение, НЕ соответствующее смыслу текста (чит. грамотность).",
    choices: [
      { id: "A", text: "Автор соглашается с тезисом" },
      { id: "B", text: "Автор приводит пример" },
      { id: "C", text: "Автор опровергает довод" },
      { id: "D", text: "Автор избегает оценок" },
    ],
    multiple: false,
  },
  {
    id: "l2",
    subject: "literacy",
    stem: "Основная мысль первого абзаца:",
    choices: [
      { id: "A", text: "Описан фон" },
      { id: "B", text: "Сформулирована проблема" },
      { id: "C", text: "Приведено решение" },
      { id: "D", text: "Даны итоги" },
    ],
    multiple: false,
  },
  {
    id: "l3",
    subject: "literacy",
    stem: "Какое слово лучше всего передаёт настроение текста?",
    choices: [
      { id: "A", text: "Сдержанное" },
      { id: "B", text: "Ироничное" },
      { id: "C", text: "Воодушевлённое" },
      { id: "D", text: "Тревожное" },
    ],
    multiple: false,
  },
  {
    id: "l4",
    subject: "literacy",
    stem: "Какая из тез сочетается с приведённым примером?",
    choices: [
      { id: "A", text: "Про эффективность" },
      { id: "B", text: "Про безопасность" },
      { id: "C", text: "Про доступность" },
      { id: "D", text: "Про надёжность" },
    ],
    multiple: false,
  },
  {
    id: "l5",
    subject: "literacy",
    stem: "Согласно тексту, бубны:",
    choices: [
      { id: "A", text: "из железа" },
      { id: "B", text: "по шаблону" },
      { id: "C", text: "имели применение" },
      { id: "D", text: "делали из фаната собак" },
    ],
    multiple: false,
  },

  // MATH LITERACY (5)
  {
    id: "ml1",
    subject: "mathlit",
    stem: "Какое из чисел больше?",
    choices: [
      { id: "A", text: "0.3" },
      { id: "B", text: "0.25" },
      { id: "C", text: "равны" },
      { id: "D", text: "н/д" },
    ],
    multiple: false,
  },
  {
    id: "ml2",
    subject: "mathlit",
    stem: "Цена товара 120 тг. Скидка 25%. Цена после скидки:",
    choices: [
      { id: "A", text: "90" },
      { id: "B", text: "95" },
      { id: "C", text: "100" },
      { id: "D", text: "85" },
    ],
    multiple: false,
  },
  {
    id: "ml3",
    subject: "mathlit",
    stem: "График линейной функции — это:",
    choices: [
      { id: "A", text: "прямая" },
      { id: "B", text: "окружность" },
      { id: "C", text: "гипербола" },
      { id: "D", text: "парабола" },
    ],
    multiple: false,
  },
  {
    id: "ml4",
    subject: "mathlit",
    stem: "Среднее арифм. чисел 4 и 10 равно:",
    choices: [
      { id: "A", text: "7" },
      { id: "B", text: "6" },
      { id: "C", text: "8" },
      { id: "D", text: "5" },
    ],
    multiple: false,
  },
  {
    id: "ml5",
    subject: "mathlit",
    stem: "Сколько процентов от 200 составляет 30?",
    choices: [
      { id: "A", text: "15%" },
      { id: "B", text: "20%" },
      { id: "C", text: "10%" },
      { id: "D", text: "25%" },
    ],
    multiple: false,
  },

  // MATH (5)
  {
    id: "m1",
    subject: "math",
    stem: "Найдите производную f(x)=x².",
    choices: [
      { id: "A", text: "2x" },
      { id: "B", text: "x" },
      { id: "C", text: "x³" },
      { id: "D", text: "2" },
    ],
    multiple: false,
  },
  {
    id: "m2",
    subject: "math",
    stem: "Корни уравнения x²-1=0:",
    choices: [
      { id: "A", text: "±1" },
      { id: "B", text: "0 и 1" },
      { id: "C", text: "±2" },
      { id: "D", text: "нет" },
    ],
    multiple: false,
  },
  {
    id: "m3",
    subject: "math",
    stem: "Во время дождя лист лотоса полностью наполнился водой. Определите объём воды (π≈3,14).",
    media: { img: "https://picsum.photos/seed/lotus/720/320" },
    choices: [
      { id: "A", text: "6,28 м³" },
      { id: "B", text: "0,0628 м³" },
      { id: "C", text: "0,628 м³" },
      { id: "D", text: "0,328 м³" },
    ],
    multiple: false,
  },
  {
    id: "m4",
    subject: "math",
    stem: "Сумма углов треугольника равна:",
    choices: [
      { id: "A", text: "180°" },
      { id: "B", text: "90°" },
      { id: "C", text: "270°" },
      { id: "D", text: "360°" },
    ],
    multiple: false,
  },
  {
    id: "m5",
    subject: "math",
    stem: "log₁₀(100) =",
    choices: [
      { id: "A", text: "2" },
      { id: "B", text: "10" },
      { id: "C", text: "1" },
      { id: "D", text: "0" },
    ],
    multiple: false,
  },

  // CS (5)
  {
    id: "cs1",
    subject: "cs",
    stem: "Что такое алгоритм?",
    choices: [
      { id: "A", text: "Последовательность шагов" },
      { id: "B", text: "Файл .exe" },
      { id: "C", text: "Язык" },
      { id: "D", text: "Сеть" },
    ],
    multiple: false,
  },
  {
    id: "cs2",
    subject: "cs",
    stem: "Массив — это:",
    choices: [
      { id: "A", text: "Структура данных" },
      { id: "B", text: "Тип цикла" },
      { id: "C", text: "IDE" },
      { id: "D", text: "Сервер" },
    ],
    multiple: false,
  },
  {
    id: "cs3",
    subject: "cs",
    stem: "Что хранит БД?",
    choices: [
      { id: "A", text: "Данные" },
      { id: "B", text: "Алгоритмы" },
      { id: "C", text: "Стили" },
      { id: "D", text: "Маршруты" },
    ],
    multiple: false,
  },
  {
    id: "cs4",
    subject: "cs",
    stem: "Булева логика оперирует значениями:",
    choices: [
      { id: "A", text: "true/false" },
      { id: "B", text: "int/float" },
      { id: "C", text: "string" },
      { id: "D", text: "null" },
    ],
    multiple: false,
  },
  {
    id: "cs5",
    subject: "cs",
    stem: "IP — это:",
    choices: [
      { id: "A", text: "Адрес узла в сети" },
      { id: "B", text: "Тип кабеля" },
      { id: "C", text: "ОС" },
      { id: "D", text: "Фреймворк" },
    ],
    multiple: false,
  },
]);

// ===== Состояние
const subjectIndex = ref(0);
const currentSubject = computed(() => subjects[subjectIndex.value]);
const username = computed(() => auth.user?.name || auth.user?.email || "User");

// вопросы текущего предмета
const questions = computed(() =>
  allQuestions.value.filter((q) => q.subject === currentSubject.value.id)
);

// индекс вопроса внутри предмета
const qIndex = ref(0);
watch(currentSubject, () => {
  qIndex.value = 0;
}); // сброс на первый при смене предмета

const total = computed(() => questions.value.length);
const current = computed(() => questions.value[qIndex.value]);

// ответы
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

// навигация по вопросам
const goTo = (i) => {
  if (i >= 0 && i < total.value) qIndex.value = i;
};
const prevQ = () => goTo(qIndex.value - 1);
const nextQ = () => goTo(qIndex.value + 1);

// навигация по предметам
const hasPrevSubject = computed(() => subjectIndex.value > 0);
const hasNextSubject = computed(() => subjectIndex.value < subjects.length - 1);
const prevSubject = () => {
  if (hasPrevSubject.value) subjectIndex.value--;
};
const nextSubject = () => {
  if (hasNextSubject.value) subjectIndex.value++;
};

// обработчик выбора предмета из сайдбара
function onPickSubject(subjectId) {
  const idx = subjects.findIndex((s) => s.id === subjectId);
  if (idx !== -1 && idx !== subjectIndex.value) {
    subjectIndex.value = idx;
    // qIndex сбросится через watch(currentSubject)
  }
}

// «узкий» режим сайдбара (как на скрине)
const collapsed = ref(false);
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
      <TestSidebar
        :collapsed="collapsed"
        :username="username"
        :subjects="subjects"
        :active-subject-id="currentSubject.id"
        @pick-subject="onPickSubject"
        @toggle="collapsed = !collapsed"
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

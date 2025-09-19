<script setup>
import { computed, reactive, watch } from "vue";

const props = defineProps({
  // JSON вопроса: { id, type, stem, choices, multiple, context?, media?, match? }
  question: { type: Object, required: true },
  // (choiceId) => boolean  — используется для single/multi
  checked: { type: Function, required: true },
  // текущее состояние match (необязательно): { "1":"B", "2":"D", ... }
  matchState: { type: Object, default: () => ({}) },
});

// События:
// - 'toggle' (choiceId) для single/multi
// - 'matchChange' ({index, letter}) для match
const emit = defineEmits(["toggle", "matchChange"]);

// Типы
const isMatch = computed(() => props.question.type === "match");
const isContext = computed(() => props.question.type === "context");
const isMulti = computed(
  () => props.question.type === "multi" || props.question.multiple === true
);
const inputType = computed(() => (isMulti.value ? "checkbox" : "radio"));

// Для match держим локальную реактивную мапу (синхронизируем с пропом matchState)
const localMatch = reactive({});

watch(
  () => props.matchState,
  (val) => {
    // Скопировать в локальное состояние
    Object.keys(localMatch).forEach((k) => delete localMatch[k]);
    if (val && typeof val === "object") {
      for (const [k, v] of Object.entries(val)) localMatch[k] = v;
    }
  },
  { immediate: true, deep: true }
);

function onSelectMatch(index, letter) {
  localMatch[index] = letter;
  emit("matchChange", { index, letter });
}

const rightOptions = computed(() => {
  // для match берем буквы из match.right, если они подписаны A., B., ...
  // иначе строим A..E по длине right
  const right = props.question.match?.right || [];
  // если right уже помечен "A. ...", просто вытащим буквы слева от точки
  const detected = right
    .map((t) => String(t).trim())
    .map((t, i) => {
      const m = t.match(/^([A-ZА-Я])[.)]\s*/i);
      return m ? m[1].toUpperCase() : String.fromCharCode(65 + i); // A,B,C...
    });
  return detected;
});
</script>

<template>
  <div class="question card">
    <!-- Контекст (для type=context) -->
    <div v-if="question.context" class="context">
      <div class="context-title">Контекст</div>
      <div class="context-body">{{ question.context }}</div>
    </div>

    <!-- Стем -->
    <p class="stem">{{ question.stem }}</p>

    <!-- Картинка, если есть -->
    <img
      v-if="question.media?.img"
      class="stem-img"
      :src="question.media.img"
      alt=""
    />

    <!-- MATCH -->
    <div v-if="isMatch" class="match">
      <div class="match-grid">
        <div class="match-head">Левая часть</div>
        <div class="match-head">Правая часть</div>

        <template
          v-for="(leftItem, idx) in question.match?.left || []"
          :key="'L' + (idx + 1)"
        >
          <div class="match-left">
            <b>{{ idx + 1 }}.</b>&nbsp;{{ leftItem }}
          </div>
          <div class="match-right">
            <select
              class="match-select"
              :value="localMatch[String(idx + 1)] || ''"
              @change="onSelectMatch(String(idx + 1), $event.target.value)"
            >
              <option value="" disabled>— выберите —</option>
              <option
                v-for="letter in rightOptions"
                :key="letter"
                :value="letter"
              >
                {{ letter }}
              </option>
            </select>
          </div>
        </template>
      </div>
    </div>

    <!-- SINGLE / MULTI -->
    <div v-else class="choices">
      <label
        v-for="c in question.choices"
        :key="c.id"
        class="choice clickable"
        :class="{ active: checked(c.id) }"
      >
        <input
          :type="inputType"
          :name="'q' + question.id"
          :checked="checked(c.id)"
          @change="$emit('toggle', c.id)"
        />
        <span class="opt">{{ c.id }})</span>
        <span class="txt">{{ c.text }}</span>
      </label>
    </div>

    <!-- Пояснение (если показываете разбор после проверки) -->
    <!-- <div v-if="question.explanation" class="explain">{{ question.explanation }}</div> -->
  </div>
</template>

<style scoped>
.card {
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  padding: 12px;
}

/* Контекст */
.context {
  border: 1px dashed var(--border);
  border-radius: 10px;
  padding: 10px 12px;
  margin-bottom: 10px;
  background: color-mix(in oklab, var(--card) 92%, transparent);
}
.context-title {
  font-weight: 600;
  margin-bottom: 6px;
  color: var(--muted);
}
.context-body {
  white-space: pre-wrap;
  line-height: 1.45;
}

.stem {
  margin: 0 0 12px;
  font-size: var(--fz-16);
  line-height: 1.45;
}
.stem-img {
  max-width: 100%;
  border-radius: 10px;
  margin: 10px 0 14px;
  border: 1px solid var(--border);
}

/* SINGLE/MULTI */
.choices {
  display: grid;
  gap: 10px;
}
.choice {
  display: grid;
  grid-template-columns: 18px minmax(28px, auto) 1fr;
  gap: 10px;
  align-items: center;
  padding: 12px 14px;
  border-radius: 12px;
  border: 1px solid var(--border);
  background: var(--card);
  transition: background-color var(--motion-fast),
    border-color var(--motion-fast), box-shadow var(--motion-fast),
    transform var(--motion-fast) var(--easing);
}
.choice:hover {
  background: color-mix(in oklab, var(--card) 85%, transparent);
}
.choice.active {
  border-color: var(--accent-color);
  box-shadow: inset 0 0 0 1px var(--accent-color);
  transform: translateY(-1px);
}
.choice input {
  margin: 0;
}
.opt {
  color: var(--muted);
}
.txt {
  line-height: 1.5;
}

/* MATCH */
.match-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px 12px;
  align-items: start;
}
.match-head {
  font-weight: 600;
  color: var(--muted);
  padding-bottom: 6px;
}
.match-left {
  line-height: 1.4;
}

.match-right {
  color: white;
}

.match-select {
  width: 100%;
  padding: 8px 10px;
  border: 1px solid var(--border);
  border-radius: 10px;
  background: var(--bg);
  color: white;
}
</style>

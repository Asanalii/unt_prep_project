<!-- src/components/test/TestQuestion.vue -->
<script setup>
import { computed, reactive, watch } from "vue";

const props = defineProps({
  question: { type: Object, required: true },
  checked: { type: Function, required: true },
  matchState: { type: Object, default: () => ({}) },
});

const emit = defineEmits(["toggle", "matchChange"]);

const normalizedType = computed(() =>
  String(props.question.type || "")
    .trim()
    .toLowerCase(),
);

const isMatch = computed(() => normalizedType.value === "match");
const isContext = computed(() => normalizedType.value === "context");
const isMulti = computed(
  () =>
    normalizedType.value === "multi" ||
    normalizedType.value === "multiple" ||
    props.question.multiple === true,
);

const inputType = computed(() => (isMulti.value ? "checkbox" : "radio"));

const questionId = computed(
  () => props.question.id || props.question.question_id,
);

const stemText = computed(
  () => props.question.stem || props.question.question_title || "",
);

const normalizedChoices = computed(() => {
  // Старый формат уже готов:
  if (Array.isArray(props.question.choices) && props.question.choices.length) {
    return props.question.choices;
  }

  // Backend format: options: ["...", "..."]
  if (Array.isArray(props.question.options)) {
    return props.question.options.map((text, index) => ({
      id: String(text),
      label: String.fromCharCode(65 + index), // A B C D
      text: String(text),
    }));
  }

  return [];
});

// Для match
const localMatch = reactive({});

watch(
  () => props.matchState,
  (val) => {
    Object.keys(localMatch).forEach((k) => delete localMatch[k]);

    if (val && typeof val === "object") {
      for (const [k, v] of Object.entries(val)) {
        localMatch[k] = v;
      }
    }
  },
  { immediate: true, deep: true },
);

function onSelectMatch(index, letter) {
  localMatch[index] = letter;
  emit("matchChange", { index, letter });
}

const rightOptions = computed(() => {
  const right = props.question.match?.right || [];

  const detected = right
    .map((t) => String(t).trim())
    .map((t, i) => {
      const m = t.match(/^([A-ZА-Я])[.)]\s*/i);
      return m ? m[1].toUpperCase() : String.fromCharCode(65 + i);
    });

  return detected;
});
</script>

<template>
  <div class="question card">
    <div v-if="question.context" class="context">
      <div class="context-title">Контекст</div>
      <div class="context-body">{{ question.context }}</div>
    </div>

    <p class="stem">{{ stemText }}</p>

    <img
      v-if="question.media?.img"
      class="stem-img"
      :src="question.media.img"
      alt=""
    />

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

    <div v-else class="choices">
      <label
        v-for="c in normalizedChoices"
        :key="c.id"
        class="choice clickable"
        :class="{ active: checked(c.id) }"
      >
        <input
          :type="inputType"
          :name="'q' + questionId"
          :checked="checked(c.id)"
          @change="$emit('toggle', c.id)"
        />
        <span class="opt">{{ c.label || c.id }})</span>
        <span class="txt">{{ c.text }}</span>
      </label>
    </div>
  </div>
</template>

<style scoped>
.card {
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  padding: 12px;
}

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
  transition:
    background-color var(--motion-fast),
    border-color var(--motion-fast),
    box-shadow var(--motion-fast),
    transform var(--motion-fast) var(--easing);
}
.choice:hover {
  background: color-mix(in oklab, var(--card) 85%, transparent);
}
.choice.active {
  border-color: var(--color-primary);
  box-shadow: inset 0 0 0 1px var(--color-primary);
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

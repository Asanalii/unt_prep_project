<!-- src/pages/tests/modals/QuestionExplanation.vue -->
<script setup>
import { computed } from "vue";

const props = defineProps({
  open: {
    type: Boolean,
    default: false,
  },
  question: {
    type: Object,
    default: null,
  },
  explanation: {
    type: String,
    default: "",
  },
  loading: {
    type: Boolean,
    default: false,
  },
  error: {
    type: String,
    default: "",
  },
  difficultyLabel: {
    type: String,
    default: "",
  },
});

const emit = defineEmits(["close"]);

function close() {
  emit("close");
}

function cleanText(text) {
  if (!text) return "";

  return text
    .replace(/\*\*/g, "")
    .replace(/\$/g, "")
    .replace(/\\le/g, "≤")
    .replace(/\\ge/g, "≥")
    .replace(/\\neq/g, "≠")
    .replace(/\\times/g, "×")
    .replace(/\\cdot/g, "·")
    .replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, "$1/$2")
    .replace(/\\\(/g, "")
    .replace(/\\\)/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function getSectionIcon(title) {
  const value = title.toLowerCase();

  if (value.includes("крат")) return "💡";
  if (value.includes("формула") || value.includes("правило")) return "📘";
  if (value.includes("почему")) return "✅";
  if (value.includes("ошибка")) return "⚠️";
  if (value.includes("итог")) return "🎯";

  return "•";
}

const parsedSections = computed(() => {
  const text = props.explanation || "";

  if (!text.trim()) return [];

  const normalized = text
    .replace(/\r/g, "")
    .replace(/\*\*(\d+\.\s*[^*]+)\*\*/g, "$1")
    .replace(/(\d+\.\s*[^\n]+)/g, "\n$1")
    .trim();

  const parts = normalized
    .split(/\n(?=\d+\.\s*)/g)
    .map((item) => item.trim())
    .filter(Boolean);

  if (!parts.length) {
    return [
      {
        title: "Объяснение",
        icon: "💡",
        body: cleanText(text),
      },
    ];
  }

  return parts.map((part) => {
    const lines = part
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);

    const firstLine = lines[0] || "Объяснение";
    const title = cleanText(firstLine.replace(/^\d+\.\s*/, ""));
    const body = cleanText(lines.slice(1).join("\n"));

    return {
      title,
      icon: getSectionIcon(title),
      body,
    };
  });
});
</script>

<template>
  <Teleport to="body">
    <Transition name="modal-fade">
      <div v-if="open" class="modal-backdrop" @click.self="close">
        <div class="explanation-modal">
          <div class="modal-head">
            <div>
              <h3>Объяснение задачи</h3>

              <p v-if="question" class="modal-subtitle">
                {{ question.topic }} · {{ difficultyLabel }}
              </p>
            </div>

            <button class="modal-close" type="button" @click="close">×</button>
          </div>

          <div v-if="question" class="question-box">
            <div class="question-label">Вопрос</div>
            <div class="question-title">
              {{ question.question_title }}
            </div>
          </div>

          <div v-if="loading" class="modal-state">
            <div class="loader" />
            <p>Генерируем объяснение...</p>
          </div>

          <div v-else-if="error" class="modal-state error">
            {{ error }}
          </div>

          <div v-else class="explanation-content">
            <div
              v-for="section in parsedSections"
              :key="section.title"
              class="explanation-section"
            >
              <div class="section-title">
                <span class="section-icon">{{ section.icon }}</span>
                <span>{{ section.title }}</span>
              </div>

              <p v-if="section.body" class="section-body">
                {{ section.body }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.modal-backdrop {
  position: fixed;
  inset: 0;
  z-index: 9999;
  background: rgba(2, 6, 23, 0.72);
  backdrop-filter: blur(6px);
  display: grid;
  place-items: center;
  padding: 18px;
}

.explanation-modal {
  width: min(860px, 100%);
  max-height: 88vh;
  overflow: auto;
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: 20px;
  box-shadow: var(--shadow);
  padding: 22px;
  display: grid;
  gap: 18px;
}

.modal-head {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  align-items: flex-start;
}

.modal-head h3 {
  margin: 0 0 5px;
  font-size: 26px;
  line-height: 1.2;
}

.modal-subtitle {
  margin: 0;
  color: var(--muted);
  font-size: var(--fz-16);
}

.modal-close {
  width: 44px;
  height: 44px;
  flex: 0 0 auto;
  border: 1px solid var(--border);
  border-radius: 14px;
  background: var(--bg-elev);
  color: var(--text);
  cursor: pointer;
  font-size: 30px;
  line-height: 1;
  transition: 0.15s ease;
}

.modal-close:hover {
  transform: translateY(-1px);
  border-color: var(--color-primary);
}

.question-box {
  padding: 14px 16px;
  border-radius: 14px;
  background: var(--bg-elev);
  border: 1px solid var(--border);
  display: grid;
  gap: 6px;
}

.question-label {
  color: var(--muted);
  font-size: var(--fz-14);
}

.question-title {
  line-height: 1.55;
  font-size: var(--fz-16);
}

.modal-state {
  min-height: 180px;
  display: grid;
  place-items: center;
  gap: 12px;
  color: var(--muted);
  text-align: center;
}

.modal-state.error {
  color: var(--danger);
  line-height: 1.5;
}

.loader {
  width: 34px;
  height: 34px;
  border: 3px solid var(--border);
  border-top-color: var(--color-primary);
  border-radius: 999px;
  animation: spin 0.8s linear infinite;
}

.explanation-content {
  display: grid;
  gap: 14px;
}

.explanation-section {
  padding: 15px 16px;
  border-radius: 16px;
  background: var(--bg-elev);
  border: 1px solid var(--border);
}

.section-title {
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 800;
  margin-bottom: 8px;
  font-size: var(--fz-16);
}

.section-icon {
  width: 30px;
  height: 30px;
  display: grid;
  place-items: center;
  border-radius: 10px;
  background: var(--bg);
  border: 1px solid var(--border);
}

.section-body {
  margin: 0;
  color: var(--text);
  line-height: 1.7;
  font-size: var(--fz-16);
}

.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.18s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 700px) {
  .explanation-modal {
    padding: 16px;
    border-radius: 16px;
  }

  .modal-head h3 {
    font-size: 22px;
  }

  .section-body {
    font-size: var(--fz-14);
  }
}
</style>

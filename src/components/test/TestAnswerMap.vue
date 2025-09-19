<script setup>
import { computed, onMounted, onBeforeUnmount } from "vue";
import BaseButton from "@/components/atoms/BaseButton.vue";

/**
 * props:
 * - sections: [
 *     { id, name, items: [{ num, answers: ['A','B'] }] , answered, total }
 *   ]
 */
const props = defineProps({
  sections: { type: Array, required: true },
  open: { type: Boolean, default: false },
});
const emit = defineEmits(["close"]);

// закрытие по Esc
function onKey(e) {
  if (e.key === "Escape") emit("close");
}
onMounted(() => window.addEventListener("keydown", onKey));
onBeforeUnmount(() => window.removeEventListener("keydown", onKey));

// плоский индикатор: есть ли вообще ответы
const hasAny = computed(() =>
  props.sections.some((s) => s.items.some((i) => i.answers?.length))
);
</script>

<template>
  <Teleport to="body">
    <transition name="fade">
      <div v-if="open" class="overlay" @click.self="emit('close')">
        <div class="modal card">
          <div class="hdr">
            <h3>{{ $t("test.answer_map") }}</h3>
            <BaseButton variant="ghost" size="sm" @click="emit('close')">
              {{ $t("common.close") || "Закрыть" }}
            </BaseButton>
          </div>

          <div v-if="!hasAny" class="empty">
            {{ $t("test.no_answers_yet") || "Ответов пока нет." }}
          </div>

          <div v-for="s in sections" :key="s.id" class="section">
            <div class="s-hdr">
              <div class="name">
                {{ $t("test.section") }}: <b>{{ s.name }}</b>
              </div>
              <div class="meta">
                {{
                  $t("test.answers_count", { n: s.answered, total: s.total })
                }}
              </div>
            </div>

            <!-- Простая сетка 10 колонок; растёт по строкам -->
            <div class="grid">
              <div
                v-for="it in s.items"
                :key="it.num"
                class="cell"
                :class="{ done: (it.answers?.length || 0) > 0 }"
              >
                <div class="qnum">{{ it.num }}</div>
                <div class="ans">
                  <template v-if="it.answers?.length">
                    {{ it.answers.join(", ") }}
                  </template>
                  <span v-else class="muted">—</span>
                </div>
              </div>
            </div>
          </div>

          <div class="ftr">
            <BaseButton variant="ghost" size="md" @click="emit('close')">
              {{ $t("common.close") || "Закрыть" }}
            </BaseButton>
          </div>
        </div>
      </div>
    </transition>
  </Teleport>
</template>

<style scoped>
.overlay {
  position: fixed;
  inset: 0;
  background: color-mix(in oklab, var(--bg) 60%, black);
  display: grid;
  place-items: center;
  z-index: 1000;
}
.modal {
  width: min(1000px, 92vw);
  max-height: 86vh;
  overflow: auto;
  padding: 16px;
}
.card {
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: var(--radius-md, 12px);
}
.hdr,
.ftr {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid var(--border);
}
.ftr {
  border-top: 1px solid var(--border);
  border-bottom: 0;
  padding-top: 12px;
  margin-top: 12px;
}
.section {
  margin: 14px 0;
}
.s-hdr {
  display: flex;
  justify-content: space-between;
  margin: 6px 0 8px;
}
.meta {
  color: var(--muted);
}

.grid {
  display: grid;
  grid-template-columns: repeat(10, 1fr); /* 10 столбцов как на ент */
  gap: 6px;
}

.cell {
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 8px 10px;
  background: var(--card);
  display: grid;
  gap: 4px;
}
.cell.done {
  outline: 2px solid color-mix(in oklab, var(--accent-color) 35%, transparent);
}
.qnum {
  font-weight: 600;
  color: var(--muted);
}
.ans {
  font-variant-numeric: tabular-nums;
}
.muted {
  color: var(--muted);
}

/* fade из вашего animations.css, но на всякий: */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.15s;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>

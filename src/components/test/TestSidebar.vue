<script setup>
import { useI18n } from "vue-i18n";

const props = defineProps({
  collapsed: { type: Boolean, default: false }, // <-- новый режим «рейл»
  username: { type: String, required: true },
  subjects: { type: Array, required: true }, // [{id, name}]
  activeSubjectId: { type: String, required: true },
});

const emit = defineEmits([
  "pick-subject",
  "toggle",
  "open-answer-map",
  "open-calculator",
  "open-mendeleev",
  "open-solubility",
]);

const { t } = useI18n();
</script>

<template>
  <aside class="left" :class="{ rail: collapsed }">
    <!-- user -->
    <div class="left-group">
      <button class="left-item" @click="emit('toggle')" :title="username">
        <span class="ico">👤</span>
        <span class="lbl" v-if="!collapsed">{{ username }}</span>
      </button>
    </div>

    <!-- subjects -->
    <div class="left-group">
      <div class="left-title" v-if="!collapsed">{{ t("test.sections") }}</div>
      <button
        v-for="s in subjects"
        :key="s.id"
        class="left-item"
        :class="{ active: s.id === activeSubjectId }"
        :aria-current="s.id === activeSubjectId ? 'true' : null"
        :title="s.name"
        @click="emit('pick-subject', s.id)"
      >
        <span class="ico">📘</span>
        <span class="lbl" v-if="!collapsed">{{ s.name }}</span>
      </button>
    </div>

    <!-- tools (пока заглушки) -->
    <div class="left-group">
      <div class="left-title" v-if="!collapsed">{{ t("test.tools") }}</div>

      <button
        class="left-item"
        :title="t('test.answer_map')"
        @click="() => emit('open-answer-map')"
      >
        <span class="ico">🗺</span>
        <span class="lbl" v-if="!collapsed">{{ t("test.answer_map") }}</span>
      </button>

      <button
        class="left-item"
        :title="t('test.calculator')"
        @click="() => emit('open-calculator')"
      >
        <span class="ico">🧮</span>
        <span class="lbl" v-if="!collapsed">{{ $t("test.calculator") }}</span>
      </button>

      <button class="left-item" @click="() => emit('open-mendeleev')">
        <span class="ico">📊</span
        ><span class="lbl" v-if="!collapsed">{{ t("test.mendeleev") }}</span>
      </button>

      <button
        class="left-item"
        :title="t('test.solubility')"
        @click="() => emit('open-solubility')"
      >
        <span class="ico">🧪</span>
        <span class="lbl" v-if="!collapsed">{{ t("test.solubility") }}</span>
      </button>
    </div>

    <div class="left-bottom">
      <button class="ghost icon clickable" @click="emit('toggle')">
        {{ collapsed ? "▶" : "◀" }}
      </button>
    </div>
  </aside>
</template>

<style scoped>
.left {
  position: relative;
  border-right: 1px solid var(--border);
  background: var(--bg);
  overflow: auto;
  padding: 10px;
  transition: padding var(--motion-fast) var(--easing),
    background-color var(--motion-fast);
}

.left.rail {
  padding: 10px 6px;
}

.left-group {
  margin-bottom: 14px;
}
.left-title {
  color: var(--muted);
  font-size: var(--fz-12);
  margin: 6px 8px;
}

.left-item {
  width: 100%;
  display: flex;
  gap: 8px;
  align-items: center;
  padding: 10px 12px;
  border-radius: var(--radius-sm);
  color: var(--text);
  border: 1px solid transparent;
  background: transparent;
  cursor: pointer;
  user-select: none;
  transition: background-color var(--motion-fast),
    border-color var(--motion-fast);
}

.left.rail .lbl {
  opacity: 0;
  transform: translateX(-6px);
  pointer-events: none;
}

/* кнопка-стрелка внизу — лёгкое вращение при смене режима */
.left-bottom .icon {
  transition: transform var(--motion-fast) var(--easing),
    background-color var(--motion-fast);
}
.left.rail .left-bottom .icon {
  transform: rotate(180deg);
}

.left.rail .left-item {
  justify-content: center;
  padding: 10px 8px;
}
.left-item:hover {
  border-color: var(--border);
  background: var(--card);
}
.left-item.active {
  border-color: var(--accent-color);
  background: color-mix(in oklab, var(--accent-color) 14%, var(--card));
}
.left-item.disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.ico {
  width: 18px;
  text-align: center;
}
.lbl {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;

  transition: opacity var(--motion-fast) var(--easing),
    transform var(--motion-fast) var(--easing);
}

.left-bottom {
  position: sticky;
  bottom: 10px;
  display: flex;
  justify-content: flex-end;
  padding: 10px 0;
}
.icon {
  width: 34px;
  height: 34px;
  display: inline-grid;
  place-items: center;
  border-radius: 10px;
}
.ghost {
  padding: 8px 12px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--border);
  background: var(--bg);
  color: var(--text);
}
</style>

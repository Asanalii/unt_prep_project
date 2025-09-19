<script setup>
const props = defineProps({
  collapsed: { type: Boolean, default: false }, // <-- новый режим «рейл»
  username: { type: String, required: true },
  subjects: { type: Array, required: true }, // [{id, name}]
  activeSubjectId: { type: String, required: true },
});
const emit = defineEmits(["pick-subject", "toggle"]);
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
      <div class="left-title" v-if="!collapsed">{{ $t("test.sections") }}</div>
      <button
        v-for="s in subjects"
        :key="s.id"
        class="left-item"
        :class="{ active: s.id === activeSubjectId }"
        :title="s.name"
        @click="emit('pick-subject', s.id)"
      >
        <span class="ico">📘</span>
        <span class="lbl" v-if="!collapsed">{{ s.name }}</span>
      </button>
    </div>

    <!-- tools (пока заглушки) -->
    <div class="left-group">
      <div class="left-title" v-if="!collapsed">{{ $t("test.tools") }}</div>
      <button class="left-item disabled" :title="$t('test.answer_map')">
        <span class="ico">🗺</span
        ><span class="lbl" v-if="!collapsed">{{ $t("test.answer_map") }}</span>
      </button>
      <button class="left-item disabled" :title="$t('test.calculator')">
        <span class="ico">🧮</span
        ><span class="lbl" v-if="!collapsed">{{ $t("test.calculator") }}</span>
      </button>
      <button class="left-item disabled" :title="$t('test.mendeleev')">
        <span class="ico">📊</span
        ><span class="lbl" v-if="!collapsed">{{ $t("test.mendeleev") }}</span>
      </button>
      <button class="left-item disabled" :title="$t('test.solubility')">
        <span class="ico">🧪</span
        ><span class="lbl" v-if="!collapsed">{{ $t("test.solubility") }}</span>
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
  transition: width 0.15s;
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

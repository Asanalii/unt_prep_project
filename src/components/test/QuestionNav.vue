<script setup>
// ===== Props / Emits
const props = defineProps({
  total: { type: Number, required: true },
  activeIndex: { type: Number, required: true },
  answeredMap: { type: Object, default: () => new Map() }, // Map<qId, Set<choiceId>>
  ids: { type: Array, default: () => [] }, // question ids в порядке
});
const emit = defineEmits(["go-to"]);
</script>

<template>
  <div class="qnav card">
    <button
      v-for="(id, i) in ids"
      :key="id"
      class="qbtn"
      :class="{
        active: i === activeIndex,
        answered: !!answeredMap.get(id)?.size,
      }"
      @click="emit('go-to', i)"
    >
      {{ i + 1 }}
    </button>
  </div>
</template>

<style scoped>
.card {
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  padding: 8px;
}
.qnav {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}
.qbtn {
  min-width: 34px;
  height: 34px;
  border-radius: 8px;
  border: 1px solid var(--border);
  background: var(--card);
  color: var(--text);
  cursor: pointer;
  transition: 0.15s;
}
.qbtn.active {
  border-color: var(--accent-color);
  box-shadow: inset 0 0 0 1px var(--accent-color);
}
.qbtn.answered {
  outline: 2px solid color-mix(in oklab, var(--accent-color) 35%, transparent);
}
</style>

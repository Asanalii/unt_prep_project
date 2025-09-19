<script setup>
const props = defineProps({
  items: { type: Array, required: true }, // вопросы текущего предмета
  index: { type: Number, required: true },
  answers: { type: Object, required: true }, // Map
});
const emit = defineEmits(["go"]);
</script>

<template>
  <div class="qnav card">
    <button
      v-for="(q, i) in items"
      :key="q.id"
      class="qbtn"
      :class="{ active: i === index, answered: !!answers.get(q.id)?.size }"
      @click="emit('go', i)"
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

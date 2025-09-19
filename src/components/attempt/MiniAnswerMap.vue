<script setup>
const props = defineProps({
  answers: { type: Array, required: true }, // [{qid, isCorrect, subject}]
});
const emit = defineEmits(["open"]);
</script>

<template>
  <div class="map">
    <button
      v-for="(a, i) in answers"
      :key="a.qid"
      class="cell"
      :class="{ ok: a.isCorrect, bad: !a.isCorrect }"
      @click="$emit('open', a.qid)"
      :title="a.qid"
    >
      {{ i + 1 }}
    </button>
  </div>
</template>

<style scoped>
.map {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(34px, 1fr));
  gap: 6px;
}
.cell {
  height: 34px;
  border-radius: 8px;
  border: 1px solid var(--border);
  background: var(--card);
  color: var(--text);
}
.cell.ok {
  background: color-mix(in oklab, limegreen 15%, var(--card));
}
.cell.bad {
  background: color-mix(in oklab, crimson 15%, var(--card));
}
</style>

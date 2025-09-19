<script setup>
// ===== Props / Emits
const props = defineProps({
  question: { type: Object, required: true }, // {id, stem, media?, choices[], multiple}
  isChecked: { type: Function, required: true }, // (qId, choiceId)=>boolean
});
const emit = defineEmits(["toggle-answer"]); // (qId, choiceId, multiple)
</script>

<template>
  <div class="question card">
    <p class="stem">{{ question?.stem }}</p>
    <img
      v-if="question?.media?.img"
      class="stem-img"
      :src="question.media.img"
      alt=""
    />

    <div class="choices">
      <label
        v-for="c in question?.choices || []"
        :key="c.id"
        class="choice clickable"
        :class="{ active: isChecked(question.id, c.id) }"
      >
        <input
          :type="question?.multiple ? 'checkbox' : 'radio'"
          :name="'q' + question?.id"
          :checked="isChecked(question.id, c.id)"
          @change="emit('toggle-answer', question.id, c.id, question?.multiple)"
        />
        <span class="opt">{{ c.id }})</span>
        <span>{{ c.text }}</span>
      </label>
    </div>
  </div>
</template>

<style scoped>
.card {
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  padding: 10px;
}
.stem {
  margin: 0 0 10px;
  font-size: var(--fz-16);
}
.stem-img {
  max-width: 100%;
  border-radius: 8px;
  margin: 8px 0 12px;
  border: 1px solid var(--border);
}
.choices {
  display: grid;
  gap: 8px;
}
.choice {
  display: grid;
  grid-template-columns: 18px auto;
  gap: 10px;
  align-items: center;
  padding: 10px 12px;
  border-radius: 10px;
  border: 1px solid var(--border);
  background: var(--card);
}
.choice.active {
  border-color: var(--accent-color);
  box-shadow: inset 0 0 0 1px var(--accent-color);
}
.choice input {
  margin: 0;
}
.opt {
  color: var(--muted);
}
.clickable {
  cursor: pointer;
  transition: 0.15s;
}
</style>

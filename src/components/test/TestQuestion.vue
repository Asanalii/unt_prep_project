<script setup>
const props = defineProps({
  question: { type: Object, required: true }, // { id, stem, choices[], media?, multiple }
  checked: { type: Function, required: true }, // (choiceId) => boolean
});
const emit = defineEmits(["toggle"]); // (choiceId)
</script>

<template>
  <div class="question card">
    <p class="stem">{{ question.stem }}</p>
    <img
      v-if="question.media?.img"
      class="stem-img"
      :src="question.media.img"
      alt=""
    />

    <div class="choices">
      <label
        v-for="c in question.choices"
        :key="c.id"
        class="choice clickable"
        :class="{ active: checked(c.id) }"
      >
        <input
          :type="question.multiple ? 'checkbox' : 'radio'"
          :name="'q' + question.id"
          :checked="checked(c.id)"
          @change="emit('toggle', c.id)"
        />
        <span class="opt">{{ c.id }})</span>
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
.txt {
  line-height: 1.5;
}
.clickable {
  cursor: pointer;
  transition: 0.15s;
}
</style>

<script setup>
const props = defineProps({
  variant: { type: String, default: "primary" }, // primary | ghost | outline
  size: { type: String, default: "md" }, // sm | md | lg
});
</script>

<template>
  <button :class="['btn', variant, size]"><slot /></button>
</template>

<style scoped>
.btn {
  border: 1px solid transparent;
  background: var(--color-primary);
  color: white;
  padding: 10px 14px;
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: 0.15s ease;
  box-shadow: var(--shadow);
}
.btn:hover {
  background: var(--color-primary-600);
}
.btn.ghost {
  background: transparent;
  border-color: var(--border);
  color: var(--text);
  box-shadow: none;
}
.btn.ghost:hover {
  background: var(--card);
}
.btn.outline {
  background: transparent;
  border-color: var(--color-primary-600);
  color: var(--color-primary-600);
}
.sm {
  padding: 6px 10px;
  font-size: var(--fz-14);
  box-shadow: none;
}
.lg {
  padding: 14px 18px;
  font-size: var(--fz-16);
}
</style>

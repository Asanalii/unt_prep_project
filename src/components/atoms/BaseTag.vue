<script setup>
const props = defineProps({ tone: { default: "default" } }); // default|success|warning|danger
</script>

<template>
  <span :class="['tag', tone]"><slot /></span>
</template>

<style scoped>
.tag {
  font-size: var(--fz-12);
  padding: 4px 8px;
  border-radius: 999px;
  border: 1px solid var(--border);
  background: var(--card);
}
.success {
  color: #0cd68a;
  border-color: #0cd68a33;
  background: #0cd68a1a;
}
.warning {
  color: #f5a623;
  border-color: #f5a62333;
  background: #f5a6231a;
}
.danger {
  color: #ff6b6b;
  border-color: #ff6b6b33;
  background: #ff6b6b1a;
}
</style>

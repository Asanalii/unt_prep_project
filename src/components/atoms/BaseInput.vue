<script setup>
const model = defineModel(); // v-model
const props = defineProps({ placeholder: String, type: { default: "text" } });
</script>

<template>
  <input :type="type" v-model="model" :placeholder="placeholder" class="inp" />
</template>

<style scoped>
.inp {
  width: 100%;
  background: var(--bg);
  color: var(--text);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  padding: 10px 12px;
  outline: none;
}
.inp:focus {
  border-color: var(--color-primary-600);
}
</style>

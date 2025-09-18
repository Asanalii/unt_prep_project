<script setup>
import BaseTag from "../atoms/BaseTag.vue";
</script>

<template>
  <nav class="wrap">
    <div class="brand">UNT Prep</div>
    <ul class="menu">
      <li><router-link to="/">Dashboard</router-link></li>
      <li><router-link to="/tests"> UNT Tests</router-link></li>
      <li><router-link to="/subjects"> Subjects</router-link></li>
      <li><router-link to="/forum"> Forum</router-link></li>
      <li class="mt"><BaseTag tone="success">Beta</BaseTag></li>
    </ul>
  </nav>
</template>

<style scoped>
.wrap {
  padding: var(--s-6);
}
.brand {
  font-size: var(--fz-20);
  font-weight: 700;
  margin-bottom: var(--s-6);
}
.menu {
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  gap: var(--s-3);
}
.menu a {
  display: block;
  padding: 10px 12px;
  border-radius: var(--radius-sm);
  color: var(--text);
  border: 1px solid transparent;
}
.menu a.router-link-active {
  background: var(--card);
  border-color: var(--border);
}
.mt {
  margin-top: var(--s-8);
}
</style>

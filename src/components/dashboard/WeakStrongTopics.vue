<script setup>
defineProps({
  weak: { type: Array, default: () => [] }, // [{id,name,correct}]
  strong: { type: Array, default: () => [] },
});
</script>

<template>
  <article class="card">
    <div class="row">
      <div class="col">
        <div class="ttl">{{ $t("dashboard.topics.weak") }}</div>
        <ul class="lst">
          <li v-for="t in weak" :key="'w' + t.id">
            <span class="name">{{ t.name }}</span>
            <span class="val">{{ t.correct }}%</span>
          </li>
        </ul>
      </div>
      <div class="col">
        <div class="ttl">{{ $t("dashboard.topics.strong") }}</div>
        <ul class="lst">
          <li v-for="t in strong" :key="'s' + t.id">
            <span class="name">{{ t.name }}</span>
            <span class="val">{{ t.correct }}%</span>
          </li>
        </ul>
      </div>
    </div>
  </article>
</template>

<style scoped>
.card {
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 12px;
  background: var(--bg);
  height: 100%;
}
.row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}
.ttl {
  font-weight: 600;
  margin-bottom: 6px;
}
.lst {
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  gap: 6px;
}
li {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.val {
  font-weight: 700;
}
@media (max-width: 720px) {
  .row {
    grid-template-columns: 1fr;
  }
}
</style>

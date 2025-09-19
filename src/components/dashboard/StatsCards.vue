<script setup>
defineProps({
  summary: { type: Object, required: true },
});
</script>

<template>
  <section class="cards">
    <article class="card">
      <div class="k">{{ summary.totalAttempts }}</div>
      <div class="l">{{ $t("dashboard.cards.totalAttempts") }}</div>
    </article>
    <article class="card">
      <div class="k">{{ summary.avgScore }}%</div>
      <div class="l">{{ $t("dashboard.cards.avgScore") }}</div>
    </article>
    <article class="card">
      <div class="k">{{ summary.completed }}</div>
      <div class="l">{{ $t("dashboard.cards.completed") }}</div>
    </article>
    <article class="card">
      <div class="k">{{ summary.inProgress }}</div>
      <div class="l">{{ $t("dashboard.cards.inProgress") }}</div>
    </article>
  </section>
</template>

<style scoped>
.cards {
  display: grid;
  grid-template-columns: repeat(4, minmax(160px, 1fr));
  gap: 12px;
}
.card {
  border: 1px solid var(--border);
  background: var(--bg);
  border-radius: 12px;
  padding: 14px;
}
.k {
  font-size: 22px;
  font-weight: 700;
}
.l {
  color: var(--muted);
  margin-top: 6px;
}
@media (max-width: 920px) {
  .cards {
    grid-template-columns: repeat(2, 1fr);
  }
}
@media (max-width: 520px) {
  .cards {
    grid-template-columns: 1fr;
  }
}
</style>

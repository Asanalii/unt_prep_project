<!-- src/components/landing/LandingStats.vue -->
<script setup>
const stats = [
  {
    value: "40",
    label: "вопросов в тесте по математике",
  },
  {
    value: "70",
    label: "минут на выполнение",
  },
  {
    value: "3",
    label: "уровня сложности",
  },
  {
    value: "5+",
    label: "тем для диагностики",
  },
];
</script>

<template>
  <section id="stats" class="stats-section">
    <div class="stats-section__inner">
      <div class="stats-text">
        <span class="eyebrow">Статистика</span>
        <h2>Всё, что нужно показать в Results chapter</h2>
        <p>
          Эти блоки хорошо подходят и для самой платформы, и для скриншотов в
          диссертации: результат теста, темы, сложность и прогресс.
        </p>
      </div>

      <div class="stats-grid">
        <article v-for="item in stats" :key="item.label" class="stat-card">
          <strong>{{ item.value }}</strong>
          <span>{{ item.label }}</span>
        </article>
      </div>
    </div>
  </section>
</template>

<style scoped>
.stats-section {
  padding: 42px var(--s-6) 78px;
}

.stats-section__inner {
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 0.9fr 1.1fr;
  gap: 28px;
  align-items: stretch;
}

.stats-text {
  padding: 32px;
  border: 1px solid var(--border);
  border-radius: 30px;
  background:
    radial-gradient(
      circle at top left,
      rgba(25, 195, 125, 0.14),
      transparent 34%
    ),
    rgba(19, 23, 42, 0.74);
}

.eyebrow {
  color: var(--success);
  font-size: var(--fz-14);
  font-weight: 700;
}

h2 {
  margin: 10px 0 0;
  font-size: clamp(30px, 4vw, 44px);
  line-height: 1.08;
  letter-spacing: -0.05em;
}

p {
  margin: 16px 0 0;
  color: var(--muted);
  line-height: 1.7;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}

.stat-card {
  min-height: 180px;
  padding: 26px;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  border: 1px solid var(--border);
  border-radius: 30px;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.05), transparent),
    rgba(19, 23, 42, 0.72);
}

.stat-card strong {
  font-size: 56px;
  line-height: 1;
  letter-spacing: -0.07em;
}

.stat-card span {
  margin-top: 12px;
  color: var(--muted);
}

@media (max-width: 860px) {
  .stats-section__inner {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 560px) {
  .stats-section {
    padding: 32px var(--s-4) 58px;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }
}
</style>

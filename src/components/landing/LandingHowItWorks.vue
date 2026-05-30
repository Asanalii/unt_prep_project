<!-- src/components/landing/LandingHowItWorks.vue -->
<script setup>
const steps = [
  {
    number: "01",
    title: "Выбираешь предмет",
    text: "Ученик выбирает математику или другой предмет, когда они будут добавлены.",
  },
  {
    number: "02",
    title: "Проходишь тест",
    text: "Система фиксирует ответы, темы, сложность и будущие признаки для ML-модуля.",
  },
  {
    number: "03",
    title: "Получаешь аналитику",
    text: "После теста видно, какие темы сильные, какие слабые и где теряются баллы.",
  },
  {
    number: "04",
    title: "Получаешь рекомендации",
    text: "ML-модуль будет классифицировать темы как weak / normal / strong и предлагать повторение.",
  },
];
</script>

<template>
  <section id="how-it-works" class="how-section">
    <div class="section__head">
      <span class="eyebrow">Как работает</span>
      <h2>Путь ученика простой</h2>
    </div>

    <div class="timeline">
      <article v-for="step in steps" :key="step.number" class="step-card">
        <span class="step-card__number">{{ step.number }}</span>
        <h3>{{ step.title }}</h3>
        <p>{{ step.text }}</p>
      </article>
    </div>
  </section>
</template>

<style scoped>
.how-section {
  max-width: 1200px;
  margin: 0 auto;
  padding: 76px var(--s-6);
}

.section__head {
  max-width: 720px;
  margin-bottom: 34px;
}

.eyebrow {
  color: var(--success);
  font-size: var(--fz-14);
  font-weight: 700;
}

h2 {
  margin: 10px 0 0;
  font-size: clamp(32px, 4vw, 48px);
  line-height: 1.05;
  letter-spacing: -0.05em;
}

.timeline {
  position: relative;
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 16px;
}

.step-card {
  position: relative;
  min-height: 240px;
  padding: 24px;
  border: 1px solid var(--border);
  border-radius: 26px;
  background: rgba(19, 23, 42, 0.72);
  overflow: hidden;
}

.step-card::before {
  content: "";
  position: absolute;
  top: -40px;
  right: -40px;
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: rgba(107, 123, 255, 0.12);
}

.step-card__number {
  display: inline-flex;
  margin-bottom: 54px;
  color: var(--color-primary);
  font-size: 13px;
  font-weight: 800;
}

h3 {
  position: relative;
  margin: 0;
  font-size: 20px;
}

p {
  position: relative;
  margin: 12px 0 0;
  color: var(--muted);
  font-size: var(--fz-14);
  line-height: 1.65;
}

@media (max-width: 980px) {
  .timeline {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 560px) {
  .how-section {
    padding: 56px var(--s-4);
  }

  .timeline {
    grid-template-columns: 1fr;
  }
}
</style>

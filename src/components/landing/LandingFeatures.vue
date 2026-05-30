<!-- src/components/landing/LandingFeatures.vue -->
<script setup>
const features = [
  {
    icon: "📊",
    title: "Статистика по темам",
    text: "После теста система показывает, где именно были ошибки: алгебра, тригонометрия, неравенства и другие темы.",
  },
  {
    icon: "🎯",
    title: "Анализ сложности",
    text: "Результаты делятся по уровням: лёгкий, средний и сложный. Так видно, где ученик реально теряет баллы.",
  },
  {
    icon: "🧠",
    title: "ML-рекомендации",
    text: "Платформа собирает данные попыток и готовит основу для персональных рекомендаций по слабым темам.",
  },
  {
    icon: "🌍",
    title: "Мультиязычный интерфейс",
    text: "Интерфейс можно расширять на русский, казахский и английский языки через i18n.",
  },
];
</script>

<template>
  <section id="features" class="section">
    <div class="section__head">
      <span class="eyebrow">Возможности</span>
      <h2>Не просто тесты, а понятная подготовка</h2>
      <p>
        Лендос должен сразу показывать, что платформа современная: есть
        аналитика, прогресс, темы, сложность и будущая ML-адаптация.
      </p>
    </div>

    <div class="features-grid">
      <article
        v-for="feature in features"
        :key="feature.title"
        class="feature-card anim-hover-pop"
      >
        <div class="feature-card__icon">{{ feature.icon }}</div>
        <h3>{{ feature.title }}</h3>
        <p>{{ feature.text }}</p>
      </article>
    </div>
  </section>
</template>

<style scoped>
.section {
  max-width: 1200px;
  margin: 0 auto;
  padding: 72px var(--s-6);
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

.section__head p {
  margin: 16px 0 0;
  color: var(--muted);
  line-height: 1.7;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 16px;
}

.feature-card {
  min-height: 250px;
  padding: 22px;
  border: 1px solid var(--border);
  border-radius: 24px;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.04), transparent),
    rgba(19, 23, 42, 0.74);
  box-shadow: var(--shadow);
}

.feature-card__icon {
  width: 48px;
  height: 48px;
  display: grid;
  place-items: center;
  margin-bottom: 20px;
  border-radius: 16px;
  background: rgba(107, 123, 255, 0.12);
  font-size: 24px;
}

h3 {
  margin: 0;
  font-size: 19px;
}

.feature-card p {
  margin: 12px 0 0;
  color: var(--muted);
  font-size: var(--fz-14);
  line-height: 1.65;
}

@media (max-width: 980px) {
  .features-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 560px) {
  .section {
    padding: 52px var(--s-4);
  }

  .features-grid {
    grid-template-columns: 1fr;
  }
}
</style>

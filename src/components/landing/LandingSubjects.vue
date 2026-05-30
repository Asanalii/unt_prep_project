<!-- src/components/landing/LandingSubjectss.vue -->
<script setup>
const subjects = [
  {
    name: "Математика",
    icon: "∑",
    questions: "40 вопросов",
    status: "Доступно",
    active: true,
  },
  {
    name: "Математическая грамотность",
    icon: "%",
    questions: "10 вопросов",
    status: "Скоро",
    active: false,
  },
  {
    name: "История Казахстана",
    icon: "🏛",
    questions: "20 вопросов",
    status: "Скоро",
    active: false,
  },
  {
    name: "Грамотность чтения",
    icon: "📖",
    questions: "10 вопросов",
    status: "Скоро",
    active: false,
  },
  {
    name: "Информатика",
    icon: "</>",
    questions: "40 вопросов",
    status: "Скоро",
    active: false,
  },
];
</script>

<template>
  <section id="subjects" class="subjects-section">
    <div class="subjects-section__inner">
      <div class="section__head">
        <span class="eyebrow">Предметы</span>
        <h2>Начинаем с математики, дальше масштабируем</h2>
        <p>
          Для диссертации пилотным предметом выступает математика. Остальные
          предметы можно оставить как roadmap развития платформы.
        </p>
      </div>

      <div class="subjects-grid">
        <article
          v-for="subject in subjects"
          :key="subject.name"
          :class="['subject-card', { 'subject-card--active': subject.active }]"
        >
          <div class="subject-card__icon">
            {{ subject.icon }}
          </div>

          <div>
            <h3>{{ subject.name }}</h3>
            <p>{{ subject.questions }}</p>
          </div>

          <span class="subject-card__status">
            {{ subject.status }}
          </span>
        </article>
      </div>
    </div>
  </section>
</template>

<style scoped>
.subjects-section {
  padding: 42px var(--s-6);
}

.subjects-section__inner {
  max-width: 1200px;
  margin: 0 auto;
  padding: 42px;
  border: 1px solid var(--border);
  border-radius: 32px;
  background:
    radial-gradient(
      circle at top right,
      rgba(107, 123, 255, 0.16),
      transparent 32%
    ),
    rgba(19, 23, 42, 0.62);
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
  font-size: clamp(32px, 4vw, 46px);
  line-height: 1.05;
  letter-spacing: -0.05em;
}

.section__head p {
  margin: 16px 0 0;
  color: var(--muted);
  line-height: 1.7;
}

.subjects-grid {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 14px;
}

.subject-card {
  position: relative;
  min-height: 210px;
  padding: 18px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  border: 1px solid var(--border);
  border-radius: 24px;
  background: rgba(15, 18, 32, 0.82);
  overflow: hidden;
}

.subject-card::after {
  content: "";
  position: absolute;
  inset: auto -40px -55px auto;
  width: 130px;
  height: 130px;
  border-radius: 50%;
  background: rgba(107, 123, 255, 0.12);
}

.subject-card--active {
  border-color: rgba(107, 123, 255, 0.62);
  background:
    linear-gradient(180deg, rgba(107, 123, 255, 0.18), rgba(15, 18, 32, 0.82)),
    rgba(15, 18, 32, 0.82);
}

.subject-card__icon {
  width: 52px;
  height: 52px;
  display: grid;
  place-items: center;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.07);
  font-size: 24px;
  font-weight: 800;
}

h3 {
  margin: 0;
  font-size: 17px;
}

p {
  margin: 8px 0 0;
  color: var(--muted);
  font-size: var(--fz-14);
}

.subject-card__status {
  width: fit-content;
  padding: 6px 10px;
  border-radius: 999px;
  color: var(--muted);
  background: rgba(255, 255, 255, 0.06);
  font-size: var(--fz-12);
}

.subject-card--active .subject-card__status {
  color: #fff;
  background: rgba(25, 195, 125, 0.18);
}

@media (max-width: 1080px) {
  .subjects-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media (max-width: 680px) {
  .subjects-section {
    padding: 32px var(--s-4);
  }

  .subjects-section__inner {
    padding: 24px;
  }

  .subjects-grid {
    grid-template-columns: 1fr;
  }
}
</style>

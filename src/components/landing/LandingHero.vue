<!-- src/components/landing/LandingHero.vue -->
<script setup>
import BaseButton from "@/components/atoms/BaseButton.vue";
import BaseTag from "@/components/atoms/BaseTag.vue";
import Hero3DScene from "@/components/landing/Hero3DScene.vue";
</script>

<template>
  <section class="hero">
    <div class="hero__inner">
      <div class="hero__content">
        <div class="hero__tags">
          <BaseTag tone="success">AI адаптация</BaseTag>
          <BaseTag>ЕНТ 2026</BaseTag>
          <BaseTag tone="warning">Математика</BaseTag>
        </div>

        <h1>
          Готовься к ЕНТ
          <span>умнее, быстрее и без хаоса</span>
        </h1>

        <p class="hero__subtitle">
          UNT Prep анализирует твои ответы, показывает слабые темы, считает
          прогресс по сложности и помогает готовиться персонально, а не просто
          решать случайные тесты.
        </p>

        <div class="hero__actions">
          <BaseButton variant="primary" size="lg" href="/tests">
            Пройти тест
          </BaseButton>

          <BaseButton variant="secondary" size="lg" href="/subjects">
            Смотреть предметы
          </BaseButton>
        </div>

        <div class="hero__mini-stats">
          <div>
            <strong>40</strong>
            <span>вопросов</span>
          </div>
          <div>
            <strong>70 мин</strong>
            <span>формат ЕНТ</span>
          </div>
          <div>
            <strong>3 уровня</strong>
            <span>easy / medium / hard</span>
          </div>
        </div>
      </div>

      <Hero3DScene />
    </div>
  </section>
</template>

<style scoped>
.hero {
  position: relative;
  padding: 78px var(--s-6) 72px;
}

.hero__inner {
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: minmax(0, 1fr) 520px;
  gap: 52px;
  align-items: center;
}

.hero__content {
  min-width: 0;
}

.hero__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: var(--s-5);
}

h1 {
  margin: 0;
  max-width: 720px;
  font-size: clamp(42px, 6vw, 76px);
  line-height: 0.98;
  letter-spacing: -0.07em;
}

h1 span {
  display: block;
  background: linear-gradient(90deg, #ffffff, #9da8ff 44%, #19c37d);
  -webkit-background-clip: text;
  color: transparent;
}

.hero__subtitle {
  max-width: 640px;
  margin: 24px 0 0;
  color: var(--muted);
  font-size: 18px;
  line-height: 1.75;
}

.hero__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 14px;
  margin-top: 32px;
}

.hero__mini-stats {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
  margin-top: 34px;
  max-width: 620px;
}

.hero__mini-stats div {
  padding: 16px;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  background: rgba(19, 23, 42, 0.72);
  backdrop-filter: blur(14px);
}

.hero__mini-stats strong {
  display: block;
  font-size: 22px;
}

.hero__mini-stats span {
  display: block;
  margin-top: 5px;
  color: var(--muted);
  font-size: var(--fz-12);
}

@media (max-width: 980px) {
  .hero__inner {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 620px) {
  .hero {
    padding: 46px var(--s-4) 52px;
  }

  .hero__mini-stats {
    grid-template-columns: 1fr;
  }
}
</style>

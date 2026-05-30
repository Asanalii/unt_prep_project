<!-- src/components/landing/LandingCTA.vue -->
<script setup>
import BaseButton from "@/components/atoms/BaseButton.vue";
</script>

<template>
  <section class="cta-section">
    <div class="cta-card">
      <div>
        <span class="eyebrow">Начать подготовку</span>
        <h2>Проверь свои слабые темы уже сейчас</h2>
        <p>
          Пройди тест по математике, получи результат 40-вопросного формата и
          посмотри статистику по темам и сложности.
        </p>
      </div>

      <div class="cta-actions">
        <BaseButton variant="primary" size="lg" href="/tests">
          Начать тест
        </BaseButton>

        <BaseButton variant="secondary" size="lg" href="/dashboard">
          В дашборд
        </BaseButton>
      </div>
    </div>
  </section>
</template>

<style scoped>
.cta-section {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 var(--s-6) 80px;
}

.cta-card {
  position: relative;
  overflow: hidden;
  min-height: 320px;
  padding: 42px;
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 28px;
  align-items: center;
  border: 1px solid rgba(107, 123, 255, 0.36);
  border-radius: 36px;
  background:
    radial-gradient(
      circle at 18% 20%,
      rgba(255, 255, 255, 0.12),
      transparent 18%
    ),
    radial-gradient(
      circle at 82% 30%,
      rgba(25, 195, 125, 0.22),
      transparent 26%
    ),
    linear-gradient(135deg, rgba(107, 123, 255, 0.42), rgba(19, 23, 42, 0.92));
  box-shadow: 0 28px 90px rgba(0, 0, 0, 0.36);
}

.cta-card::after {
  content: "UNT";
  position: absolute;
  right: -20px;
  bottom: -52px;
  color: rgba(255, 255, 255, 0.05);
  font-size: 190px;
  font-weight: 900;
  letter-spacing: -0.09em;
}

.eyebrow {
  color: #cfd5ff;
  font-size: var(--fz-14);
  font-weight: 700;
}

h2 {
  position: relative;
  z-index: 1;
  max-width: 740px;
  margin: 12px 0 0;
  font-size: clamp(34px, 5vw, 58px);
  line-height: 1;
  letter-spacing: -0.06em;
}

p {
  position: relative;
  z-index: 1;
  max-width: 640px;
  margin: 18px 0 0;
  color: rgba(219, 224, 255, 0.76);
  line-height: 1.7;
}

.cta-actions {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

@media (max-width: 760px) {
  .cta-section {
    padding: 0 var(--s-4) 56px;
  }

  .cta-card {
    grid-template-columns: 1fr;
    padding: 28px;
  }

  .cta-actions {
    align-items: flex-start;
  }
}
</style>

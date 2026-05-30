<!-- src/components/landing/LandingNavbar.vue -->
<script setup>
import BaseButton from "@/components/atoms/BaseButton.vue";

const navItems = [
  { label: "Возможности", href: "#features" },
  { label: "Предметы", href: "#subjects" },
  { label: "Как работает", href: "#how-it-works" },
  { label: "Статистика", href: "#stats" },
];
</script>

<template>
  <header class="landing-navbar">
    <div class="landing-navbar__inner">
      <RouterLink to="/" class="brand">
        <span class="brand__logo">▼</span>
        <span class="brand__text">UNT Prep</span>
      </RouterLink>

      <nav class="nav-links">
        <a v-for="item in navItems" :key="item.href" :href="item.href">
          {{ item.label }}
        </a>
      </nav>

      <div class="actions">
        <BaseButton variant="ghost" size="sm" href="/auth/login">
          Войти
        </BaseButton>

        <BaseButton variant="primary" size="sm" href="/tests">
          Начать тест
        </BaseButton>
      </div>
    </div>
  </header>
</template>

<style scoped>
.landing-navbar {
  position: sticky;
  top: 0;
  z-index: 50;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  background: rgba(15, 18, 32, 0.78);
  backdrop-filter: blur(18px);
}

.landing-navbar__inner {
  max-width: 1200px;
  margin: 0 auto;
  padding: 14px var(--s-6);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--s-5);
}

.brand {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  font-weight: 800;
  letter-spacing: -0.03em;
}

.brand__logo {
  width: 34px;
  height: 34px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  background: linear-gradient(135deg, var(--color-primary), #19c37d);
  color: #fff;
  transform: rotate(180deg);
  box-shadow: 0 12px 28px rgba(107, 123, 255, 0.28);
}

.brand__text {
  font-size: 18px;
}

.nav-links {
  display: flex;
  align-items: center;
  gap: 22px;
  color: var(--muted);
  font-size: var(--fz-14);
}

.nav-links a {
  transition: color var(--motion-fast) var(--easing);
}

.nav-links a:hover {
  color: var(--text);
}

.actions {
  display: flex;
  gap: 10px;
}

@media (max-width: 850px) {
  .nav-links {
    display: none;
  }
}

@media (max-width: 520px) {
  .landing-navbar__inner {
    padding: 12px var(--s-4);
  }

  .actions {
    display: none;
  }
}
</style>

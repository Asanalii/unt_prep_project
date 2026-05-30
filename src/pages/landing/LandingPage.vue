<!-- src/pages/landing/LandingPage.vue -->
<script setup>
import LandingNavbar from "@/components/landing/LandingNavbar.vue";
import LandingHero from "@/components/landing/LandingHero.vue";
import LandingFeatures from "@/components/landing/LandingFeatures.vue";
import LandingSubjects from "@/components/landing/LandingSubjects.vue";
import LandingHowItWorks from "@/components/landing/LandingHowItWorks.vue";
import LandingStats from "@/components/landing/LandingStats.vue";
import LandingCTA from "@/components/landing/LandingCTA.vue";
</script>

<template>
  <main class="landing-page">
    <LandingNavbar />
    <LandingHero />
    <LandingFeatures />
    <LandingSubjects />
    <LandingHowItWorks />
    <LandingStats />
    <LandingCTA />
  </main>
</template>

<style scoped>
.landing-page {
  min-height: 100vh;
  overflow-x: hidden;
  background:
    radial-gradient(
      circle at top left,
      rgba(107, 123, 255, 0.22),
      transparent 34%
    ),
    radial-gradient(
      circle at top right,
      rgba(25, 195, 125, 0.12),
      transparent 28%
    ),
    radial-gradient(
      circle at bottom,
      rgba(245, 166, 35, 0.08),
      transparent 32%
    ),
    var(--bg);
  color: var(--text);
}
</style>

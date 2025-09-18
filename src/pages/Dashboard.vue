<script setup>
import BaseCard from "../components/atoms/BaseCard.vue";
import BaseButton from "../components/atoms/BaseButton.vue";
</script>

<template>
  <div class="grid">
    <BaseCard>
      <h2>Добро пожаловать 👋</h2>
      <p>Начните с выбора предмета или запустите пробный тест.</p>
      <div class="row" style="margin-top: var(--s-4)">
        <router-link to="/subjects"
          ><BaseButton>К предметам</BaseButton></router-link
        >
        <router-link to="/tests"
          ><BaseButton variant="outline">Открыть тесты</BaseButton></router-link
        >
      </div>
    </BaseCard>
  </div>
</template>

<style scoped>
.grid {
  display: grid;
  gap: var(--s-6);
}
h2 {
  margin: 0 0 var(--s-3);
  font-size: var(--fz-24);
}
</style>

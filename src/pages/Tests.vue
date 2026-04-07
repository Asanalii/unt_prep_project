<script setup>
import { ref, onMounted } from "vue";
import BaseCard from "../components/atoms/BaseCard.vue";
import BaseButton from "../components/atoms/BaseButton.vue";
import { fetchTests, startTest } from "../api/tests";

const list = ref([]);
onMounted(async () => {
  const res = await fetchTests();
  list.value = res.data.items;
});

async function onStart(t) {
  // console.log(t);
  window.location.href = "http://localhost:5175/ru/tests/run";

  // window.location.href =
  // const res = await startTest({ id: t.id });
  // alert(
  //   `Старт теста: ${res.data.attemptId} (вопросы: ${res.data.questions.length})`
  // );
}
</script>

<template>
  <div class="grid">
    <BaseCard v-for="t in list" :key="t.id" class="tile">
      <div class="title">{{ t.title }}</div>
      <div class="muted">Длительность: {{ t.duration }} мин.</div>
      <div class="row" style="margin-top: var(--s-3)">
        <BaseButton @click="onStart(t)">Начать</BaseButton>
      </div>
    </BaseCard>
  </div>
</template>

<style scoped>
.grid {
  display: grid;
  gap: var(--s-4);
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
}
.tile {
  padding: var(--s-5);
}
.title {
  font-weight: 700;
  margin-bottom: var(--s-1);
}
.muted {
  color: var(--muted);
}
</style>

<script setup>
import { ref, onMounted } from "vue";
import BaseCard from "../components/atoms/BaseCard.vue";
import BaseTag from "../components/atoms/BaseTag.vue";
import { fetchSubjects } from "../api/subjects";

const items = ref([]);
onMounted(async () => {
  const res = await fetchSubjects();
  items.value = res.data.items;
});
</script>

<template>
  <div class="grid">
    <BaseCard v-for="s in items" :key="s.id" class="tile">
      <div class="row">
        <div class="name">{{ s.name }}</div>
        <BaseTag :tone="s.available ? 'success' : 'default'">
          {{ s.available ? "Доступно" : "Скоро" }}
        </BaseTag>
      </div>
    </BaseCard>
  </div>
</template>

<style scoped>
.grid {
  display: grid;
  gap: var(--s-4);
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
}
.tile {
  padding: var(--s-5);
}
.name {
  font-weight: 600;
}
</style>

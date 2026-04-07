<!-- src/pages/Forum.vue -->
<script setup>
import { ref, onMounted, computed } from "vue";
import BaseCard from "../components/atoms/BaseCard.vue";
import BaseInput from "../components/atoms/BaseInput.vue";
import BaseButton from "../components/atoms/BaseButton.vue";
import { fetchThreads } from "../api/forum";

const threads = ref([]);
const q = ref("");

onMounted(async () => {
  const res = await fetchThreads();
  threads.value = res.data.items;
});

const filtered = computed(() =>
  threads.value.filter((t) =>
    t.title.toLowerCase().includes(q.value.toLowerCase()),
  ),
);
</script>

<template>
  <div class="page">
    <div class="row" style="margin-bottom: var(--s-4)">
      <BaseInput v-model="q" placeholder="Найти тему..." />
      <BaseButton style="white-space: nowrap">+ Создать тему</BaseButton>
    </div>
    <div class="list">
      <BaseCard v-for="t in filtered" :key="t.id" class="item">
        <div class="title">[{{ t.subject }}] {{ t.title }}</div>
        <div class="meta">
          👤 {{ t.author }} · 👁️ {{ t.views }} · 💬 {{ t.replies }} ·
          {{ t.createdAt }}
        </div>
        <div class="row" style="margin-top: var(--s-3)">
          <BaseButton variant="ghost">+ Ответить</BaseButton>
        </div>
      </BaseCard>
    </div>
  </div>
</template>

<style scoped>
.item {
  padding: var(--s-5);
}
.title {
  font-weight: 700;
  margin-bottom: var(--s-2);
}
.meta {
  color: var(--muted);
  font-size: var(--fz-14);
}
</style>

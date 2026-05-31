<script setup>
import { ref, onMounted, computed } from "vue";
import { useRoute, useRouter } from "vue-router";

import BaseCard from "@/components/atoms/BaseCard.vue";
import BaseTag from "@/components/atoms/BaseTag.vue";
import TopicQuizHistory from "./components/TopicQuizHistory.vue";

import { fetchSubjects } from "@/api/subjects";

const route = useRoute();
const router = useRouter();

const items = ref([]);

function subjectCode(s) {
  return s.code ?? s.id ?? "";
}

// Topic quiz currently supports math only.
function isPlayable(s) {
  if (!s.available) return false;
  const code = String(subjectCode(s)).toLowerCase();
  const name = String(s.name || "").toLowerCase();
  return code === "math" || name.includes("матем") || name.includes("math");
}

function openSubject(s) {
  if (!isPlayable(s)) return;
  router.push({
    name: "topic-quiz-setup",
    params: { locale: route.params.locale, subject: "math" },
  });
}

onMounted(async () => {
  const res = await fetchSubjects();
  items.value = res.data.items;
});
</script>

<template>
  <div class="subjects-page">
    <div class="grid">
      <BaseCard
        v-for="s in items"
        :key="s.id"
        class="tile"
        :class="{ playable: isPlayable(s) }"
        @click="openSubject(s)"
      >
        <div class="row">
          <div class="name">{{ s.name }}</div>
          <BaseTag :tone="s.available ? 'success' : 'default'">
            {{ s.available ? "Доступно" : "Скоро" }}
          </BaseTag>
        </div>

        <div v-if="isPlayable(s)" class="cta">Создать тренировочный тест →</div>
      </BaseCard>
    </div>

    <BaseCard class="history-card">
      <TopicQuizHistory subject="math" />
    </BaseCard>
  </div>
</template>

<style scoped>
.subjects-page {
  display: grid;
  gap: var(--s-6, 24px);
}

.grid {
  display: grid;
  gap: var(--s-4);
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
}

.tile {
  padding: var(--s-5);
  display: grid;
  gap: 12px;
}

.tile.playable {
  cursor: pointer;
  transition:
    border-color 0.15s ease,
    transform 0.15s ease;
}

.tile.playable:hover {
  border-color: var(--color-primary);
  transform: translateY(-2px);
}

.row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.name {
  font-weight: 600;
}

.cta {
  font-size: var(--fz-14);
  color: var(--color-primary);
  font-weight: 600;
}

.history-card {
  padding: var(--s-5, 20px);
}
</style>

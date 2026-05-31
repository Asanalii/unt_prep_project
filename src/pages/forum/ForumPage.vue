<!-- src/pages/forum/ForumPage.vue -->
<script setup>
import { computed, onMounted, ref } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useI18n } from "vue-i18n";

import BaseCard from "@/components/atoms/BaseCard.vue";
import BaseInput from "@/components/atoms/BaseInput.vue";
import BaseButton from "@/components/atoms/BaseButton.vue";
import CreateThreadModal from "./modals/CreateThreadModal.vue";

import { useUiStore } from "@/stores/ui";
import { fetchThreads } from "./api/forum";

const router = useRouter();
const route = useRoute();
const { t } = useI18n();
const ui = useUiStore();

const threads = ref([]);
const loading = ref(false);
const q = ref("");
const showCreateModal = ref(false);

async function loadThreads() {
  loading.value = true;
  try {
    const { data } = await fetchThreads();
    threads.value = data?.items || data || [];
  } catch (e) {
    ui.toast.error(e.message || t("forum.load_error"));
  } finally {
    loading.value = false;
  }
}

onMounted(loadThreads);

const filtered = computed(() => {
  const query = q.value.trim().toLowerCase();
  if (!query) return threads.value;

  return threads.value.filter((thread) => {
    const inTitle = (thread.title || "").toLowerCase().includes(query);
    const inBody = (thread.body || "").toLowerCase().includes(query);
    const inSubject = (thread.subject || "").toLowerCase().includes(query);
    return inTitle || inBody || inSubject;
  });
});

function openThread(id) {
  router.push({
    name: "forum-thread",
    params: { locale: route.params.locale, id },
  });
}

async function onThreadCreated(thread) {
  await loadThreads();
  if (thread?.id) openThread(thread.id);
}
</script>

<template>
  <div class="page">
    <div class="toolbar">
      <BaseInput v-model="q" :placeholder="t('forum.search_placeholder')" />
      <BaseButton @click="showCreateModal = true">
        {{ t("forum.create_topic") }}
      </BaseButton>
    </div>

    <div v-if="loading" class="muted">{{ t("common.loading") }}</div>

    <div v-else-if="filtered.length" class="list">
      <BaseCard
        v-for="thread in filtered"
        :key="thread.id"
        class="item"
        @click="openThread(thread.id)"
      >
        <div class="title">
          [{{ t(`subjects.${thread.subject}`) || thread.subject }}]
          {{ thread.title }}
        </div>

        <div class="meta">
          👤
          {{
            thread.author?.name || thread.author_name || thread.author || "—"
          }}
          · 👁️ {{ thread.views || 0 }} · 💬
          {{ thread.replies_count || thread.replies || 0 }} ·
          {{ thread.created_at || thread.createdAt || "—" }}
        </div>

        <div v-if="thread.body" class="preview">
          {{ thread.body }}
        </div>
      </BaseCard>
    </div>

    <div v-else class="muted">
      {{ t("forum.empty") }}
    </div>

    <CreateThreadModal
      :open="showCreateModal"
      @close="showCreateModal = false"
      @created="onThreadCreated"
    />
  </div>
</template>

<style scoped>
.page {
  display: grid;
  gap: var(--s-4);
}
.toolbar {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: var(--s-3);
}
.list {
  display: grid;
  gap: var(--s-4);
}
.item {
  padding: var(--s-5);
  cursor: pointer;
  transition:
    border-color 0.15s ease,
    transform 0.15s ease;
}
.item:hover {
  border-color: var(--color-primary);
  transform: translateY(-1px);
}
.title {
  font-weight: 700;
  margin-bottom: var(--s-2);
}
.meta,
.preview,
.muted {
  color: var(--muted);
}
.meta {
  font-size: var(--fz-14);
}
.preview {
  margin-top: var(--s-3);
}
</style>

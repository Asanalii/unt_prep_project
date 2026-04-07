<script setup>
import { computed, onMounted, ref } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useI18n } from "vue-i18n";

import BaseCard from "@/components/atoms/BaseCard.vue";
import BaseInput from "@/components/atoms/BaseInput.vue";
import BaseButton from "@/components/atoms/BaseButton.vue";

import { useUiStore } from "@/stores/ui";

import { createThread, fetchThreads, uploadForumFiles } from "./api/forum";

const router = useRouter();
const route = useRoute();
const { t } = useI18n();
const ui = useUiStore();

const threads = ref([]);
const loading = ref(false);
const q = ref("");

const showCreateForm = ref(false);
const creating = ref(false);

const title = ref("");
const subject = ref("math");
const body = ref("");
const files = ref([]);
const error = ref("");

const subjectOptions = [
  { value: "math", label: t("subjects.math") },
  { value: "cs", label: t("subjects.cs") },
  { value: "physics", label: t("subjects.physics") },
  { value: "chemistry", label: t("subjects.chemistry") },
  { value: "biology", label: t("subjects.biology") },
  { value: "history", label: t("subjects.history") },
  { value: "geography", label: t("subjects.geography") },
  { value: "english", label: t("subjects.english") },
];

async function loadThreads() {
  loading.value = true;

  try {
    const { data } = await fetchThreads();
    threads.value = data.items || [];
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

function onFilesChange(event) {
  files.value = Array.from(event.target.files || []);
}

async function onCreateThread() {
  error.value = "";

  try {
    if (!title.value.trim()) {
      throw new Error(t("forum.enter_title"));
    }

    if (!body.value.trim()) {
      throw new Error(t("forum.enter_body"));
    }

    creating.value = true;
    ui.setLoading(true, t("forum.creating"));

    let imageUrls = [];

    if (files.value.length) {
      const uploadResult = await uploadForumFiles(files.value);
      imageUrls = uploadResult.items || [];
    }

    const { data } = await createThread({
      title: title.value.trim(),
      subject: subject.value,
      body: body.value.trim(),
      images: imageUrls,
    });

    ui.toast.success(t("forum.create_success"));

    title.value = "";
    subject.value = "math";
    body.value = "";
    files.value = [];
    showCreateForm.value = false;

    await loadThreads();

    if (data?.id) {
      router.push({
        name: "forum-thread",
        params: {
          locale: route.params.locale,
          id: data.id,
        },
      });
    }
  } catch (e) {
    error.value = e.message || t("forum.create_error");
    ui.toast.error(error.value);
  } finally {
    creating.value = false;
    ui.setLoading(false);
  }
}

function openThread(id) {
  router.push({
    name: "forum-thread",
    params: {
      locale: route.params.locale,
      id,
    },
  });
}
</script>

<template>
  <div class="page">
    <div class="toolbar">
      <BaseInput v-model="q" :placeholder="t('forum.search_placeholder')" />
      <BaseButton @click="showCreateForm = !showCreateForm">
        {{
          showCreateForm ? t("forum.cancel_create") : t("forum.create_topic")
        }}
      </BaseButton>
    </div>

    <BaseCard v-if="showCreateForm" class="create-card">
      <h3>{{ t("forum.new_topic") }}</h3>

      <div class="field">
        <label>{{ t("forum.title") }}</label>
        <BaseInput
          v-model="title"
          :placeholder="t('forum.title_placeholder')"
        />
      </div>

      <div class="field">
        <label>{{ t("forum.subject") }}</label>
        <select v-model="subject" class="native-select">
          <option
            v-for="item in subjectOptions"
            :key="item.value"
            :value="item.value"
          >
            {{ item.label }}
          </option>
        </select>
      </div>

      <div class="field">
        <label>{{ t("forum.message") }}</label>
        <textarea
          v-model="body"
          class="native-textarea"
          :placeholder="t('forum.message_placeholder')"
          rows="5"
        />
      </div>

      <div class="field">
        <label>{{ t("forum.images") }}</label>
        <input type="file" multiple accept="image/*" @change="onFilesChange" />
      </div>

      <p v-if="error" class="err">{{ error }}</p>

      <div class="actions">
        <BaseButton :disabled="creating" @click="onCreateThread">
          {{ creating ? t("forum.creating") : t("forum.publish") }}
        </BaseButton>
      </div>
    </BaseCard>

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
          👤 {{ thread.author?.name || thread.author || "—" }} · 👁️
          {{ thread.views || 0 }} · 💬
          {{ thread.replies_count || thread.replies || 0 }} ·
          {{ thread.created_at || thread.createdAt }}
        </div>

        <div v-if="thread.body" class="preview">
          {{ thread.body }}
        </div>
      </BaseCard>
    </div>

    <div v-else class="muted">
      {{ t("forum.empty") }}
    </div>
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
.create-card,
.item {
  padding: var(--s-5);
}
.field {
  margin-bottom: var(--s-3);
}
.title {
  font-weight: 700;
  margin-bottom: var(--s-2);
}
.meta,
.preview,
.muted,
label {
  color: var(--muted);
}
.meta {
  font-size: var(--fz-14);
}
.preview {
  margin-top: var(--s-3);
}
.err {
  color: var(--danger);
  margin: 8px 0 12px;
}
.actions {
  display: flex;
  justify-content: flex-end;
}
.native-select,
.native-textarea {
  width: 100%;
  border: 1px solid var(--border);
  background: var(--bg-elev);
  color: var(--text);
  border-radius: var(--radius-sm);
  padding: 12px 14px;
  outline: none;
}
.item {
  cursor: pointer;
}
.item:hover {
  border-color: var(--color-primary);
}
</style>

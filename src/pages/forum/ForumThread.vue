<!-- src/pages/forum/ForumThread.vue -->
<script setup>
import { onMounted, ref } from "vue";
import { useRoute } from "vue-router";
import { useI18n } from "vue-i18n";

import BaseCard from "@/components/atoms/BaseCard.vue";
import BaseButton from "@/components/atoms/BaseButton.vue";
import { useUiStore } from "@/stores/ui";

import { createReply, fetchThreadById } from "./api/forum";

const route = useRoute();
const { t } = useI18n();
const ui = useUiStore();

const thread = ref(null);
const replies = ref([]);
const loading = ref(false);

const replyBody = ref("");
const replying = ref(false);
const error = ref("");

async function loadThread() {
  loading.value = true;

  try {
    const { data } = await fetchThreadById(route.params.id);
    thread.value = data?.thread || data;
    replies.value = data?.replies || [];
  } catch (e) {
    ui.toast.error(e.message || t("forum.load_error"));
  } finally {
    loading.value = false;
  }
}

onMounted(loadThread);

async function onCreateReply() {
  error.value = "";

  try {
    if (!replyBody.value.trim()) {
      throw new Error(t("forum.enter_reply"));
    }

    replying.value = true;
    ui.setLoading(true, t("forum.replying"));

    await createReply(route.params.id, {
      body: replyBody.value.trim(),
    });

    ui.toast.success(t("forum.reply_success"));

    replyBody.value = "";

    await loadThread();
  } catch (e) {
    error.value = e.message || t("forum.reply_error");
    ui.toast.error(error.value);
  } finally {
    replying.value = false;
    ui.setLoading(false);
  }
}
</script>

<template>
  <div class="page">
    <div v-if="loading" class="muted">{{ t("common.loading") }}</div>

    <template v-else-if="thread">
      <BaseCard class="thread-card">
        <div class="title">
          [{{ t(`subjects.${thread.subject}`) || thread.subject }}]
          {{ thread.title }}
        </div>

        <div class="meta">
          {{
            thread.author?.name || thread.author_name || thread.author || "—"
          }}
          · {{ thread.created_at || thread.createdAt || "—" }}
        </div>

        <div class="body">{{ thread.body }}</div>
      </BaseCard>

      <BaseCard class="reply-form">
        <h3>{{ t("forum.reply") }}</h3>

        <textarea
          v-model="replyBody"
          class="native-textarea"
          :placeholder="t('forum.reply_placeholder')"
          rows="4"
        />

        <p v-if="error" class="err">{{ error }}</p>

        <div class="actions">
          <BaseButton :disabled="replying" @click="onCreateReply">
            {{ replying ? t("forum.replying") : t("forum.send_reply") }}
          </BaseButton>
        </div>
      </BaseCard>

      <div class="list">
        <BaseCard v-for="reply in replies" :key="reply.id" class="reply-item">
          <div class="meta">
            {{ reply.author?.name || reply.author_name || reply.author || "—" }}
            · {{ reply.created_at || reply.createdAt || "—" }}
          </div>

          <div class="body">{{ reply.body }}</div>
        </BaseCard>
      </div>
    </template>
  </div>
</template>

<style scoped>
.page {
  display: grid;
  gap: var(--s-4);
}
.thread-card,
.reply-form,
.reply-item {
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
.body {
  margin-top: var(--s-3);
  white-space: pre-wrap;
}
.native-textarea {
  width: 100%;
  border: 1px solid var(--border);
  background: var(--bg-elev);
  color: var(--text);
  border-radius: var(--radius-sm);
  padding: 12px 14px;
  outline: none;
  margin-bottom: var(--s-3);
}
.err {
  color: var(--danger);
  margin: 8px 0 12px;
}
.actions {
  display: flex;
  justify-content: flex-end;
}
label,
.muted {
  color: var(--muted);
}
</style>

<!-- src/pages/forum/ForumThread.vue -->
<script setup>
import { computed, onMounted, reactive, ref } from "vue";
import { useRoute } from "vue-router";
import { useI18n } from "vue-i18n";

import BaseCard from "@/components/atoms/BaseCard.vue";
import BaseButton from "@/components/atoms/BaseButton.vue";

import { useUiStore } from "@/stores/ui";
import { useAuthStore } from "@/stores/auth";

import { createReply, fetchThreadById, acceptReply } from "./api/forum";

const route = useRoute();
const { t } = useI18n();
const ui = useUiStore();
const auth = useAuthStore();

const thread = ref(null);
const replies = ref([]);
const loading = ref(false);

// top-level composer
const rootBody = ref("");
const rootSending = ref(false);

// inline reply state per reply id (works for top-level AND child replies)
const replyBoxes = reactive({});
// which top-level comment threads are expanded to show children
const expanded = reactive({});

const isAuthor = computed(
  () => thread.value && auth.user?.id === thread.value.author_id,
);

function authorName(node) {
  return node?.author?.name || "—";
}

function initials(name) {
  const n = String(name || "").trim();
  return n ? n.charAt(0).toUpperCase() : "?";
}

function replyPlaceholder(node) {
  return `${t("forum.reply")} @${authorName(node)}…`;
}

function formatDate(value) {
  if (!value) return "—";
  const d = new Date(value);
  const diff = (Date.now() - d.getTime()) / 1000;

  if (diff < 60) return t("forum.just_now");
  if (diff < 3600) return t("forum.minutes_ago", { n: Math.floor(diff / 60) });
  if (diff < 86400) return t("forum.hours_ago", { n: Math.floor(diff / 3600) });
  if (diff < 7 * 86400)
    return t("forum.days_ago", { n: Math.floor(diff / 86400) });

  return d.toLocaleDateString(undefined, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

async function loadThread() {
  loading.value = true;
  try {
    const { data } = await fetchThreadById(route.params.id);
    thread.value = data;
    replies.value = data?.replies || [];
  } catch (e) {
    ui.toast.error(e.message || t("forum.load_error"));
  } finally {
    loading.value = false;
  }
}

onMounted(loadThread);

// parentReplyId: which reply we answer (null = top-level)
// expandTopId: which top comment to keep open after reload
async function submitReply({ body, parentReplyId, expandTopId, onDone }) {
  if (!body.trim()) {
    ui.toast.error(t("forum.enter_reply"));
    return false;
  }

  try {
    await createReply(route.params.id, {
      body: body.trim(),
      parent_reply_id: parentReplyId ?? null,
    });
    ui.toast.success(t("forum.reply_success"));
    await loadThread();
    if (expandTopId != null) expanded[expandTopId] = true;
    onDone?.();
    return true;
  } catch (e) {
    ui.toast.error(e?.response?.data?.detail || t("forum.reply_error"));
    return false;
  }
}

async function sendRoot() {
  rootSending.value = true;
  await submitReply({
    body: rootBody.value,
    parentReplyId: null,
    expandTopId: null,
    onDone: () => {
      rootBody.value = "";
    },
  });
  rootSending.value = false;
}

function box(replyId) {
  if (!replyBoxes[replyId]) {
    replyBoxes[replyId] = { open: false, body: "", sending: false };
  }
  return replyBoxes[replyId];
}

function toggleBox(replyId) {
  const b = box(replyId);
  b.open = !b.open;
}

// node can be a top-level reply or a child reply
async function sendReply(node) {
  const b = box(node.id);
  b.sending = true;
  const topId = node.parent_reply_id ?? node.id;
  await submitReply({
    body: b.body,
    parentReplyId: node.id,
    expandTopId: topId,
    onDone: () => {
      b.body = "";
      b.open = false;
    },
  });
  b.sending = false;
}

async function toggleAccept(node) {
  try {
    await acceptReply(route.params.id, node.id);
    await loadThread();
  } catch (e) {
    ui.toast.error(e?.response?.data?.detail || t("forum.accept_error"));
  }
}
</script>

<template>
  <div class="page">
    <div v-if="loading" class="muted">{{ t("common.loading") }}</div>

    <template v-else-if="thread">
      <!-- question -->
      <BaseCard class="thread-card">
        <div class="title">
          [{{ t(`subjects.${thread.subject}`) || thread.subject }}]
          {{ thread.title }}
        </div>
        <div class="byline">
          <span class="avatar">{{ initials(authorName(thread)) }}</span>
          <span class="who">{{ authorName(thread) }}</span>
          <span class="dot">·</span>
          <span class="time">{{ formatDate(thread.created_at) }}</span>
          <span class="dot">·</span>
          <span class="time">👁️ {{ thread.views }}</span>
        </div>
        <div class="body">{{ thread.body }}</div>
      </BaseCard>

      <!-- top-level composer -->
      <BaseCard class="composer">
        <h3>{{ t("forum.reply") }}</h3>
        <textarea
          v-model="rootBody"
          class="native-textarea"
          :placeholder="t('forum.reply_placeholder')"
          rows="3"
        />
        <div class="actions">
          <BaseButton :disabled="rootSending" @click="sendRoot">
            {{ rootSending ? t("forum.replying") : t("forum.send_reply") }}
          </BaseButton>
        </div>
      </BaseCard>

      <div class="replies-head">
        {{ t("forum.replies_count", { n: thread.replies_count }) }}
      </div>

      <!-- comments -->
      <div class="list">
        <BaseCard
          v-for="node in replies"
          :key="node.id"
          class="comment"
          :class="{ accepted: node.is_accepted }"
        >
          <div class="comment-row">
            <span class="avatar">{{ initials(authorName(node)) }}</span>

            <div class="comment-main">
              <div class="comment-meta">
                <span class="who">{{ authorName(node) }}</span>
                <span class="dot">·</span>
                <span class="time">{{ formatDate(node.created_at) }}</span>
                <span v-if="node.is_accepted" class="solved">
                  ✓ {{ t("forum.solution") }}
                </span>
              </div>

              <div class="body">{{ node.body }}</div>

              <div class="comment-actions">
                <button class="link" type="button" @click="toggleBox(node.id)">
                  {{ t("forum.reply") }}
                </button>
                <button
                  v-if="isAuthor"
                  class="link"
                  type="button"
                  @click="toggleAccept(node)"
                >
                  {{
                    node.is_accepted
                      ? t("forum.unmark_solution")
                      : t("forum.mark_solution")
                  }}
                </button>
                <button
                  v-if="node.children_count"
                  class="link"
                  type="button"
                  @click="expanded[node.id] = !expanded[node.id]"
                >
                  {{
                    expanded[node.id]
                      ? t("forum.hide_replies")
                      : t("forum.show_replies", { n: node.children_count })
                  }}
                </button>
              </div>

              <!-- inline reply box for the TOP comment -->
              <div v-if="box(node.id).open" class="reply-box">
                <textarea
                  v-model="box(node.id).body"
                  class="native-textarea"
                  :placeholder="replyPlaceholder(node)"
                  rows="2"
                />
                <div class="actions">
                  <BaseButton
                    variant="ghost"
                    @click="box(node.id).open = false"
                  >
                    {{ t("forum.cancel_create") }}
                  </BaseButton>
                  <BaseButton
                    :disabled="box(node.id).sending"
                    @click="sendReply(node)"
                  >
                    {{
                      box(node.id).sending
                        ? t("forum.replying")
                        : t("forum.send_reply")
                    }}
                  </BaseButton>
                </div>
              </div>

              <!-- children -->
              <div
                v-if="node.children_count && expanded[node.id]"
                class="children"
              >
                <div
                  v-for="child in node.children"
                  :key="child.id"
                  class="child"
                >
                  <span class="avatar sm">{{
                    initials(authorName(child))
                  }}</span>
                  <div class="child-main">
                    <div class="comment-meta">
                      <span class="who">{{ authorName(child) }}</span>
                      <span class="dot">·</span>
                      <span class="time">{{
                        formatDate(child.created_at)
                      }}</span>
                    </div>
                    <div class="body">
                      <span v-if="child.reply_to" class="mention">
                        @{{ child.reply_to }}
                      </span>
                      {{ child.body }}
                    </div>

                    <button
                      class="link"
                      type="button"
                      @click="toggleBox(child.id)"
                    >
                      {{ t("forum.reply") }}
                    </button>

                    <!-- inline reply box for THIS child (opens right here) -->
                    <div v-if="box(child.id).open" class="reply-box">
                      <textarea
                        v-model="box(child.id).body"
                        class="native-textarea"
                        :placeholder="replyPlaceholder(child)"
                        rows="2"
                      />
                      <div class="actions">
                        <BaseButton
                          variant="ghost"
                          @click="box(child.id).open = false"
                        >
                          {{ t("forum.cancel_create") }}
                        </BaseButton>
                        <BaseButton
                          :disabled="box(child.id).sending"
                          @click="sendReply(child)"
                        >
                          {{
                            box(child.id).sending
                              ? t("forum.replying")
                              : t("forum.send_reply")
                          }}
                        </BaseButton>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
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
.composer,
.comment {
  padding: var(--s-5);
}

.title {
  font-weight: 700;
  font-size: var(--fz-20);
  margin-bottom: var(--s-2);
}

.byline,
.comment-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--muted);
  font-size: var(--fz-14);
  flex-wrap: wrap;
}

.dot {
  opacity: 0.5;
}

.body {
  margin-top: var(--s-3);
  white-space: pre-wrap;
  color: var(--text);
  line-height: 1.6;
}

.avatar {
  width: 36px;
  height: 36px;
  flex-shrink: 0;
  border-radius: 50%;
  background: var(--color-primary);
  color: #fff;
  display: grid;
  place-items: center;
  font-weight: 700;
}

.avatar.sm {
  width: 28px;
  height: 28px;
  font-size: var(--fz-14);
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
  resize: vertical;
}

.composer h3 {
  margin: 0 0 var(--s-3);
}

.actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.replies-head {
  font-weight: 700;
  margin-top: var(--s-2);
}

.list {
  display: grid;
  gap: var(--s-3);
}

.comment.accepted {
  border-color: var(--success);
  box-shadow: inset 0 0 0 1px var(--success);
}

.comment-row {
  display: flex;
  gap: 12px;
}

.comment-main {
  flex: 1;
  min-width: 0;
}

.solved {
  color: var(--success);
  font-weight: 700;
  font-size: var(--fz-12, 12px);
  border: 1px solid var(--success);
  border-radius: 999px;
  padding: 2px 8px;
}

.comment-actions {
  display: flex;
  gap: 16px;
  margin-top: 8px;
  flex-wrap: wrap;
}

.link {
  background: none;
  border: none;
  color: var(--muted);
  cursor: pointer;
  font-size: var(--fz-14);
  font-weight: 600;
  padding: 0;
}

.link:hover {
  color: var(--color-primary);
}

.reply-box {
  margin-top: 12px;
}

.children {
  margin-top: 14px;
  display: grid;
  gap: 14px;
  padding-left: 14px;
  border-left: 2px solid var(--border);
}

.child {
  display: flex;
  gap: 10px;
}

.child-main {
  flex: 1;
  min-width: 0;
}

.mention {
  color: var(--color-primary);
  font-weight: 600;
  margin-right: 4px;
}
</style>

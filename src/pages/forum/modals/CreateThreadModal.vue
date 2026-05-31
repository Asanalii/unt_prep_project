<!-- src/pages/forum/modals/CreateThreadModal.vue -->
<script setup>
import { computed, ref } from "vue";
import { useI18n } from "vue-i18n";

import BaseButton from "@/components/atoms/BaseButton.vue";
import BaseInput from "@/components/atoms/BaseInput.vue";

import { useUiStore } from "@/stores/ui";
import { createThread } from "../api/forum";

const props = defineProps({
  open: { type: Boolean, default: false },
});

const emit = defineEmits(["close", "created"]);

const { t } = useI18n();
const ui = useUiStore();

const title = ref("");
const subject = ref("math");
const body = ref("");
const error = ref("");
const creating = ref(false);

const subjectOptions = computed(() => [
  { value: "math", label: t("subjects.math") },
  { value: "cs", label: t("subjects.cs") },
  { value: "physics", label: t("subjects.physics") },
  { value: "chemistry", label: t("subjects.chemistry") },
  { value: "biology", label: t("subjects.biology") },
  { value: "history", label: t("subjects.history") },
  { value: "geography", label: t("subjects.geography") },
  { value: "english", label: t("subjects.english") },
]);

function reset() {
  title.value = "";
  subject.value = "math";
  body.value = "";
  error.value = "";
}

function close() {
  if (creating.value) return;
  emit("close");
}

async function submit() {
  error.value = "";

  if (!title.value.trim()) {
    error.value = t("forum.enter_title");
    return;
  }
  if (!body.value.trim()) {
    error.value = t("forum.enter_body");
    return;
  }

  creating.value = true;
  try {
    const { data } = await createThread({
      title: title.value.trim(),
      subject: subject.value,
      body: body.value.trim(),
    });
    ui.toast.success(t("forum.create_success"));
    reset();
    emit("created", data);
    emit("close");
  } catch (e) {
    error.value =
      e?.response?.data?.detail || e.message || t("forum.create_error");
    ui.toast.error(error.value);
  } finally {
    creating.value = false;
  }
}
</script>

<template>
  <Teleport to="body">
    <Transition name="modal-fade">
      <div v-if="open" class="backdrop" @click.self="close">
        <div class="modal">
          <div class="modal-head">
            <h3>{{ t("forum.new_topic") }}</h3>
            <button class="close" type="button" @click="close">×</button>
          </div>

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
              rows="6"
            />
          </div>

          <p v-if="error" class="err">{{ error }}</p>

          <div class="modal-actions">
            <BaseButton variant="ghost" :disabled="creating" @click="close">
              {{ t("forum.cancel_create") }}
            </BaseButton>
            <BaseButton :disabled="creating" @click="submit">
              {{ creating ? t("forum.creating") : t("forum.publish") }}
            </BaseButton>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.backdrop {
  position: fixed;
  inset: 0;
  z-index: 9999;
  background: rgba(2, 6, 23, 0.72);
  backdrop-filter: blur(6px);
  display: grid;
  place-items: center;
  padding: 18px;
}

.modal {
  width: min(640px, 100%);
  max-height: 88vh;
  overflow: auto;
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  padding: var(--s-5, 20px);
  display: grid;
  gap: var(--s-3, 12px);
}

.modal-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.modal-head h3 {
  margin: 0;
}

.close {
  width: 38px;
  height: 38px;
  border: 1px solid var(--border);
  border-radius: 12px;
  background: var(--bg-elev);
  color: var(--text);
  cursor: pointer;
  font-size: 26px;
  line-height: 1;
}

.close:hover {
  border-color: var(--color-primary);
}

.field {
  display: grid;
  gap: 6px;
}

.field label {
  color: var(--muted);
  font-size: var(--fz-14);
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
  resize: vertical;
}

.err {
  color: var(--danger);
  margin: 0;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 4px;
}

.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.18s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}
</style>

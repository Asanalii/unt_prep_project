<script setup>
import { useUiStore } from "../../stores/ui";
const ui = useUiStore();
</script>

<template>
  <div class="toast-wrap">
    <transition-group name="fade" tag="div" class="stack">
      <div
        v-for="t in ui.toasts"
        :key="t.id"
        class="toast"
        :data-type="t.type"
        @click="ui.removeToast(t.id)"
      >
        <div class="title" v-if="t.title">{{ t.title }}</div>
        <div class="msg">{{ t.message }}</div>
      </div>
    </transition-group>
  </div>
</template>

<style scoped>
.toast-wrap {
  position: fixed;
  right: 16px;
  top: 16px;
  z-index: 9999;
}
.stack {
  display: grid;
  gap: 10px;
}

.toast {
  min-width: 260px;
  background: var(--card);
  color: var(--text);
  border: 1px solid var(--border);
  border-left: 4px solid var(--color-primary);
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  padding: 10px 12px;
  cursor: pointer;
}
.toast[data-type="success"] {
  border-left-color: var(--success);
}
.toast[data-type="warning"] {
  border-left-color: var(--warning);
}
.toast[data-type="danger"] {
  border-left-color: var(--danger);
}

.title {
  font-weight: 700;
  margin-bottom: 2px;
}
.msg {
  color: var(--text);
  font-size: var(--fz-14);
}

/* anim */
.fade-enter-active,
.fade-leave-active {
  transition: all 0.18s ease;
}
.fade-enter-from {
  opacity: 0;
  transform: translateY(-8px);
}
.fade-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>

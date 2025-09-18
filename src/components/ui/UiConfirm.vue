<script setup>
import { useUiStore } from "../../stores/ui";
const ui = useUiStore();

function onKey(e) {
  if (!ui.confirmOpen) return;
  if (e.key === "Escape") ui.resolveConfirm(false);
}
window.addEventListener("keydown", onKey);
</script>

<template>
  <teleport to="body">
    <transition name="fade">
      <div
        v-if="ui.confirmOpen"
        class="backdrop"
        @click.self="ui.resolveConfirm(false)"
      >
        <div class="modal card">
          <h3 class="title">{{ ui.confirmTitle }}</h3>
          <p class="text">{{ ui.confirmText }}</p>
          <div class="row">
            <button class="btn ghost" @click="ui.resolveConfirm(false)">
              {{ ui.confirmCancelText }}
            </button>
            <button class="btn" @click="ui.resolveConfirm(true)">
              {{ ui.confirmOkText }}
            </button>
          </div>
        </div>
      </div>
    </transition>
  </teleport>
</template>

<style scoped>
.backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  display: grid;
  place-items: center;
  z-index: 9998;
}
.modal.card {
  width: min(520px, calc(100vw - 32px));
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  padding: 18px;
}
.title {
  margin: 0 0 8px;
  font-size: var(--fz-20);
}
.text {
  margin: 0 0 16px;
  color: var(--muted);
}
.row {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
}

.btn {
  border: 1px solid transparent;
  background: var(--color-primary);
  color: white;
  padding: 10px 14px;
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: 0.15s ease;
}
.btn:hover {
  background: var(--color-primary-600);
}
.btn.ghost {
  background: transparent;
  color: var(--text);
  border-color: var(--border);
}
.btn.ghost:hover {
  background: var(--card);
}
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.18s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>

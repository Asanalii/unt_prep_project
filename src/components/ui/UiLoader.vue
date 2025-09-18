<script setup>
import { useUiStore } from "../../stores/ui";
const ui = useUiStore();
</script>

<template>
  <teleport to="body">
    <transition name="fade">
      <div v-if="ui.loading" class="overlay">
        <div class="box card">
          <div class="spinner"></div>
          <div class="msg">{{ ui.loadingMessage || "Загрузка…" }}</div>
        </div>
      </div>
    </transition>
  </teleport>
</template>

<style scoped>
.overlay {
  position: fixed;
  inset: 0;
  display: grid;
  place-items: center;
  background: rgba(0, 0, 0, 0.35);
  z-index: 9997;
}
.box.card {
  display: grid;
  justify-items: center;
  gap: 10px;
  padding: 18px;
  min-width: 220px;
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  box-shadow: var(--shadow);
}
.spinner {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: 3px solid var(--border);
  border-top-color: var(--color-primary);
  animation: spin 0.8s linear infinite;
}
.msg {
  color: var(--muted);
}
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
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

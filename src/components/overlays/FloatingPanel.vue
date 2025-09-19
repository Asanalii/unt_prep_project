<script setup>
import { ref, watch, onMounted, onBeforeUnmount } from "vue";

const props = defineProps({
  title: { type: String, default: "" },
  x: { type: Number, default: 32 }, // стартовая позиция
  y: { type: Number, default: 32 },
  persistKey: { type: String, default: "" }, // если задан — сохраняем позицию
  z: { type: Number, default: 40 }, // z-index поверх UI
  width: { type: [Number, String], default: "auto" },
});
const emit = defineEmits(["close"]);

const pos = ref({ x: props.x, y: props.y });
const dragging = ref(false);
let start = { x: 0, y: 0 }; // точка старта указателя
let origin = { x: 0, y: 0 }; // позиция панели до начала drag

function clampToViewport(x, y) {
  const el = root.value;
  if (!el) return { x, y };
  const pad = 8;
  const rect = el.getBoundingClientRect();
  const W = window.innerWidth,
    H = window.innerHeight;
  const maxX = W - rect.width - pad;
  const maxY = H - rect.height - pad;
  return {
    x: Math.min(Math.max(pad, x), Math.max(pad, maxX)),
    y: Math.min(Math.max(pad, y), Math.max(pad, maxY)),
  };
}

function onPointerDown(e) {
  dragging.value = true;
  start = { x: e.clientX, y: e.clientY };
  origin = { ...pos.value };
  window.addEventListener("pointermove", onPointerMove);
  window.addEventListener("pointerup", onPointerUp);
  // чтобы курсор не выделял текст при переносе
  document.body.style.userSelect = "none";
}
function onPointerMove(e) {
  if (!dragging.value) return;
  const dx = e.clientX - start.x;
  const dy = e.clientY - start.y;
  const next = clampToViewport(origin.x + dx, origin.y + dy);
  pos.value = next;
}
function onPointerUp() {
  dragging.value = false;
  document.body.style.userSelect = "";
  window.removeEventListener("pointermove", onPointerMove);
  window.removeEventListener("pointerup", onPointerUp);
  if (props.persistKey) {
    localStorage.setItem(`fp:${props.persistKey}`, JSON.stringify(pos.value));
  }
}

const root = ref(null);

onMounted(() => {
  // восстановить позицию
  if (props.persistKey) {
    const raw = localStorage.getItem(`fp:${props.persistKey}`);
    if (raw) {
      try {
        const saved = JSON.parse(raw);
        pos.value = clampToViewport(saved.x ?? props.x, saved.y ?? props.y);
      } catch {}
    }
  }
  // поправить при ресайзе окна
  window.addEventListener("resize", () => {
    pos.value = clampToViewport(pos.value.x, pos.value.y);
  });
});
onBeforeUnmount(() => {
  window.removeEventListener("pointermove", onPointerMove);
  window.removeEventListener("pointerup", onPointerUp);
});
</script>

<template>
  <div
    ref="root"
    class="fp"
    :style="{
      left: pos.x + 'px',
      top: pos.y + 'px',
      zIndex: z,
      width: typeof width === 'number' ? width + 'px' : width,
    }"
  >
    <div class="fp-head" @pointerdown="onPointerDown">
      <div class="fp-title">{{ title }}</div>
      <button class="fp-close" aria-label="close" @click="emit('close')">
        ✕
      </button>
    </div>

    <div class="fp-body">
      <slot />
    </div>
  </div>
</template>

<style scoped>
.fp {
  position: fixed;
  box-shadow: var(--shadow, 0 10px 30px rgba(0, 0, 0, 0.35));
  background: var(--bg, #111);
  border: 1px solid var(--border, #2a2a2a);
  border-radius: 10px;
  overflow: hidden;
}
.fp-head {
  display: grid;
  grid-template-columns: 1fr auto;
  align-items: center;
  gap: 8px;
  padding: 8px 10px;
  background: var(--bg-elev, #15161a);
  border-bottom: 1px solid var(--border, #2a2a2a);
  cursor: move; /* показывает, что можно перетаскивать */
  user-select: none;
}
.fp-title {
  font-weight: 600;
  color: var(--text, #e6e6e6);
}
.fp-close {
  border: 1px solid var(--border, #2a2a2a);
  background: var(--bg, transparent);
  color: var(--text, #e6e6e6);
  border-radius: 8px;
  width: 28px;
  height: 28px;
  cursor: pointer;
}
.fp-close:hover {
  background: var(--card, rgba(255, 255, 255, 0.04));
}
.fp-body {
  padding: 10px;
}
</style>

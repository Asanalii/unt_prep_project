<script setup>
import { computed } from "vue";
import { useUiStore } from "../../stores/ui";
const ui = useUiStore();
const widthStyle = computed(() => ({ width: ui.topbarProgress + "%" }));
</script>

<template>
  <teleport to="body">
    <div v-show="ui.topbarActive" class="topbar">
      <div class="bar" :style="widthStyle">
        <div class="peg" />
      </div>
    </div>
  </teleport>
</template>

<style scoped>
.topbar {
  position: fixed;
  z-index: 99999;
  top: 0;
  left: 0;
  right: 0;
  pointer-events: none;
}
.bar {
  height: 3px;
  background: linear-gradient(90deg, var(--color-primary), #7f8cff);
  transition: width 0.2s ease;
  box-shadow: 0 0 6px rgba(103, 115, 255, 0.6);
  position: relative;
}
.peg {
  position: absolute;
  right: 0;
  top: 0;
  bottom: 0;
  width: 80px;
  opacity: 0.9;
  box-shadow: 0 0 10px #7f8cff, 0 0 5px #7f8cff;
  transform: rotate(3deg) translate(0, -2px);
}
</style>

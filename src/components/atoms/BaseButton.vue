<!-- src/components/atoms/BaseButton.vue -->
<script setup>
import { computed, useAttrs } from "vue";

const props = defineProps({
  variant: { type: String, default: "primary" }, // primary | secondary | ghost | outline | danger | white
  size: { type: String, default: "md" }, // sm | md | lg
  block: { type: Boolean, default: false },
  loading: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false },

  href: { type: String, default: null },
  target: { type: String, default: null },
  rel: { type: String, default: null },
  type: { type: String, default: "button" },
});

const attrs = useAttrs();

const isLink = computed(() => !!props.href);
const isDisabled = computed(() => props.disabled || props.loading);
const tag = computed(() => (isLink.value ? "a" : "button"));

const computedRel = computed(() => {
  if (!isLink.value) return undefined;
  if (props.rel) return props.rel;
  if (props.target === "_blank") return "noopener noreferrer";
  return undefined;
});

const classes = computed(() => [
  "btn",
  `btn--${props.variant}`,
  `btn--${props.size}`,
  {
    "btn--block": props.block,
    "btn--loading": props.loading,
    "is-disabled": isDisabled.value,
  },
]);

function onClick(e) {
  if (isLink.value && isDisabled.value) {
    e.preventDefault();
    e.stopPropagation();
  }
}
</script>

<template>
  <component
    :is="tag"
    :class="classes"
    v-bind="attrs"
    :href="isDisabled ? undefined : href"
    :target="isLink ? target : undefined"
    :rel="computedRel"
    :type="!isLink ? type : undefined"
    :disabled="!isLink ? isDisabled : undefined"
    :aria-busy="loading || undefined"
    :aria-disabled="isDisabled || undefined"
    :tabindex="isDisabled && isLink ? -1 : attrs.tabindex"
    @click="onClick"
  >
    <span v-if="$slots.icon" class="btn__icon btn__icon--left">
      <slot name="icon" />
    </span>

    <span class="btn__label">
      <slot />
    </span>

    <span v-if="$slots['icon-right']" class="btn__icon btn__icon--right">
      <slot name="icon-right" />
    </span>

    <span v-if="loading" class="spinner" aria-hidden="true" />
  </component>
</template>

<style scoped>
.btn {
  --btn-bg: var(--color-primary);
  --btn-bg-hover: var(--color-primary-600);
  --btn-bg-active: var(--color-primary-700);
  --btn-color: #fff;
  --btn-border: transparent;

  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;

  width: auto;
  border: 1px solid var(--btn-border);
  border-radius: 10px;
  background: var(--btn-bg);
  color: var(--btn-color);

  font-family: inherit;
  font-weight: 500;
  line-height: 1.2;
  text-align: center;
  text-decoration: none;
  white-space: nowrap;

  cursor: pointer;
  user-select: none;
  box-shadow: var(--shadow);

  transition:
    background-color 0.18s ease,
    color 0.18s ease,
    border-color 0.18s ease,
    transform 0.12s ease,
    box-shadow 0.18s ease,
    opacity 0.18s ease;
}

.btn--block {
  width: 100%;
}

/* sizes */
.btn--sm {
  min-height: 36px;
  padding: 8px 12px;
  font-size: var(--fz-14);
}

.btn--md {
  min-height: 44px;
  padding: 12px 16px;
  font-size: var(--fz-14);
}

.btn--lg {
  min-height: 52px;
  padding: 16px 20px;
  font-size: var(--fz-16);
}

/* variants */
.btn--primary {
  --btn-bg: var(--color-primary);
  --btn-bg-hover: var(--color-primary-600);
  --btn-bg-active: var(--color-primary-700);
  --btn-color: #fff;
  --btn-border: transparent;
}

.btn--secondary {
  --btn-bg: var(--bg-elev);
  --btn-bg-hover: var(--border);
  --btn-bg-active: var(--border);
  --btn-color: var(--text);
  --btn-border: var(--border);
  box-shadow: none;
}

.btn--ghost {
  --btn-bg: transparent;
  --btn-bg-hover: var(--bg-elev);
  --btn-bg-active: var(--border);
  --btn-color: var(--text);
  --btn-border: var(--border);
  box-shadow: none;
}

.btn--outline {
  --btn-bg: transparent;
  --btn-bg-hover: rgba(107, 123, 255, 0.08);
  --btn-bg-active: rgba(107, 123, 255, 0.14);
  --btn-color: var(--color-primary);
  --btn-border: var(--color-primary);
  box-shadow: none;
}

.btn--danger {
  --btn-bg: var(--danger);
  --btn-bg-hover: #ff4747;
  --btn-bg-active: #e64545;
  --btn-color: #fff;
  --btn-border: transparent;
}

.btn--white {
  --btn-bg: #fff;
  --btn-bg-hover: var(--color-primary);
  --btn-bg-active: var(--color-primary-600);
  --btn-color: #111827;
  --btn-border: var(--border);

  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
}

/* states */
.btn:hover:not(.is-disabled) {
  background: var(--btn-bg-hover);
  border-color: var(--btn-border);
  transform: translateY(-1px);
}

.btn:active:not(.is-disabled) {
  background: var(--btn-bg-active);
  transform: translateY(0);
}

.btn:focus-visible {
  outline: 2px solid color-mix(in srgb, var(--color-primary) 45%, white);
  outline-offset: 2px;
}

.btn--white:hover:not(.is-disabled) {
  color: #fff;
  border-color: var(--color-primary);
}

.btn--white:active:not(.is-disabled) {
  color: #fff;
  border-color: var(--color-primary-600);
}

.btn--loading,
.btn.is-disabled {
  opacity: 0.6;
  cursor: not-allowed;
  pointer-events: none;
  box-shadow: none;
  transform: none;
}

/* content */
.btn__label {
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.btn__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
}

.btn__icon--left {
  margin-right: 2px;
}

.btn__icon--right {
  margin-left: 2px;
}

/* spinner */
.spinner {
  width: 1em;
  height: 1em;
  flex-shrink: 0;
  border-radius: 50%;
  border: 2px solid currentColor;
  border-right-color: transparent;
  display: inline-block;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>

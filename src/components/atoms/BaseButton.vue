<script setup>
import { computed } from "vue";
import { useAttrs } from "vue";

/* комменты
  Варианты:
    variant: primary | ghost | outline
    size:    sm | md | lg
  Поведение:
    loading  — крутилка + блок действий
    disabled — блок действий
    block    — ширина 100%
  Полиморфизм:
    href     — если задан, рендерим <a>
    target   — для <a>
    rel      — для <a> (по умолчанию добавим rel="noopener noreferrer" при target="_blank")
    type     — для <button>: button | submit | reset
*/

const props = defineProps({
  variant: { type: String, default: "primary" },
  size: { type: String, default: "md" },
  block: { type: Boolean, default: false },
  loading: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false },

  // Полиморфизм
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
  props.variant,
  props.size,
  {
    block: props.block,
    loading: props.loading,
    "is-disabled": isDisabled.value,
  },
]);

function onClick(e) {
  // блокируем переход по ссылке в disabled/loading
  if (isLink.value && isDisabled.value) {
    e.preventDefault();
    e.stopPropagation();
  }
}

// <!-- простая кнопка -->
// <BaseButton @click="save">Сохранить</BaseButton>

// <!-- маленькая «призрачная» -->
// <BaseButton variant="ghost" size="sm" @click="cancel">Отмена</BaseButton>

// <!-- обводка + иконка слева -->
// <BaseButton variant="outline">
//   <template #icon>🔍</template>
//   Найти
// </BaseButton>

// <!-- ссылка (рендерится как <a>) -->
// <BaseButton href="https://example.com" target="_blank">Открыть сайт</BaseButton>

// <!-- загрузка -->
// <BaseButton :loading="true" disabled>Загружаем…</BaseButton>

// <!-- иконка справа -->
// <BaseButton>
//   Далее
//   <template #icon-right>→</template>
// </BaseButton>

// <!-- во всю ширину -->
// <BaseButton block @click="doIt">Продолжить</BaseButton>
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
    :aria-busy="loading || undefined"
    :aria-disabled="isDisabled || undefined"
    :tabindex="isDisabled && isLink ? -1 : attrs.tabindex"
    @click="onClick"
  >
    <slot name="icon" />
    <span class="label"><slot /></span>
    <slot name="icon-right" />
    <span v-if="loading" class="spinner" aria-hidden="true" />
  </component>
</template>

<style scoped>
.btn {
  --_pad-y: 10px;
  --_pad-x: 14px;

  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;

  border: 1px solid transparent;
  background: var(--color-primary);
  color: #fff;

  padding: var(--_pad-y) var(--_pad-x);
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: 0.15s ease;
  box-shadow: var(--shadow);
  text-decoration: none;
  line-height: 1.2;
  user-select: none;
}
.btn.block {
  width: 100%;
}
.btn:hover:not(.is-disabled) {
  background: var(--color-primary-600);
}

.btn.loading,
.btn.is-disabled {
  opacity: 0.6;
  cursor: not-allowed;
  box-shadow: none;
  pointer-events: none; /* защищает <a> */
}

.btn.ghost {
  background: transparent;
  border-color: var(--border);
  color: var(--text);
  box-shadow: none;
}
.btn.ghost:hover:not(.is-disabled) {
  background: var(--card);
}

.btn.outline {
  background: transparent;
  border-color: var(--color-primary-600);
  color: var(--color-primary-600);
}

.btn.sm {
  --_pad-y: 6px;
  --_pad-x: 10px;
  font-size: var(--fz-14);
  box-shadow: none;
}
.btn.lg {
  --_pad-y: 14px;
  --_pad-x: 18px;
  font-size: var(--fz-16);
}

.label {
  white-space: nowrap;
}

.spinner {
  width: 1em;
  height: 1em;
  border-radius: 50%;
  border: 2px solid currentColor;
  border-right-color: transparent;
  display: inline-block;
  animation: spin 0.9s linear infinite;
}
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>

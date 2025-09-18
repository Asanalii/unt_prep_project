<script setup>
// ===== Libraries
import { computed } from "vue";
import { RouterLink } from "vue-router";
import { useI18n } from "vue-i18n";

// ===== i18n
const { locale } = useI18n();

// ===== Props
const props = defineProps({
  to: { type: [String, Object], required: true }, // "tests" | "/tests" | { name:'tests', query:{...} } | { path:'/tests' }
  target: { type: String, default: undefined },
  rel: { type: String, default: undefined },
  replace: { type: Boolean, default: false },
  custom: { type: Boolean, default: false },

  // прокидываем классы активности, чтобы работал exact на дашборде
  activeClass: { type: String, default: undefined },
  exactActiveClass: { type: String, default: undefined },

  // опционально: сохранить текущий query при string-to
  preserveQuery: { type: Boolean, default: false },
});

// ===== Helpers
const isExternal = (href) =>
  typeof href === "string" && /^(https?:)?\/\//i.test(href);

// Строим локализованный string-путь: "tests" -> "/kk/tests", "/" -> "/kk"
function localizePath(path) {
  const l = locale.value || "ru";
  // уже локализовано? /ru/... /kk/... /en/...
  if (/^\/(ru|kk|en)(\/|$)/.test(path)) return path;
  // абсолютный -> убираем ведущий /
  const p = path.startsWith("/") ? path.slice(1) : path;
  return p.length ? `/${l}/${p}` : `/${l}`;
}

const localizedTo = computed(() => {
  const to = props.to;

  // 1) Строки
  if (typeof to === "string") {
    if (isExternal(to)) return to; // наружу — отдаем как есть (через <a>)
    return localizePath(to);
  }

  // 2) Объекты маршрута
  if (to && typeof to === "object") {
    // name-путь — просто добавляем params.locale
    if ("name" in to && to.name) {
      return {
        ...to,
        params: { ...(to.params || {}), locale: locale.value || "ru" },
      };
    }
    // path-путь — локализуем строкой
    if ("path" in to && typeof to.path === "string") {
      return { ...to, path: localizePath(to.path) };
    }
  }

  return to;
});
</script>

<template>
  <!-- Наружные ссылки рендерим <a> -->
  <a
    v-if="
      typeof localizedTo === 'string' && /^(https?:)?\/\//i.test(localizedTo)
    "
    :href="localizedTo"
    :target="target"
    :rel="rel || (target === '_blank' ? 'noopener noreferrer' : undefined)"
  >
    <slot />
  </a>

  <!-- Всё остальное — через RouterLink -->
  <RouterLink
    v-else
    :to="localizedTo"
    :replace="replace"
    :custom="custom"
    :target="target"
    :rel="rel"
    :active-class="activeClass"
    :exact-active-class="exactActiveClass"
  >
    <slot />
  </RouterLink>
</template>

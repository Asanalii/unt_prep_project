/**
 * useL10nRoute — локализатор маршрутов
 *
 * Назначение:
 *  - автоматически добавляет префикс /:locale (ru|kk|en) к строковым путям
 *  - добавляет params.locale к именованным роутам
 *  - оставляет внешние ссылки (https://...) как есть
 *
 * Поддержка:
 *  - строковые пути: "tests", "/tests", "/"
 *  - именованные роуты: { name: "tests", query: {...} }
 *  - объект с path: { path: "/tests", query: {...} }
 *
 * Usage:
 * --------------------------------------------------------------------------
 * // import { useL10nRoute } from "@/composables/useL10nRoute";
 * // const { l10nTo, pushL10n, replaceL10n, localeCode } = useL10nRoute();
 * //
 * // // именованный роут
 * // await pushL10n({ name: "tests" });
 * //
 * // // строковый путь
 * // router.push(l10nTo("subjects"));   // → "/kk/subjects"
 * //
 * // // абсолютный путь
 * // router.replace(l10nTo("/forum"));
 * //
 * // // внешние ссылки остаются как есть
 * // window.open(l10nTo("https://docs.example.com"), "_blank");
 * --------------------------------------------------------------------------
 */

import { computed } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";

const SUPPORTED_LOCALES = ["ru", "kk", "en"];
const LOCALE_PREFIX_RE = /^\/(ru|kk|en)(\/|$)/i;

function isExternalUrl(href) {
  return typeof href === "string" && /^(https?:)?\/\//i.test(href);
}

function ensureLocalePrefix(path, localeCode) {
  if (LOCALE_PREFIX_RE.test(path)) return path; // уже локализовано
  const cleanedPath = path.startsWith("/") ? path.slice(1) : path;
  return cleanedPath.length
    ? `/${localeCode}/${cleanedPath}`
    : `/${localeCode}`;
}

export function useL10nRoute() {
  const router = useRouter();
  const { locale } = useI18n();

  const localeCode = computed(() => {
    const current = String(locale.value || "");
    return SUPPORTED_LOCALES.includes(current) ? current : "ru";
  });

  /** Привести любой "to" к локализованному варианту */
  function l10nTo(to) {
    const code = localeCode.value;

    // Строки
    if (typeof to === "string") {
      if (isExternalUrl(to)) return to; // внешние ссылки — как есть
      if (to === "/") return `/${code}`;
      return ensureLocalePrefix(to, code);
    }

    // Объекты маршрутов
    if (to && typeof to === "object") {
      // с именем
      if ("name" in to && to.name) {
        return {
          ...to,
          params: { ...(to.params || {}), locale: code },
        };
      }
      // с path
      if ("path" in to && typeof to.path === "string") {
        return { ...to, path: ensureLocalePrefix(to.path, code) };
      }
    }

    return to;
  }

  /** router.push с автоматической локализацией */
  function pushL10n(to) {
    return router.push(l10nTo(to));
  }

  /** router.replace с автоматической локализацией */
  function replaceL10n(to) {
    return router.replace(l10nTo(to));
  }

  return {
    localeCode, // computed<string> текущая локаль, гарантированно из SUPPORTED_LOCALES
    l10nTo,
    pushL10n,
    replaceL10n,
  };
}

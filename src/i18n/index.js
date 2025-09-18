import { createI18n } from "vue-i18n";

const fallbackLocale = "ru";
const saved = localStorage.getItem("locale") || fallbackLocale;

export const i18n = createI18n({
  legacy: false,
  locale: saved,
  fallbackLocale,
  messages: {},
});

export async function loadLocale(locale) {
  if (i18n.global.availableLocales.includes(locale)) {
    i18n.global.locale.value = locale;
    return;
  }
  const msgs = await import(`./locales/${locale}.json`);
  i18n.global.setLocaleMessage(locale, msgs.default || msgs);
  i18n.global.locale.value = locale;
}

<script setup>
// ===== Libraries
import { computed } from "vue";
import { useRoute } from "vue-router";
import { useI18n } from "vue-i18n";

// ===== Components / Atoms / UI
import BaseTag from "@/components/atoms/BaseTag.vue";
import LocalizedLink from "../../i18n/LocalizedLink.vue";

// ===== Local
const route = useRoute();
const { t } = useI18n();
const locale = computed(() => (route.params.locale || "ru").toString());
</script>

<template>
  <nav class="wrap">
    <div class="brand">{{ t("app.name") }}</div>

    <ul class="menu">
      <li>
        <LocalizedLink
          :to="{ name: 'dashboard' }"
          exact-active-class="router-link-exact-active"
          class="item"
          >{{ t("common.dashboard") }}</LocalizedLink
        >
      </li>
      <li>
        <LocalizedLink to="tests" class="item">{{
          t("common.tests")
        }}</LocalizedLink>
      </li>
      <li>
        <LocalizedLink to="subjects" class="item">{{
          t("common.subjects")
        }}</LocalizedLink>
      </li>
      <li>
        <LocalizedLink to="forum" class="item">{{
          t("common.forum")
        }}</LocalizedLink>
      </li>
      <li class="mt">
        <BaseTag tone="success">{{ t("app.beta") }}</BaseTag>
      </li>
    </ul>
    <!-- <ul class="menu">
      <li>
        <router-link
          :to="{ name: 'dashboard', params: { locale } }"
          class="item"
          exact-active-class="is-exact-active"
        >
          {{ t("common.dashboard") }}
        </router-link>
      </li>

      <li>
        <router-link :to="{ name: 'tests', params: { locale } }" class="item">
          {{ t("common.tests") }}
        </router-link>
      </li>

      <li>
        <router-link
          :to="{ name: 'subjects', params: { locale } }"
          class="item"
        >
          {{ t("common.subjects") }}
        </router-link>
      </li>

      <li>
        <router-link :to="{ name: 'forum', params: { locale } }" class="item">
          {{ t("common.forum") }}
        </router-link>
      </li>

      <li class="mt">
        <BaseTag tone="success">{{ t("app.beta") }}</BaseTag>
      </li>
    </ul> -->
  </nav>
</template>

<style scoped>
.wrap {
  padding: var(--s-6);
}

.brand {
  font-size: var(--fz-20);
  font-weight: 700;
  margin-bottom: var(--s-6);
  color: var(--text);
}

.menu {
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  gap: var(--s-2);
}

/* кликабельность */
.item {
  display: block;
  padding: 10px 12px;
  border-radius: var(--radius-sm);
  color: var(--text);
  border: 1px solid transparent;
  cursor: pointer;
  user-select: none;
  transition: background-color 0.15s, border-color 0.15s, box-shadow 0.15s;
  text-decoration: none;
}
.item:hover {
  border-color: var(--accent-color, #6c5ce7);
  box-shadow: 0 0 0 2px
    color-mix(in oklab, var(--accent-color, #6c5ce7) 20%, transparent);
}
.item:focus-visible {
  outline: 2px solid var(--accent-color, #6c5ce7);
  outline-offset: 2px;
}

/* точная активность для дашборда */
.item.router-link-exact-active {
  background: color-mix(
    in oklab,
    var(--accent-color, #6c5ce7) 12%,
    var(--card)
  );
  border-color: var(--accent-color, #6c5ce7);
  box-shadow: inset 0 0 0 1px
    color-mix(in oklab, var(--accent-color, #6c5ce7) 35%, var(--border));
}

.mt {
  margin-top: var(--s-8);
}
</style>

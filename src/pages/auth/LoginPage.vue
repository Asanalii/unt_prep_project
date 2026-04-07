<!-- src/pages/auth/LoginPage.vue -->
<script setup>
// ===== Libraries
import { onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useI18n } from "vue-i18n";

// ===== Stores
import { useAuthStore } from "@/stores/auth";
import { useUiStore } from "@/stores/ui";

// ===== UI
import BaseCard from "@/components/atoms/BaseCard.vue";
import BaseInput from "@/components/atoms/BaseInput.vue";
import BaseButton from "@/components/atoms/BaseButton.vue";
import LocalizedLink from "@/i18n/LocalizedLink.vue";

const route = useRoute();
const router = useRouter();
const { t } = useI18n();

const auth = useAuthStore();
const ui = useUiStore();

const email = ref("");
const password = ref("");
const loading = ref(false);
const error = ref("");

onMounted(() => {
  if (typeof route.query.email === "string") {
    email.value = route.query.email;
  }
});

async function onSubmit() {
  error.value = "";

  try {
    if (!email.value.trim()) {
      throw new Error(t("auth.enter_email") || "Введите email");
    }

    if (!password.value) {
      throw new Error(t("auth.enter_password") || "Введите пароль");
    }

    loading.value = true;
    ui.setLoading(true, t("auth.entering"));

    await auth.login({
      email: email.value.trim(),
      password: password.value,
    });

    ui.toast.success(t("toast.welcome"));

    const redirect = route.query.redirect;
    const fallback = `/${route.params.locale || "ru"}`;

    await router.replace(typeof redirect === "string" ? redirect : fallback);
  } catch (e) {
    error.value = e.message || t("auth.login_error") || "Ошибка входа";
    ui.toast.error(error.value);
  } finally {
    loading.value = false;
    ui.setLoading(false);
  }
}
</script>

<template>
  <BaseCard class="card">
    <h2>{{ t("auth.login") }}</h2>
    <p class="muted">{{ t("auth.welcome_back") }}</p>

    <div class="field">
      <label>{{ t("auth.email") }}</label>
      <BaseInput v-model="email" placeholder="you@example.com" />
    </div>

    <div class="field">
      <label>{{ t("auth.password") }}</label>
      <BaseInput v-model="password" type="password" placeholder="••••••••" />
    </div>

    <p v-if="error" class="err">{{ error }}</p>

    <BaseButton :disabled="loading" @click="onSubmit">
      {{ loading ? t("auth.entering") : t("auth.enter") }}
    </BaseButton>

    <p class="swap">
      {{ t("auth.no_account") }}
      <LocalizedLink to="register">{{ t("auth.go_register") }}</LocalizedLink>
    </p>
  </BaseCard>
</template>

<style scoped>
.card {
  width: 100%;
  max-width: 420px;
  padding: 24px;
}
h2 {
  margin: 0 0 8px;
}
.muted {
  color: var(--muted);
  margin: 0 0 16px;
}
.field {
  margin-bottom: 12px;
}
label {
  display: block;
  margin-bottom: 6px;
  font-size: var(--fz-14);
  color: var(--muted);
}
.err {
  color: var(--danger);
  margin: 8px 0 12px;
}
.swap {
  margin-top: 12px;
  color: var(--muted);
}
</style>

<!-- src/pages/auth/RegisterPage.vue -->
<script setup>
import { ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useI18n } from "vue-i18n";

import { useAuthStore } from "@/stores/auth";

import BaseCard from "@/components/atoms/BaseCard.vue";
import BaseInput from "@/components/atoms/BaseInput.vue";
import BaseButton from "@/components/atoms/BaseButton.vue";
import LocalizedLink from "@/i18n/LocalizedLink.vue";

const route = useRoute();
const router = useRouter();
const { t } = useI18n();

const auth = useAuthStore();

const name = ref("");
const email = ref("");
const password = ref("");
const pass2 = ref("");
const loading = ref(false);
const error = ref("");
const ok = ref("");

async function onSubmit() {
  error.value = "";
  ok.value = "";

  try {
    if (!name.value.trim()) {
      throw new Error(t("auth.enter_name") || "Введите имя");
    }

    if (!email.value.trim()) {
      throw new Error(t("auth.enter_email") || "Введите email");
    }

    if (!password.value) {
      throw new Error(t("auth.enter_password") || "Введите пароль");
    }

    if (password.value.length < 6) {
      throw new Error(
        t("auth.password_too_short") ||
          "Пароль должен быть не менее 6 символов",
      );
    }

    if (password.value !== pass2.value) {
      throw new Error(t("auth.password_mismatch") || "Пароли не совпадают");
    }

    loading.value = true;

    await auth.register({
      name: name.value.trim(),
      email: email.value.trim(),
      password: password.value,
    });

    ok.value =
      t("auth.register_success") || "Регистрация успешна! Теперь войдите.";

    await router.push({
      name: "login",
      params: { locale: route.params.locale },
      query: { email: email.value.trim() },
    });
  } catch (e) {
    error.value = e.message || t("auth.register_error") || "Ошибка регистрации";
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <BaseCard class="card">
    <h2>{{ t("auth.register") }}</h2>
    <p class="muted">{{ t("auth.create_account") }}</p>

    <div class="field">
      <label>{{ t("common.name") || "Имя" }}</label>
      <BaseInput v-model="name" :placeholder="t('common.name') || 'Имя'" />
    </div>

    <div class="field">
      <label>{{ t("auth.email") }}</label>
      <BaseInput v-model="email" placeholder="you@example.com" />
    </div>

    <div class="field">
      <label>{{ t("auth.password") }}</label>
      <BaseInput v-model="password" type="password" placeholder="••••••••" />
    </div>

    <div class="field">
      <label>{{ t("auth.password_repeat") }}</label>
      <BaseInput v-model="pass2" type="password" placeholder="••••••••" />
    </div>

    <p v-if="error" class="err">{{ error }}</p>
    <p v-if="ok" class="ok">{{ ok }}</p>

    <BaseButton :disabled="loading" @click="onSubmit">
      {{ loading ? t("auth.signing") : t("auth.signup") }}
    </BaseButton>

    <p class="swap">
      {{ t("auth.has_account") }}
      <LocalizedLink to="login">{{ t("auth.go_login") }}</LocalizedLink>
    </p>
  </BaseCard>
</template>

<style scoped>
.card {
  width: 100%;
  max-width: 480px;
  padding: 24px;
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
.ok {
  color: var(--success);
  margin: 8px 0 12px;
}
.swap {
  margin-top: 12px;
  color: var(--muted);
}
</style>

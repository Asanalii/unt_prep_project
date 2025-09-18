<script setup>
import { ref } from "vue";
import BaseCard from "../components/atoms/BaseCard.vue";
import BaseInput from "../components/atoms/BaseInput.vue";
import BaseButton from "../components/atoms/BaseButton.vue";
import { useAuthStore } from "../stores/auth";
import { useRouter, RouterLink } from "vue-router";

const name = ref("");
const email = ref("");
const password = ref("");
const pass2 = ref("");
const loading = ref(false);
const error = ref("");
const ok = ref("");
const auth = useAuthStore();
const router = useRouter();

async function onSubmit() {
  error.value = "";
  ok.value = "";
  loading.value = true;
  try {
    if (password.value !== pass2.value) throw new Error("Пароли не совпадают");
    await auth.register({
      name: name.value,
      email: email.value,
      password: password.value,
    });
    ok.value = "Регистрация успешна! Теперь войдите.";
    setTimeout(
      () => router.push({ name: "login", query: { email: email.value } }),
      600
    );
  } catch (e) {
    error.value = e.message || "Ошибка регистрации";
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <BaseCard class="card">
    <h2>Регистрация</h2>
    <p class="muted">Создайте аккаунт для подготовки к ЕНТ.</p>

    <div class="field">
      <label>Имя</label><BaseInput v-model="name" placeholder="Имя" />
    </div>
    <div class="field">
      <label>Email</label
      ><BaseInput v-model="email" placeholder="you@example.com" />
    </div>
    <div class="field">
      <label>Пароль</label
      ><BaseInput v-model="password" type="password" placeholder="••••••••" />
    </div>
    <div class="field">
      <label>Повтор пароля</label
      ><BaseInput v-model="pass2" type="password" placeholder="••••••••" />
    </div>

    <p v-if="error" class="err">{{ error }}</p>
    <p v-if="ok" class="ok">{{ ok }}</p>

    <BaseButton :disabled="loading" @click="onSubmit">{{
      loading ? "Создаём…" : "Зарегистрироваться"
    }}</BaseButton>

    <p class="swap">
      Уже есть аккаунт? <RouterLink to="/login">Войти</RouterLink>
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

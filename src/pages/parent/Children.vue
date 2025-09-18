<script setup>
import BaseCard from "@/components/atoms/BaseCard.vue";
import BaseButton from "@/components/atoms/BaseButton.vue";
import BaseInput from "@/components/atoms/BaseInput.vue";
import { ref } from "vue";

const code = ref("");
function linkChild() {
  // TODO: API привязки по коду
}
</script>

<template>
  <BaseCard>
    <h2>Мои дети</h2>
    <p class="muted">Здесь будут дети, привязанные к вашему аккаунту.</p>

    <div style="margin-top: 12px; display: flex; gap: 8px">
      <BaseInput v-model="code" placeholder="Код приглашения" />
      <BaseButton @click="linkChild">Привязать</BaseButton>
    </div>
  </BaseCard>
</template>

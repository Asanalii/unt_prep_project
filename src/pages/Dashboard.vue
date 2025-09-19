<script setup>
import { ref, watchEffect } from "vue";
import { useI18n } from "vue-i18n";
import DashboardHeader from "@/components/dashboard/DashboardHeader.vue";
import StatsCards from "@/components/dashboard/StatsCards.vue";
import AttemptsTable from "@/components/dashboard/AttemptsTable.vue";
import { useDashboardData } from "@/composables/useDashboardData";

const { t } = useI18n();

const { user, attempts, summary, loading, fetchAll } = useDashboardData();

const filters = ref({
  q: "",
  subject: "all",
  status: "all",
  dateFrom: null,
  dateTo: null,
  sort: "-startedAt",
});

function reload() {
  fetchAll();
}

function onUpdateFilters(next) {
  filters.value = { ...filters.value, ...next };
}

function openAttempt(attemptId) {
  // Анти-читинг: только просмотр (read-only), без продолжения
  // Пример: router.push({ name: 'attempt.view', params: { id: attemptId } })
  console.debug("openAttempt (read-only):", attemptId);
}

watchEffect(() => {
  // Если понадобится реактивная подгрузка под фильтры — делаем тут
  // Сейчас данные уже все подтянуты моками; таблица фильтрует на клиенте
});
</script>

<template>
  <div class="dash">
    <DashboardHeader :user="user" :summary="summary" :on-refresh="reload" />

    <StatsCards :summary="summary" class="mt" />

    <AttemptsTable
      class="mt"
      :attempts="attempts"
      :loading="loading"
      :filters="filters"
      @update:filters="onUpdateFilters"
      @open-attempt="openAttempt"
    />
  </div>
</template>

<style scoped>
.dash {
  padding: 16px;
  display: grid;
  grid-auto-rows: min-content;
  gap: 16px;
}
.mt {
  margin-top: 8px;
}
</style>

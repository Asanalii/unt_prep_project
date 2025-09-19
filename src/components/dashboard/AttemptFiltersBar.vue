<script setup>
const props = defineProps({
  q: String,
  status: String,
  subject: String,
  sort: String,
});
const emit = defineEmits([
  "update:q",
  "update:status",
  "update:subject",
  "update:sort",
  "apply",
  "reset",
]);
</script>

<template>
  <div class="bar">
    <input
      class="inp"
      placeholder="Поиск по ID/банку…"
      :value="q"
      @input="(e) => emit('update:q', e.target.value)"
    />
    <select
      class="sel"
      :value="status"
      @change="(e) => emit('update:status', e.target.value)"
    >
      <option value="all">Все статусы</option>
      <option value="active">В процессе</option>
      <option value="hold">Пауза</option>
      <option value="approved">Разрешено</option>
      <option value="done">Завершено</option>
      <option value="cancelled">Отменено</option>
    </select>
    <select
      class="sel"
      :value="subject"
      @change="(e) => emit('update:subject', e.target.value)"
    >
      <option value="all">Все предметы</option>
      <option value="literacy">Грамотность чтения</option>
      <option value="mathlit">Матем. грамотность</option>
      <option value="history">История</option>
      <option value="math">Математика</option>
      <option value="cs">Информатика</option>
    </select>
    <select
      class="sel"
      :value="sort"
      @change="(e) => emit('update:sort', e.target.value)"
    >
      <option value="date_desc">Сначала новые</option>
      <option value="date_asc">Сначала старые</option>
      <option value="score_desc">По баллу ↓</option>
      <option value="score_asc">По баллу ↑</option>
    </select>
    <button class="ghost" @click="emit('apply')">Применить</button>
    <button class="ghost" @click="emit('reset')">Сброс</button>
  </div>
</template>

<style scoped>
.bar {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
}
.inp,
.sel {
  height: 34px;
  padding: 6px 10px;
  border-radius: 8px;
  border: 1px solid var(--border);
  background: var(--bg);
  color: var(--text);
}
.inp {
  min-width: 220px;
}
.ghost {
  height: 34px;
  padding: 6px 10px;
  border-radius: 8px;
  border: 1px solid var(--border);
  background: var(--bg);
  color: var(--text);
}
</style>

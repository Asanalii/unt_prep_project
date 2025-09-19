<script setup>
defineProps({ items: { type: Array, default: () => [] } });
</script>

<template>
  <section class="wrap">
    <div class="hdr">
      <div class="ttl">{{ $t("dashboard.activity.title") }}</div>
    </div>
    <ul class="feed">
      <li v-for="i in items" :key="i.id">
        <span class="time">{{ new Date(i.ts).toLocaleString() }}</span>
        <span class="text">{{ i.text }}</span>
      </li>
      <li v-if="items.length === 0" class="empty">
        {{ $t("dashboard.activity.empty") }}
      </li>
    </ul>
  </section>
</template>

<style scoped>
.wrap {
  border: 1px solid var(--border);
  border-radius: 12px;
  background: var(--bg);
}
.hdr {
  padding: 10px 12px;
  border-bottom: 1px solid var(--border);
}
.ttl {
  font-weight: 600;
}
.feed {
  list-style: none;
  margin: 0;
  padding: 8px 12px;
  display: grid;
  gap: 8px;
}
.time {
  color: var(--muted);
  margin-right: 8px;
  font-size: 12px;
}
.empty {
  color: var(--muted);
  text-align: center;
  padding: 8px 0;
}
</style>

<script setup>
import { useRoute, useRouter } from "vue-router";
import { computed } from "vue";
import { useAttemptDetail } from "@/composables/useAttemptDetail";

import AttemptHeader from "@/components/attempt/AttemptHeader.vue";
import SubjectStatsRow from "@/components/attempt/SubjectStatsRow.vue";
import MiniAnswerMap from "@/components/attempt/MiniAnswerMap.vue";
import TimeBarChart from "@/components/attempt/TimeBarChart.vue";

const route = useRoute();
const router = useRouter();

const attemptId = computed(() => route.params.id);
const { loading, attempt, bySubject, timeSeries, mistakes } =
  useAttemptDetail(attemptId);

function openQuestion(qid) {
  // здесь можно открыть модалку «просмотр вопроса»
  console.debug("open question", qid);
}

function back() {
  router.push({ name: "dashboard" });
}
</script>

<template>
  <div class="attempt">
    <AttemptHeader v-if="attempt" :attempt="attempt" @back="back" />

    <section class="grid g-top" v-if="attempt">
      <SubjectStatsRow :items="bySubject" />

      <div class="panel">
        <div class="panel-h">
          <h3>Карта вопросов</h3>
        </div>
        <MiniAnswerMap :answers="attempt.answers" @open="openQuestion" />
      </div>

      <div class="panel">
        <div class="panel-h">
          <h3>Время на вопрос</h3>
        </div>
        <TimeBarChart :data="timeSeries" />
      </div>

      <div class="panel">
        <div class="panel-h">
          <h3>Типичные ошибки и рекомендации</h3>
        </div>
        <ul class="mistakes">
          <li v-for="m in mistakes" :key="m.key">
            <div class="tt">
              <b>{{ m.topic }}</b>
              <span class="pct">{{ m.rate }}%</span>
            </div>
            <div class="tx">
              {{ m.hint }}
              <a class="lnk" href="#" @click.prevent>потренироваться →</a>
            </div>
          </li>
        </ul>
      </div>
    </section>
  </div>
</template>

<style scoped>
.attempt {
  padding: 16px;
  display: grid;
  gap: 16px;
}
.grid.g-top {
  display: grid;
  gap: 12px;
  grid-template-columns: repeat(12, minmax(0, 1fr));
}
.grid.g-top > * {
  min-width: 0;
  min-height: 0;
  grid-column: 1 / -1;
}

.panel {
  border: 1px solid var(--border);
  border-radius: 14px;
  padding: 12px;
  background: var(--bg);
}
.panel-h {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
}

.mistakes {
  display: grid;
  gap: 10px;
}
.tt {
  display: flex;
  align-items: center;
  gap: 8px;
}
.pct {
  margin-left: auto;
  color: var(--muted);
}
.tx {
  color: var(--muted);
}
.lnk {
  color: var(--accent-color);
}
</style>

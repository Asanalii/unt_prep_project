<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from "vue";
import FloatingPanel from "@/components/overlays/FloatingPanel.vue";
import {
  cations,
  anions,
  solubility,
  activityRow,
} from "@/assets/data/solubilityInfo";

defineProps({ open: { type: Boolean, default: false } });
const emit = defineEmits<{ close: [] }>();

// позиция/размер — как у Менделеева
const startX = ref(80),
  startY = ref(80);
const panelW = ref(1080),
  panelH = ref(720);
function recalc() {
  const marginX = 64,
    marginY = 120;
  panelW.value = Math.max(980, Math.min(window.innerWidth - marginX, 1280));
  panelH.value = Math.max(600, Math.min(window.innerHeight - marginY, 860));
}
onMounted(() => {
  recalc();
  window.addEventListener("resize", recalc);
  startX.value = Math.max(8, window.innerWidth - panelW.value - 24);
  startY.value = Math.max(8, 72);
});
onBeforeUnmount(() => window.removeEventListener("resize", recalc));

// класс по коду
function solClass(code: string) {
  return (
    {
      P: "sol-P",
      M: "sol-M",
      H: "sol-H",
      "-": "sol-D",
    }[code] || (code === "_" ? "sol-D" : "")
  );
}
</script>

<template>
  <FloatingPanel
    v-if="open"
    title="Таблица растворимости"
    :x="startX"
    :y="startY"
    :width="panelW"
    :height="panelH"
    persist-key="solubility"
    @close="emit('close')"
  >
    <div class="sol">
      <div class="table-wrap">
        <table class="main" border="2">
          <thead>
            <tr>
              <th class="left-sticky" rowspan="2"><h3>Анион</h3></th>
              <th :colspan="cations.length"><h3>Катион</h3></th>
            </tr>
            <tr>
              <th v-for="c in cations" :key="c" class="top-sticky">
                <div class="cell">
                  <span class="symbol">{{ c }}</span>
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(a, ri) in anions" :key="a">
              <th class="left-sticky">
                <div class="cell">
                  <span class="symbol">{{ a }}</span>
                </div>
              </th>
              <td
                v-for="(c, ci) in cations"
                :key="a + '-' + c"
                :class="solClass(solubility[ri]?.[ci] || '')"
              >
                <div class="cell tcenter">
                  <span class="code">{{ solubility[ri]?.[ci] || "" }}</span>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="legend">
        <div><span class="chip sol-P"></span> <b>Р</b> — растворяются</div>
        <div><span class="chip sol-M"></span> <b>М</b> — мало растворяются</div>
        <div><span class="chip sol-H"></span> <b>Н</b> — не растворяются</div>
        <div>
          <span class="chip sol-D"></span> <b>–</b> — в водной среде разлагаются
        </div>
      </div>

      <div class="activity">
        <h3>Ряд активности металлов</h3>
        <div>{{ activityRow }}</div>
        <div class="hint">
          Ослабление восстановительных свойств, активности ➜
        </div>
      </div>
    </div>
  </FloatingPanel>
</template>

<style scoped>
.sol {
  padding: 8px;
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.table-wrap {
  overflow: auto;
  border-radius: 8px;

  max-height: 80%;
}

table {
  width: 100%;
  border-collapse: collapse;
  background: var(--bg);
  color: var(--text);
  table-layout: fixed;
}
thead th {
  background: var(--bg-elev);
}
.top-sticky {
  position: sticky;
  top: 34px;
  z-index: 1;
} /* 2-я строка тега thead */
thead tr:first-child th {
  position: sticky;
  top: 0;
  z-index: 2;
} /* 1-я строка */
.left-sticky {
  background: var(--bg-elev);
  position: sticky;
  left: 0;
  z-index: 3;
}

.cell {
  padding: 6px 4px;
  min-height: 34px;
}
.tcenter {
  text-align: center;
}
.symbol {
  white-space: nowrap;
  font-weight: 600;
}

/* коды */
.code {
  font-weight: 700;
}

/* цвета — под референс */
.sol-P {
  background: color-mix(in oklab, mediumpurple 28%, var(--card));
  border-color: var(--border);
}
.sol-M {
  background: color-mix(in oklab, lightseagreen 28%, var(--card));
  border-color: var(--border);
}
.sol-H {
  background: color-mix(in oklab, lightpink 38%, var(--card));
  border-color: var(--border);
}
.sol-D {
  background: color-mix(in oklab, goldenrod 38%, var(--card));
  border-color: var(--border);
}

/* легенда */
.legend {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: center;
  font-size: 12px;
  color: var(--muted);
}
.chip {
  display: inline-block;
  width: 14px;
  height: 10px;
  border-radius: 3px;
  margin-right: 6px;
  border: 1px solid var(--border);
}

/* ряд активности */
.activity {
  /* padding: 6px 0 2px; */
  text-align: center;
}

.activity .row {
  font-weight: 600;
  margin-top: 4px;
}

.activity .hint {
  margin-top: 4px;
  color: var(--muted);
}

h3 {
  margin: 4px 0;
}
</style>

<!-- src/components/tools/MendeleevPanel.vue -->
<script setup>
import { ref, onMounted, onBeforeUnmount } from "vue";

import FloatingPanel from "@/components/overlays/FloatingPanel.vue";
import { elements, lanth, actin } from "@/assets/data/chemicalInfo";

defineProps({
  open: { type: Boolean, default: false },
});

const emit = defineEmits(["close"]);

// стартовая позиция
const startX = ref(80);
const startY = ref(80);

const panelW = ref(1080); // стартовое
const panelH = ref(720);

function recalc() {
  const marginX = 64; // отступы от краёв
  const marginY = 120;
  // не выходим за границы, но даём таблице «вздохнуть»
  panelW.value = Math.max(980, Math.min(window.innerWidth - marginX, 1280));
  panelH.value = Math.max(600, Math.min(window.innerHeight - marginY, 860));
}
onMounted(() => {
  if (typeof window !== "undefined") {
    recalc();
    window.addEventListener("resize", recalc);
    startX.value = Math.max(8, window.innerWidth - panelW.value - 24);
    startY.value = Math.max(8, 72);
  }
});

onBeforeUnmount(() => {
  if (typeof window !== "undefined")
    window.removeEventListener("resize", recalc);
});

/**
 * ДАННЫЕ
 * Для основной таблицы используем «старую» схему с VIII в 4-х колонах (как на скрине).
 * Поля:
 *  - z: атомный номер
 *  - s: символ
 *  - name: название
 *  - mass: относительная атомная масса (строка)
 *  - period: 1..7
 *  - group: "I".."VIII1".."VIII4" (VIII развалена на 4 колонки)
 *  - cls: col1..col5 для цвета клетки (как в примере)
 */

function byPos(p, g) {
  return elements.find((e) => e.period === p && e.group === g) || null;
}

const headerGroupsBottom = [
  "I",
  "II",
  "III",
  "IV",
  "V",
  "VI",
  "VII",
  "VIII1",
  "VIII2",
  "VIII3",
  "VIII4",
];

// порядок колонок для «двойных» периодов
const rowGroups = {
  4: {
    top: ["I", "II", "III", "IV", "V", "VI", "VII", "VIII1", "VIII2", "VIII3"],
    bottom: [
      "VIII4_d1",
      "VIII4_d2",
      "III_p",
      "IV_p",
      "V_p",
      "VI_p",
      "VII_p",
      "VIII4_g",
    ],
  },
  5: {
    top: ["I", "II", "III", "IV", "V", "VI", "VII", "VIII1", "VIII2", "VIII3"],
    bottom: [
      "VIII4_d1",
      "VIII4_d2",
      "III_p",
      "IV_p",
      "V_p",
      "VI_p",
      "VII_p",
      "VIII4_g",
    ],
  },
  6: {
    top: [
      "I",
      "II",
      /* III пропуск */ "IV",
      "V",
      "VI",
      "VII",
      "VIII1",
      "VIII2",
      "VIII3",
    ],
    bottom: [
      "VIII4_d1",
      "VIII4_d2",
      "III_p",
      "IV_p",
      "V_p",
      "VI_p",
      "VII_p",
      "VIII4_g",
    ],
  },
};

// селектор ячейки с учётом «двух VIII4»
function cellForKey(p, key) {
  if (key === "VIII4_d1" || key === "VIII4_d2") {
    // берём оба d-элемента VIII4 этого периода (col4) в порядке Z
    const dList = elements
      .filter((e) => e.period === p && e.group === "VIII4" && e.cls === "col4")
      .sort((a, b) => a.z - b.z);
    return key === "VIII4_d1" ? dList[0] || null : dList[1] || null;
  }
  if (key === "VIII4_g") {
    // благородный газ (правый конец ряда)
    return (
      elements.find(
        (e) => e.period === p && e.group === "VIII4" && e.cls === "col2"
      ) || null
    );
  }
  return elements.find((e) => e.period === p && e.group === key) || null;
}

function cellFor(p, key) {
  const el = byPos(p, key);
  if (!el) return null;
  return el;
}

function ordsForPeriod(p) {
  // «ступеньки» как на твоём референсе
  const map = {
    1: [1],
    2: [2],
    3: [3],
    4: [5, 6],
    5: [7, 8],
    6: [9],
    7: [10],
  };
  return map[p] || [];
}
</script>

<template>
  <FloatingPanel
    v-if="open"
    title="Таблица Менделеева"
    :x="startX"
    :y="startY"
    :width="panelW"
    :height="panelH"
    persist-key="mendeleev"
    @close="emit('close')"
  >
    <div class="mendel">
      <div class="border-m">
        <table class="main" border="2">
          <thead>
            <tr>
              <th rowspan="2" class="th-wide"><h3>Периоды</h3></th>
              <th rowspan="2" class="th-narrow"><h3>№</h3></th>
              <th colspan="11"><h3>Группы элементов</h3></th>
            </tr>
            <tr>
              <th>I</th>
              <th>II</th>
              <th>III</th>
              <th>IV</th>
              <th>V</th>
              <th>VI</th>
              <th>VII</th>
              <th colspan="4">VIII</th>
            </tr>
          </thead>

          <tbody>
            <tr>
              <td class="th1">
                <h1><b>1</b></h1>
              </td>
              <td class="th1">
                <h1><b>1</b></h1>
              </td>
              <td class="col1 zoom5">
                <div class="chemical">
                  <span class="number"
                    ><input class="number" type="button" :value="1"
                  /></span>
                  <span class="symbol">H</span>
                  <p class="mass">1,0079</p>
                  <b class="name">Водород</b>
                </div>
              </td>
              <td colspan="5"></td>
              <td class="col1 zoom5">
                <div>
                  <span class="symbol"><h1>&nbsp;(H)</h1></span>
                </div>
              </td>
              <td colspan="3"></td>
              <td class="col1 zoom5">
                <div class="chemical">
                  <span class="number"
                    ><input class="number" type="button" :value="2"
                  /></span>
                  <span class="symbol">He</span>
                  <p class="mass">4,00260</p>
                  <b class="name">Гелий</b>
                </div>
              </td>
            </tr>

            <!-- P2 -->
            <tr>
              <td class="th1">
                <h1><b>2</b></h1>
              </td>
              <td class="th1">
                <h1><b>2</b></h1>
              </td>
              <template v-for="g in headerGroupsBottom" :key="'2-' + g">
                <td
                  v-if="g !== 'VIII2' && g !== 'VIII3'"
                  :class="[cellFor(2, g)?.cls, 'zoom5']"
                >
                  <div v-if="cellFor(2, g)" class="chemical">
                    <span class="number"
                      ><input
                        class="number"
                        type="button"
                        :value="cellFor(2, g)?.z || ''"
                    /></span>
                    <span class="symbol">{{ cellFor(2, g)?.s }}</span>
                    <p class="mass">{{ cellFor(2, g)?.mass }}</p>
                    <b class="name">{{ cellFor(2, g)?.name }}</b>
                  </div>
                </td>
                <td v-else></td>
              </template>
            </tr>

            <!-- P3 -->
            <tr>
              <td class="th1">
                <h1><b>3</b></h1>
              </td>
              <td class="th1">
                <h1><b>3</b></h1>
              </td>
              <template v-for="g in headerGroupsBottom" :key="'3-' + g">
                <td
                  v-if="g !== 'VIII2' && g !== 'VIII3'"
                  :class="[cellFor(3, g)?.cls, 'zoom5']"
                >
                  <div v-if="cellFor(3, g)" class="chemical">
                    <span class="number"
                      ><input
                        class="number"
                        type="button"
                        :value="cellFor(3, g)?.z || ''"
                    /></span>
                    <span class="symbol">{{ cellFor(3, g)?.s }}</span>
                    <p class="mass">{{ cellFor(3, g)?.mass }}</p>
                    <b class="name">{{ cellFor(3, g)?.name }}</b>
                  </div>
                </td>
                <td v-else></td>
              </template>
            </tr>

            <!-- P4 → ряды 5,6 -->
            <tr>
              <td class="th1" rowspan="2">
                <h1><b>4</b></h1>
              </td>
              <td class="th1">
                <h1><b>4</b></h1>
              </td>
              <template v-for="g in rowGroups[4].top" :key="'4-top-' + g">
                <td :class="[cellForKey(4, g)?.cls, 'zoom5']">
                  <div v-if="cellForKey(4, g)" class="chemical">
                    <span class="number"
                      ><input
                        class="number"
                        type="button"
                        :value="cellForKey(4, g).z"
                    /></span>
                    <span class="symbol">{{ cellForKey(4, g).s }}</span>
                    <p class="mass">{{ cellForKey(4, g).mass }}</p>
                    <b class="name">{{ cellForKey(4, g).name }}</b>
                  </div>
                </td>
              </template>
            </tr>
            <tr>
              <td class="th1">
                <h1><b>5</b></h1>
              </td>
              <template v-for="g in rowGroups[4].bottom" :key="'4-bot-' + g">
                <td :class="[cellForKey(4, g)?.cls, 'zoom5']">
                  <div v-if="cellForKey(4, g)" class="chemical">
                    <span class="number"
                      ><input
                        class="number"
                        type="button"
                        :value="cellForKey(4, g).z"
                    /></span>
                    <span class="symbol">{{ cellForKey(4, g).s }}</span>
                    <p class="mass">{{ cellForKey(4, g).mass }}</p>
                    <b class="name">{{ cellForKey(4, g).name }}</b>
                  </div>
                </td>
              </template>
            </tr>

            <!-- P5 → ряды 7,8 -->
            <tr>
              <td class="th1" rowspan="2">
                <h1><b>5</b></h1>
              </td>
              <td class="th1">
                <h1><b>6</b></h1>
              </td>
              <template v-for="g in rowGroups[5].top" :key="'5-top-' + g">
                <td :class="[cellForKey(5, g)?.cls, 'zoom5']">
                  <div v-if="cellForKey(5, g)" class="chemical">
                    <span class="number"
                      ><input
                        class="number"
                        type="button"
                        :value="cellForKey(5, g).z"
                    /></span>
                    <span class="symbol">{{ cellForKey(5, g).s }}</span>
                    <p class="mass">{{ cellForKey(5, g).mass }}</p>
                    <b class="name">{{ cellForKey(5, g).name }}</b>
                  </div>
                </td>
              </template>
            </tr>
            <tr>
              <td class="th1">
                <h1><b>7</b></h1>
              </td>
              <template v-for="g in rowGroups[5].bottom" :key="'5-bot-' + g">
                <td :class="[cellForKey(5, g)?.cls, 'zoom5']">
                  <div v-if="cellForKey(5, g)" class="chemical">
                    <span class="number"
                      ><input
                        class="number"
                        type="button"
                        :value="cellForKey(5, g).z"
                    /></span>
                    <span class="symbol">{{ cellForKey(5, g).s }}</span>
                    <p class="mass">{{ cellForKey(5, g).mass }}</p>
                    <b class="name">{{ cellForKey(5, g).name }}</b>
                  </div>
                </td>
              </template>
            </tr>

            <!-- P6 → ряды 8,9 (как ты просил) -->
            <tr>
              <td class="th1" rowspan="2">
                <h1><b>6</b></h1>
              </td>
              <td class="th1">
                <h1><b>8</b></h1>
              </td>
              <template v-for="g in rowGroups[6].top" :key="'6-top-' + g">
                <td :class="[cellForKey(6, g)?.cls, 'zoom6']">
                  <div v-if="cellForKey(6, g)" class="chemical">
                    <span class="number"
                      ><input
                        class="number"
                        type="button"
                        :value="cellForKey(6, g).z"
                    /></span>
                    <span class="symbol">{{ cellForKey(6, g).s }}</span>
                    <p class="mass">{{ cellForKey(6, g).mass }}</p>
                    <b class="name">{{ cellForKey(6, g).name }}</b>
                  </div>
                </td>
              </template>
            </tr>
            <tr>
              <td class="th1">
                <h1><b>9</b></h1>
              </td>
              <template v-for="g in rowGroups[6].bottom" :key="'6-bot-' + g">
                <td :class="[cellForKey(6, g)?.cls, 'zoom6']">
                  <div v-if="cellForKey(6, g)" class="chemical">
                    <span class="number"
                      ><input
                        class="number"
                        type="button"
                        :value="cellForKey(6, g).z"
                    /></span>
                    <span class="symbol">{{ cellForKey(6, g).s }}</span>
                    <p class="mass">{{ cellForKey(6, g).mass }}</p>
                    <b class="name">{{ cellForKey(6, g).name }}</b>
                  </div>
                </td>
              </template>
            </tr>

            <!-- P7 → ряд 10 -->
            <tr>
              <td class="th1">
                <h1><b>7</b></h1>
              </td>
              <td class="th1">
                <h1><b>10</b></h1>
              </td>
              <template v-for="g in headerGroupsBottom" :key="'7-' + g">
                <td :class="[cellFor(7, g)?.cls, 'zoom7']">
                  <div v-if="cellFor(7, g)" class="chemical">
                    <span class="number"
                      ><input
                        class="number"
                        type="button"
                        :value="cellFor(7, g)?.z || ''"
                    /></span>
                    <span class="symbol">{{ cellFor(7, g)?.s }}</span>
                    <p class="mass">{{ cellFor(7, g)?.mass }}</p>
                    <b class="name">{{ cellFor(7, g)?.name }}</b>
                  </div>
                </td>
              </template>
            </tr>

            <!-- мета-ряды -->
            <tr>
              <td class="th2" colspan="2"><h4>Высшие оксиды</h4></td>
              <td class="zoom6">
                <div class="chemical">
                  <span class="symbol2">R<sub class="sub">2</sub>O</span>
                </div>
              </td>
              <td class="zoom6">
                <div class="chemical">
                  <span class="symbol2">RO<sub class="sub">&nbsp;</sub></span>
                </div>
              </td>
              <td class="zoom6">
                <div class="chemical">
                  <span class="symbol2"
                    >R<sub class="sub">2</sub>O<sub class="sub">3</sub></span
                  >
                </div>
              </td>
              <td class="zoom6">
                <div class="chemical">
                  <span class="symbol2">RO<sub class="sub">2</sub></span>
                </div>
              </td>
              <td class="zoom6">
                <div class="chemical">
                  <span class="symbol2"
                    >R<sub class="sub">2</sub>O<sub class="sub">5</sub></span
                  >
                </div>
              </td>
              <td class="zoom6">
                <div class="chemical">
                  <span class="symbol2">RO<sub class="sub">3</sub></span>
                </div>
              </td>
              <td class="zoom6">
                <div class="chemical">
                  <span class="symbol2"
                    >R<sub class="sub">2</sub>O<sub class="sub">7</sub></span
                  >
                </div>
              </td>
              <td class="th2" colspan="4" rowspan="2">
                <div>
                  <span class="symbol2"
                    ><h1>
                      <b>RO<sub class="sub">4</sub></b>
                    </h1></span
                  >
                </div>
              </td>
            </tr>
            <tr>
              <td class="th2" colspan="2">
                <b class="name">Летучие водородные соединения</b>
              </td>
              <td colspan="3"></td>
              <td class="zoom6">
                <div class="chemical">
                  <span class="symbol2">RH<sub class="sub">4</sub></span>
                </div>
              </td>
              <td class="zoom6">
                <div class="chemical">
                  <span class="symbol2">RH<sub class="sub">3</sub></span>
                </div>
              </td>
              <td class="zoom6">
                <div class="chemical">
                  <span class="symbol2">RH<sub class="sub">2</sub></span>
                </div>
              </td>
              <td class="zoom6">
                <div class="chemical">
                  <span class="symbol2">RH<sub class="sub">&nbsp;</sub></span>
                </div>
              </td>
            </tr>
          </tbody>
        </table>

        <!-- Лантаноиды и актиноиды -->
        <table border="2" class="second-table">
          <thead>
            <tr>
              <th colspan="14">
                <b class="chemical name">Лантаноиды* 57–71</b>
              </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td
                v-for="x in lanth"
                :key="'La' + x.z"
                :class="[x.cls, 'zoom5']"
              >
                <div class="chemical3">
                  <span class="number"
                    ><input class="number" type="button" :value="x.z"
                  /></span>
                  <span class="symbol">{{ x.s }}</span>
                  <p class="mass">{{ x.mass }}</p>
                  <b class="name">{{ x.name }}</b>
                </div>
              </td>
            </tr>
            <tr>
              <th colspan="14"><h3>Актиноиды** 89–103</h3></th>
            </tr>
            <tr>
              <td
                v-for="x in actin"
                :key="'Ac' + x.z"
                :class="[x.cls, 'zoom5']"
              >
                <div class="chemical3">
                  <span class="number"
                    ><input class="number" type="button" :value="x.z"
                  /></span>
                  <span class="symbol">{{ x.s }}</span>
                  <p class="mass">{{ x.mass }}</p>
                  <b class="name">{{ x.name }}</b>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="legend">
        <div><span class="chip col1"></span> щёлочные/щелочноземельные</div>
        <div><span class="chip col4"></span> переходные металлы (d-блок)</div>
        <div>
          <span class="chip col2"></span> p-блок (неметаллы/полуметаллы/газы)
        </div>
        <div><span class="chip col5"></span> f-блок (лантаноиды/актиноиды)</div>
      </div>
    </div>
  </FloatingPanel>
</template>

<style scoped>
.mendel {
  height: 100%;
  max-height: 700px;
  padding: 8px;
  overflow: auto;
  display: flex;
  flex-direction: column;
}

.border-m {
  min-width: 1120px;
  flex: 1 1 auto;
  overflow: auto;
}

/* таблицы */
table {
  width: 100%;
  border-collapse: collapse;
  background: var(--bg);
  color: var(--text);

  table-layout: fixed;
}

th,
td {
  padding: 4px;
  text-align: center;
  vertical-align: middle;
}
thead th {
  background: var(--bg-elev);
  position: sticky;
  top: 0;
  z-index: 1;
}

/* шапки слева */
.th1,
.th2 {
  background: var(--bg-elev);
}
.th1 h1,
.th2 h4 {
  margin: 0;
}
.th-wide {
  width: 84px;
}
.th-narrow {
  width: 36px;
}

/* клетка элемента */
.chemical,
.chemical3 {
  position: relative;
  padding: 5px 4px;
  min-height: 66px;
}
.symbol {
  display: block;
  font-size: 20px;
  font-weight: 700;
  line-height: 1;
}
.mass {
  margin: 0;
  font-size: 11px;
  color: var(--muted);
}
.name {
  font-size: 11px;
  font-weight: 600;
}
.number input.number {
  width: 28px;
  height: 22px;
  border-radius: 6px;
  border: 1px solid var(--border);
  background: var(--card);
  color: var(--text);
  cursor: default;
}

/* визуальные колонковые классы (цвета как на скрине) */
.col1 {
  background: color-mix(in oklab, var(--accent-color) 10%, var(--card));
}
.col2 {
  background: color-mix(in oklab, plum 18%, var(--card));
}
.col4 {
  background: color-mix(in oklab, lightseagreen 22%, var(--card));
}
.col5 {
  background: color-mix(in oklab, goldenrod 36%, var(--card));
}

td.col1,
td.col2,
td.col4,
td.col5 {
  border-color: var(--border);
}

/* зум/ховер */
.zoom5,
.zoom6 {
  transition: transform 0.12s var(--easing, ease), box-shadow 0.12s;
}
.zoom5:hover,
.zoom6:hover {
  transform: scale(1.04);
  box-shadow: 0 0 0 2px
    color-mix(in oklab, var(--accent-color) 40%, transparent) inset;
}

/* нижние формулы */
.symbol2 {
  font-size: 18px;
  font-weight: 700;
}
.sub {
  font-size: 12px;
}

/* лего-легенда */
.legend {
  display: flex;
  gap: 12px;
  align-items: center;
  margin-top: 8px;
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
.chip.col1 {
  background: color-mix(in oklab, var(--accent-color) 10%, var(--card));
}
.chip.col2 {
  background: color-mix(in oklab, plum 18%, var(--card));
}
.chip.col4 {
  background: color-mix(in oklab, lightseagreen 22%, var(--card));
}
.chip.col5 {
  background: color-mix(in oklab, goldenrod 36%, var(--card));
}

/* вторая таблица (ленты) */
.second-table thead th {
  position: static;
  background: var(--bg-elev);
}
.second-table td {
  min-width: 56px;
}

.main td:not(.th1):not(.th2) {
  min-width: 68px; /* можно 70–72, если нравятся более широкие */
}
</style>

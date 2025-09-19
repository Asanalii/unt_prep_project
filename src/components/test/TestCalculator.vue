<script setup>
import { onBeforeUnmount, onMounted, ref } from "vue";

import FloatingPanel from "@/components/overlays/FloatingPanel.vue";

/**
 * Панель-калькулятор. НЕТ оверлея, висит в правом-нижнем углу.
 * Закрывается только кнопкой [×].
 */
defineProps({
  open: { type: Boolean, default: false },
});
const emit = defineEmits(["close"]);

// ===== Логика обычного калькулятора =====
const display = ref("0");
let acc = null; // аккумулятор (число)
let op = null; // текущий оператор: '+', '-', '×', '÷'
let overwrite = true; // следующий ввод перезапишет дисплей
const pendingOp = ref(null); // для UI-подсветки и предпросмотра

function toNum(s) {
  // аккуратный парсинг
  const n = Number(s.replace(",", "."));
  return Number.isFinite(n) ? n : 0;
}
function setDisplay(n) {
  // красивый вывод (без лишних нулей)
  const s = String(n);
  display.value = /\./.test(s)
    ? (+n.toFixed(12)).toString().replace(/\.?0+$/, "")
    : s;
}

function fmt(n) {
  // компактный вывод чисел в мини-строке
  const s = String(n);
  return /\./.test(s) ? (+(+n).toFixed(6)).toString().replace(/\.?0+$/, "") : s;
}

function inputDigit(d) {
  if (overwrite || display.value === "0") {
    display.value = d;
  } else {
    display.value += d;
  }
  overwrite = false;

  // как только начали набирать новое число — подсветка операции остаётся,
  // но мини-строка уже не меняется до '=' (это ожидаемо).
}

function inputDot() {
  // начинаем дробную часть
  if (overwrite) {
    display.value = "0.";
    overwrite = false;
    return;
  }
  if (!display.value.includes(".")) {
    display.value += ".";
  }
}

function dot() {
  if (overwrite) {
    display.value = "0.";
    overwrite = false;
    return;
  }
  if (!display.value.includes(".")) display.value += ".";
}

function neg() {
  if (display.value === "0") return;
  display.value = display.value.startsWith("-")
    ? display.value.slice(1)
    : "-" + display.value;
}

function backspace() {
  if (overwrite) return;
  if (
    display.value.length <= 1 ||
    (display.value.length === 2 && display.value.startsWith("-"))
  ) {
    display.value = "0";
    overwrite = true;
  } else {
    display.value = display.value.slice(0, -1);
  }
}

function clearEntry() {
  display.value = "0";
  overwrite = true;
}

function clearAll() {
  display.value = "0";
  overwrite = true;
  acc = null;
  op = null;
  pendingOp.value = null;
}

function unary(fn) {
  const v = toNum(display.value);
  const r = fn(v);
  setDisplay(r);
  overwrite = true;
}

function applyOp() {
  const v = toNum(display.value);
  if (acc === null) {
    acc = v;
  } else if (op) {
    if (op === "+") acc = acc + v;
    if (op === "-") acc = acc - v;
    if (op === "×") acc = acc * v;
    if (op === "÷") acc = v === 0 ? NaN : acc / v;
  }
  setDisplay(acc);
  overwrite = true;
}

function binary(nextOp) {
  // Нажатие оператора: если набирали число — «подтверждаем» его в аккумулятор
  if (!overwrite) applyOp();
  // Разрешаем просто менять оператор подряд (без ввода числа)
  op = nextOp;
  pendingOp.value = nextOp; // <-- визуальная подсветка и предпросмотр
  overwrite = true; // следующее число перезапишет экран
}

function eq() {
  if (op === null) return;
  applyOp();
  op = null;
  pendingOp.value = null;
}

function percent() {
  // проценты от аккумулятора, как в обычных калькуляторах
  const v = toNum(display.value);
  const base = acc ?? 0;
  const r = base * (v / 100);
  setDisplay(r);
  overwrite = true;
}

// ===== Рендер сетки кнопок =====
const rows = [
  // label, handler, className?
  [
    { t: "%", a: percent },
    { t: "CE", a: clearEntry },
    { t: "C", a: clearAll },
    { t: "⌫", a: backspace },
  ],
  [
    { t: "1/x", a: () => unary((x) => (x === 0 ? NaN : 1 / x)) },
    { t: "x²", a: () => unary((x) => x * x) },
    { t: "√x", a: () => unary((x) => (x < 0 ? NaN : Math.sqrt(x))) },
    { t: "÷", a: () => binary("÷"), k: "op", sym: "÷" },
  ],

  [
    { t: "7", a: () => inputDigit("7") },
    { t: "8", a: () => inputDigit("8") },
    { t: "9", a: () => inputDigit("9") },
    { t: "×", a: () => binary("×"), k: "op", sym: "×" },
  ],
  [
    { t: "4", a: () => inputDigit("4") },
    { t: "5", a: () => inputDigit("5") },
    { t: "6", a: () => inputDigit("6") },
    { t: "−", a: () => binary("-"), k: "op", sym: "-" },
  ],
  [
    { t: "1", a: () => inputDigit("1") },
    { t: "2", a: () => inputDigit("2") },
    { t: "3", a: () => inputDigit("3") },
    { t: "+", a: () => binary("+"), k: "op", sym: "+" },
  ],
  [
    { t: "+/−", a: neg },
    { t: "0", a: () => inputDigit("0") },
    { t: ",", a: dot },
    { t: "=", a: eq, k: "eq" },
  ],
];

function onKeyDown(e) {
  // не мешаем набору в инпутах/textarea
  const tag = (e.target?.tagName || "").toLowerCase();
  if (tag === "input" || tag === "textarea" || e.isComposing) return;

  const k = e.key;

  // цифры 0..9 (включая numpad)
  if (/^[0-9]$/.test(k)) {
    inputDigit(k);
    e.preventDefault();
    return;
  }

  // десятичная точка
  if (k === "." || k === ",") {
    inputDot();
    e.preventDefault();
    return;
  }

  // операции
  if (k === "+" || (k === "=" && e.shiftKey)) {
    // Shift+= on en layout
    binary("+");
    e.preventDefault();
    return;
  }
  if (k === "-") {
    binary("-");
    e.preventDefault();
    return;
  }
  if (k === "*" || k.toLowerCase() === "x") {
    binary("×");
    e.preventDefault();
    return;
  }
  if (k === "/") {
    binary("÷");
    e.preventDefault();
    return;
  }

  // Enter / =
  if (k === "Enter" || k === "=") {
    eq();
    e.preventDefault();
    return;
  }

  // Backspace — удалить символ
  if (k === "Backspace") {
    backspace();
    e.preventDefault();
    return;
  }

  // Escape / C — сброс
  if (k === "Escape" || k.toLowerCase() === "c") {
    clearAll();
    e.preventDefault();
    return;
  }
}

// стартовая позиция: безопасно вычислим после mount
const startX = ref(32);
const startY = ref(32);
onMounted(() => {
  // если уже сохранена позиция самим FloatingPanel (persistKey),
  // он её подхватит. Эти координаты — только первый старт.
  if (typeof window !== "undefined") {
    startX.value = Math.max(8, window.innerWidth - 320);
    startY.value = Math.max(8, window.innerHeight - 380);
  }

  window.addEventListener("keydown", onKeyDown, { passive: false });
});

onBeforeUnmount(() => {
  window.removeEventListener("keydown", onKeyDown);
});
</script>

<template>
  <FloatingPanel
    v-if="open"
    title="Калькулятор"
    :x="startX"
    :y="startY"
    :width="300"
    persist-key="calculator"
    @close="() => emit('close')"
  >
    <div class="calc">
      <div class="expr" v-if="pendingOp || acc !== null" aria-live="polite">
        {{ fmt(acc === null ? toNum(display) : acc) }} {{ pendingOp || "" }}
      </div>
      <div class="screen" aria-live="polite" tabindex="0">{{ display }}</div>

      <div class="grid">
        <template v-for="(row, r) in rows" :key="r">
          <button
            v-for="(btn, i) in row"
            :key="i"
            class="key"
            :class="[
              btn.k,
              { active: btn.k === 'op' && pendingOp === btn.sym },
            ]"
            @click="btn.a()"
          >
            {{ btn.t }}
          </button>
        </template>
      </div>
    </div>
  </FloatingPanel>
</template>

<style scoped>
/* только внутренности */
.screen {
  padding: 10px;
  text-align: right;
  font-size: 22px;
  border-bottom: 1px solid var(--border);
  font-variant-numeric: tabular-nums;
  min-height: 40px;
}
.expr {
  padding: 8px 10px 2px;
  text-align: right;
  color: var(--muted);
  font-size: 12px;
  font-variant-numeric: tabular-nums;
}
.grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 6px;
  padding: 8px;
}
.key {
  height: 38px;
  border-radius: 8px;
  border: 1px solid var(--border);
  background: var(--card);
  color: var(--text);
  cursor: pointer;
  transition: 0.12s;
}
.key:hover {
  background: color-mix(in oklab, var(--card) 85%, transparent);
}
.key.op {
  background: color-mix(in oklab, var(--accent-color) 14%, var(--card));
  border-color: var(--accent-color);
}
.key.op.active {
  box-shadow: inset 0 0 0 2px var(--accent-color);
}
.key.eq {
  background: var(--accent-color);
  color: #fff;
  border-color: var(--accent-color);
}
</style>

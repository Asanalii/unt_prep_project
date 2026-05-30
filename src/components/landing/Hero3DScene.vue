<!-- src/components/landing/Hero3DScene.vue -->
<template>
  <div class="scene-wrap" aria-hidden="true">
    <div class="glow glow--one"></div>
    <div class="glow glow--two"></div>

    <div class="scene">
      <div class="orbit orbit--one">
        <span></span>
      </div>

      <div class="orbit orbit--two">
        <span></span>
      </div>

      <div class="cube">
        <div class="cube__face cube__face--front">AI</div>
        <div class="cube__face cube__face--back">UNT</div>
        <div class="cube__face cube__face--right">ML</div>
        <div class="cube__face cube__face--left">40</div>
        <div class="cube__face cube__face--top">✓</div>
        <div class="cube__face cube__face--bottom">70</div>
      </div>

      <div class="floating-card floating-card--main">
        <div class="card-top">
          <span class="dot"></span>
          <span>Adaptive Result</span>
        </div>

        <div class="score-row">
          <strong>14 / 40</strong>
          <span>+ weak topics found</span>
        </div>

        <div class="progress-block">
          <div class="progress-label">
            <span>Algebra</span>
            <b>44%</b>
          </div>
          <div class="progress">
            <span style="width: 44%"></span>
          </div>
        </div>

        <div class="progress-block">
          <div class="progress-label">
            <span>Trigonometry</span>
            <b>33%</b>
          </div>
          <div class="progress">
            <span style="width: 33%"></span>
          </div>
        </div>

        <div class="chip-row">
          <span>easy</span>
          <span>medium</span>
          <span>hard</span>
        </div>
      </div>

      <div class="mini-card mini-card--left">
        <span>🔥</span>
        <strong>Daily streak</strong>
        <small>5 days</small>
      </div>

      <div class="mini-card mini-card--right">
        <span>🧠</span>
        <strong>AI tip</strong>
        <small>Repeat inequalities</small>
      </div>

      <div class="mini-card mini-card--bottom">
        <span>⚡</span>
        <strong>Next test</strong>
        <small>Mathematics</small>
      </div>
    </div>
  </div>
</template>

<style scoped>
.scene-wrap {
  position: relative;
  min-height: 560px;
  display: flex;
  align-items: center;
  justify-content: center;
  perspective: 1100px;
}

.glow {
  position: absolute;
  width: 260px;
  height: 260px;
  border-radius: 999px;
  filter: blur(60px);
  opacity: 0.45;
}

.glow--one {
  top: 70px;
  left: 30px;
  background: var(--color-primary);
}

.glow--two {
  right: 20px;
  bottom: 60px;
  background: var(--success);
}

.scene {
  position: relative;
  width: 460px;
  height: 460px;
  transform-style: preserve-3d;
  animation: sceneFloat 7s var(--easing) infinite;
}

.floating-card {
  position: absolute;
  inset: 90px 36px auto;
  padding: 22px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 26px;
  background:
    linear-gradient(
      180deg,
      rgba(255, 255, 255, 0.08),
      rgba(255, 255, 255, 0.03)
    ),
    rgba(19, 23, 42, 0.86);
  box-shadow:
    0 28px 80px rgba(0, 0, 0, 0.38),
    inset 0 1px 0 rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(18px);
  transform: rotateY(-14deg) rotateX(10deg) translateZ(80px);
}

.card-top {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--muted);
  font-size: var(--fz-12);
}

.dot {
  width: 9px;
  height: 9px;
  border-radius: 50%;
  background: var(--success);
  box-shadow: 0 0 18px var(--success);
}

.score-row {
  margin-top: 18px;
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 16px;
}

.score-row strong {
  font-size: 38px;
  letter-spacing: -0.06em;
}

.score-row span {
  color: var(--muted);
  font-size: var(--fz-12);
}

.progress-block {
  margin-top: 18px;
}

.progress-label {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  color: var(--muted);
  font-size: var(--fz-12);
}

.progress-label b {
  color: var(--text);
}

.progress {
  height: 8px;
  overflow: hidden;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.08);
}

.progress span {
  display: block;
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(90deg, var(--color-primary), var(--success));
}

.chip-row {
  display: flex;
  gap: 8px;
  margin-top: 18px;
}

.chip-row span {
  padding: 7px 10px;
  border-radius: 999px;
  color: var(--muted);
  font-size: 11px;
  background: rgba(255, 255, 255, 0.06);
}

.cube {
  position: absolute;
  top: 22px;
  right: 56px;
  width: 96px;
  height: 96px;
  transform-style: preserve-3d;
  animation: cubeSpin 9s linear infinite;
}

.cube__face {
  position: absolute;
  width: 96px;
  height: 96px;
  display: grid;
  place-items: center;
  border: 1px solid rgba(255, 255, 255, 0.14);
  border-radius: 18px;
  background: rgba(107, 123, 255, 0.22);
  color: #fff;
  font-weight: 800;
  backdrop-filter: blur(12px);
}

.cube__face--front {
  transform: translateZ(48px);
}

.cube__face--back {
  transform: rotateY(180deg) translateZ(48px);
}

.cube__face--right {
  transform: rotateY(90deg) translateZ(48px);
}

.cube__face--left {
  transform: rotateY(-90deg) translateZ(48px);
}

.cube__face--top {
  transform: rotateX(90deg) translateZ(48px);
}

.cube__face--bottom {
  transform: rotateX(-90deg) translateZ(48px);
}

.orbit {
  position: absolute;
  inset: 42px;
  border: 1px dashed rgba(255, 255, 255, 0.14);
  border-radius: 50%;
  transform-style: preserve-3d;
}

.orbit span {
  position: absolute;
  top: 50%;
  left: -5px;
  width: 11px;
  height: 11px;
  border-radius: 50%;
  background: var(--color-primary);
  box-shadow: 0 0 22px var(--color-primary);
}

.orbit--one {
  animation: orbitRotate 12s linear infinite;
}

.orbit--two {
  inset: 86px;
  transform: rotateX(68deg);
  animation: orbitRotate 8s linear infinite reverse;
}

.orbit--two span {
  background: var(--success);
  box-shadow: 0 0 22px var(--success);
}

.mini-card {
  position: absolute;
  width: 156px;
  padding: 14px;
  display: grid;
  gap: 5px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  background: rgba(19, 23, 42, 0.72);
  backdrop-filter: blur(14px);
  box-shadow: 0 18px 42px rgba(0, 0, 0, 0.24);
  transform-style: preserve-3d;
}

.mini-card span {
  font-size: 22px;
}

.mini-card strong {
  font-size: 13px;
}

.mini-card small {
  color: var(--muted);
}

.mini-card--left {
  left: 2px;
  top: 178px;
  transform: rotateY(18deg) translateZ(120px);
  animation: miniFloat 5s ease-in-out infinite;
}

.mini-card--right {
  right: -10px;
  top: 230px;
  transform: rotateY(-18deg) translateZ(120px);
  animation: miniFloat 5.6s ease-in-out infinite;
}

.mini-card--bottom {
  left: 155px;
  bottom: 14px;
  transform: rotateX(16deg) translateZ(110px);
  animation: miniFloat 6.2s ease-in-out infinite;
}

@keyframes sceneFloat {
  0%,
  100% {
    transform: translateY(0) rotateX(0deg) rotateY(0deg);
  }

  50% {
    transform: translateY(-14px) rotateX(2deg) rotateY(-2deg);
  }
}

@keyframes cubeSpin {
  from {
    transform: rotateX(-18deg) rotateY(0deg);
  }

  to {
    transform: rotateX(-18deg) rotateY(360deg);
  }
}

@keyframes orbitRotate {
  to {
    transform: rotateZ(360deg) rotateX(68deg);
  }
}

@keyframes miniFloat {
  0%,
  100% {
    margin-top: 0;
  }

  50% {
    margin-top: -12px;
  }
}

@media (max-width: 980px) {
  .scene-wrap {
    min-height: 500px;
  }
}

@media (max-width: 560px) {
  .scene-wrap {
    min-height: 420px;
    transform: scale(0.82);
    transform-origin: center;
  }
}
</style>

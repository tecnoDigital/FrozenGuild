import React, { useEffect, useMemo, useRef, useState } from "react";

const FISH_ACTION = {
  label: "PESCA",
  description: "Toma una carta del hielo",
  tone: "fish",
};

const DICE_VALUES = [1, 2, 3, 4, 5, 6];

function getRandomDiceResult() {
  return Math.floor(Math.random() * 6) + 1;
}

function normalizeDiceResult(value, fallback = 1) {
  const number = Number(value);
  return Number.isInteger(number) && number >= 1 && number <= 6 ? number : fallback;
}

function getFaceValues(result) {
  const front = normalizeDiceResult(result, 1);
  const remaining = DICE_VALUES.filter((value) => value !== front);

  return {
    front,
    back: remaining[0],
    right: remaining[1],
    left: remaining[2],
    top: remaining[3],
    bottom: remaining[4],
  };
}

function Pip({ className = "" }) {
  return <span className={`pip ${className}`} />;
}

function DiceFace({ value }) {
  const pips = {
    1: <Pip className="center" />,
    2: (
      <>
        <Pip className="top-left" />
        <Pip className="bottom-right" />
      </>
    ),
    3: (
      <>
        <Pip className="top-left" />
        <Pip className="center" />
        <Pip className="bottom-right" />
      </>
    ),
    4: (
      <>
        <Pip className="top-left" />
        <Pip className="top-right" />
        <Pip className="bottom-left" />
        <Pip className="bottom-right" />
      </>
    ),
    5: (
      <>
        <Pip className="top-left" />
        <Pip className="top-right" />
        <Pip className="center" />
        <Pip className="bottom-left" />
        <Pip className="bottom-right" />
      </>
    ),
    6: (
      <>
        <Pip className="top-left" />
        <Pip className="top-right" />
        <Pip className="mid-left" />
        <Pip className="mid-right" />
        <Pip className="bottom-left" />
        <Pip className="bottom-right" />
      </>
    ),
  };

  return <>{pips[normalizeDiceResult(value)]}</>;
}

function FishGlyph() {
  return (
    <svg className="actionGlyph" viewBox="0 0 120 90" aria-hidden="true">
      <path d="M14 45C31 20 72 17 96 45C72 73 31 70 14 45Z" />
      <path d="M91 45L114 25L108 45L114 65Z" />
      <circle cx="37" cy="39" r="4.2" />
      <path d="M58 28C53 37 53 52 58 62" />
    </svg>
  );
}

function FinalDie({ state, result, compact = false }) {
  const isRolling = state === "rolling";
  const isImpact = state === "impact";
  const hasLanded = state === "impact" || state === "revealed";
  const faceValues = useMemo(() => getFaceValues(result), [result]);

  return (
    <div
      className={[
        "finalDieStage",
        compact ? "compact" : "",
        isRolling ? "isRolling" : "",
        isImpact ? "isImpact" : "",
        hasLanded ? "hasLanded" : "",
      ].join(" ")}
      aria-hidden="true"
    >
      <span className="motionGhost ghostA" />
      <span className="motionGhost ghostB" />
      <span className="energyOrbit orbitA" />
      <span className="energyOrbit orbitB" />
      <span className="energyRing" />

      <span className="cube">
        {/* La cara frontal recibe el resultado confirmado. La acción sigue siendo PESCA para cualquier número. */}
        <span className="face front"><DiceFace value={faceValues.front} /></span>
        <span className="face back"><DiceFace value={faceValues.back} /></span>
        <span className="face right"><DiceFace value={faceValues.right} /></span>
        <span className="face left"><DiceFace value={faceValues.left} /></span>
        <span className="face top"><DiceFace value={faceValues.top} /></span>
        <span className="face bottom"><DiceFace value={faceValues.bottom} /></span>
      </span>

      <span className="pedestalTop" />
      <span className="pedestal" />
    </div>
  );
}

export default function FinalDiceDecisionConsole({ confirmedResult = null }) {
  const [result, setResult] = useState(3);
  const [state, setState] = useState("idle");
  const [nonce, setNonce] = useState(0);
  const timers = useRef([]);

  const clearTimers = () => {
    timers.current.forEach(window.clearTimeout);
    timers.current = [];
  };

  useEffect(() => clearTimers, []);

  const rollDice = () => {
    if (state === "rolling" || state === "impact") return;

    clearTimers();

    // Demo: si no viene resultado del backend, genera 1-6.
    // Producción: pásale confirmedResult desde boardgame.io / backend.
    const nextResult = confirmedResult
      ? normalizeDiceResult(confirmedResult, result)
      : getRandomDiceResult();

    setResult(nextResult);
    setNonce((value) => value + 1);
    setState("rolling");

    timers.current.push(
      window.setTimeout(() => setState("impact"), 1280),
      window.setTimeout(() => setState("revealed"), 1640)
    );
  };

  const resetConsole = () => {
    if (state === "rolling" || state === "impact") return;
    clearTimers();
    setState("idle");
  };

  const isImpact = state === "impact";
  const isRevealed = state === "revealed";
  const isActionActive = isImpact || isRevealed;

  return (
    <main className="previewShell">
      <style>{styles}</style>

      <section
        className={`decisionConsole ${state} tone-${isActionActive ? FISH_ACTION.tone : "idle"}`}
        onClick={rollDice}
        role="button"
        tabIndex={0}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") rollDice();
        }}
        aria-label="Lanzar dado de decisión"
      >
        <div className="consoleGlow" />
        <div className="consoleVignette" />
        <div className={`impactBurst ${isImpact ? "active" : ""}`} />
        <div className={`impactRing ${isImpact ? "active" : ""}`} />
        <div className={`impactSparks ${isImpact ? "active" : ""}`}>
          <span />
          <span />
          <span />
          <span />
          <span />
          <span />
        </div>
        <div className="scanline" />
        <div className={`revealBackdrop ${isRevealed ? "visible" : ""}`} aria-hidden="true">
          <span className="bgSlash slashA" />
          <span className="bgSlash slashB" />
          <span className="bgSlash slashC" />
          <span className="particle p1" />
          <span className="particle p2" />
          <span className="particle p3" />
          <span className="particle p4" />
          <span className="particle p5" />
        </div>

        <div className={`diceAnchor ${isRevealed ? "mini" : isImpact ? "impact" : "centered"}`} key={nonce}>
          <FinalDie state={state} result={result} compact={isRevealed} />
        </div>

        <div className={`resultPanel ${isRevealed ? "visible" : ""}`}>
          <FishGlyph />
          <svg className="fishingRod" viewBox="0 0 140 180" aria-hidden="true">
            <path className="rodLine" d="M113 8C77 26 54 61 43 106" />
            <path className="rodMain" d="M118 6C86 23 61 55 47 103" />
            <path className="rodString" d="M48 102C57 126 70 139 87 146" />
            <path className="hook" d="M86 145C96 148 101 158 94 166C88 173 76 169 78 158" />
            <path className="iceShard" d="M78 112L108 123L100 157L68 147Z" />
            <path className="iceShardLine" d="M80 124L97 130M76 140L96 148" />
          </svg>

          <div className="resultContent">
            <div className="resultTitle" aria-label={`${result} ${FISH_ACTION.label}`}>
              <span className="resultNumber">{result}</span>
              <span className="resultWord">{FISH_ACTION.label}</span>
            </div>
            <p>{FISH_ACTION.description}</p>
          </div>
        </div>

        <div className={`idleHint ${state === "idle" ? "visible" : ""}`}>
          <span>Lanzar dado</span>
        </div>

      </section>
    </main>
  );
}

const styles = `
  * {
    box-sizing: border-box;
  }

  :root {
    color-scheme: dark;
  }

  body {
    margin: 0;
    background: radial-gradient(circle at 50% 15%, #1a3055 0%, #091321 50%, #050912 100%);
    font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  }

  .previewShell {
    width: 100%;
    min-height: 100vh;
    display: grid;
    place-items: center;
    padding: 32px;
    color: #eefbff;
    background:
      radial-gradient(circle at 50% 22%, rgba(76, 255, 221, 0.30), transparent 34%),
      radial-gradient(circle at 72% 70%, rgba(33, 229, 153, 0.20), transparent 36%),
      radial-gradient(circle at 18% 74%, rgba(16, 146, 140, 0.18), transparent 34%),
      linear-gradient(145deg, #031c20, #06362f 52%, #03211f);
    overflow: hidden;
  }

  .decisionConsole {
    --console-bg: #165ec8;
    --console-accent: #73b7ff;
    width: min(400px, 92vw);
    aspect-ratio: 400 / 260;
    min-height: 220px;
    position: relative;
    overflow: hidden;
    border: 1px solid rgba(255, 255, 255, 0.18);
    border-radius: 30px;
    background:
      radial-gradient(circle at 24% 18%, rgba(255,255,255,0.22), transparent 30%),
      linear-gradient(135deg, rgba(255,255,255,0.12), transparent 34%),
      var(--console-bg);
    box-shadow:
      0 28px 78px rgba(0, 74, 67, 0.38),
      inset 0 1px 0 rgba(255, 255, 255, 0.25),
      inset 0 -18px 44px rgba(0, 0, 0, 0.22);
    cursor: pointer;
    isolation: isolate;
    user-select: none;
    transition: background 120ms ease, transform 180ms ease, box-shadow 220ms ease, filter 180ms ease;
  }

  .decisionConsole:hover {
    transform: translateY(-2px);
    box-shadow:
      0 38px 90px rgba(0, 84, 76, 0.42),
      0 0 44px color-mix(in srgb, var(--console-accent) 52%, transparent),
      inset 0 1px 0 rgba(255, 255, 255, 0.25),
      inset 0 -18px 44px rgba(0, 0, 0, 0.22);
  }

  .decisionConsole.rolling {
    transform: scale(0.992);
  }

  .decisionConsole.impact {
    animation: consoleSlam 330ms cubic-bezier(.12, 1.45, .18, 1) both;
    filter: saturate(1.22) contrast(1.04);
  }

  .decisionConsole.revealed {
    animation: finalSettle 520ms cubic-bezier(.13, 1.08, .22, 1) both;
    background:
      radial-gradient(circle at 18% 21%, rgba(172, 255, 231, 0.52), transparent 20%),
      radial-gradient(circle at 55% 48%, rgba(20, 255, 190, 0.46), transparent 38%),
      radial-gradient(circle at 88% 66%, rgba(30, 220, 190, 0.48), transparent 32%),
      radial-gradient(circle at 36% 86%, rgba(53, 255, 203, 0.20), transparent 36%),
      linear-gradient(118deg, #073b39 0%, #0a6a58 45%, #07433b 100%);
  }

  .tone-idle {
    --console-bg: #165ec8;
    --console-accent: #73b7ff;
  }

  .tone-fish {
    --console-bg: #12ad6a;
    --console-accent: #8dffcc;
  }

  .consoleGlow {
    position: absolute;
    inset: -32%;
    z-index: -2;
    background:
      radial-gradient(circle at 42% 38%, color-mix(in srgb, var(--console-accent) 56%, transparent), transparent 23%),
      radial-gradient(circle at 80% 18%, rgba(255,255,255,0.18), transparent 18%);
    opacity: 0.65;
    filter: blur(8px);
    transition: opacity 180ms ease, transform 180ms ease;
  }

  .decisionConsole.impact .consoleGlow,
  .decisionConsole.revealed .consoleGlow {
    opacity: 1;
    transform: scale(1.12);
  }

  .consoleVignette {
    position: absolute;
    inset: 0;
    z-index: -1;
    pointer-events: none;
    background:
      radial-gradient(circle at 50% 48%, transparent 0 52%, rgba(0,80,72,0.16) 100%),
      linear-gradient(to bottom, rgba(255,255,255,0.14), transparent 42%, rgba(0,72,62,0.12));
  }

  .scanline {
    position: absolute;
    inset: 0;
    background: linear-gradient(
      110deg,
      transparent 0%,
      transparent 38%,
      rgba(255,255,255,0.28) 48%,
      transparent 58%,
      transparent 100%
    );
    transform: translateX(-120%);
    opacity: 0;
    pointer-events: none;
  }

  .decisionConsole.revealed .scanline {
    animation: scanImpact 620ms cubic-bezier(.2, .9, .2, 1) 30ms both;
  }

  .impactBurst {
    position: absolute;
    width: 150px;
    height: 150px;
    left: 50%;
    top: 46%;
    border-radius: 999px;
    background:
      radial-gradient(circle, rgba(255,255,255,0.98) 0 5%, color-mix(in srgb, var(--console-accent) 68%, transparent) 6% 18%, transparent 46%),
      conic-gradient(from 18deg, transparent 0 8%, rgba(255,255,255,0.62) 9% 11%, transparent 12% 21%, rgba(255,255,255,0.42) 22% 24%, transparent 25% 100%);
    transform: translate(-50%, -50%) scale(0.35) rotate(0deg);
    opacity: 0;
    mix-blend-mode: screen;
    pointer-events: none;
  }

  .impactBurst.active {
    animation: burstPop 390ms cubic-bezier(.08, .95, .2, 1) both;
  }

  .impactRing {
    position: absolute;
    left: 50%;
    top: 46%;
    width: 112px;
    height: 112px;
    border-radius: 999px;
    border: 2px solid rgba(255,255,255,0.72);
    box-shadow:
      0 0 28px color-mix(in srgb, var(--console-accent) 72%, transparent),
      inset 0 0 18px rgba(255,255,255,0.28);
    opacity: 0;
    transform: translate(-50%, -50%) scale(0.7);
    pointer-events: none;
  }

  .impactRing.active {
    animation: ringShock 420ms cubic-bezier(.1, .86, .16, 1) both;
  }

  .impactSparks {
    position: absolute;
    left: 50%;
    top: 46%;
    width: 1px;
    height: 1px;
    pointer-events: none;
    opacity: 0;
  }

  .impactSparks.active {
    opacity: 1;
  }

  .impactSparks span {
    position: absolute;
    width: 34px;
    height: 4px;
    border-radius: 999px;
    background: rgba(255,255,255,0.9);
    box-shadow: 0 0 16px color-mix(in srgb, var(--console-accent) 82%, transparent);
    transform-origin: left center;
    opacity: 0;
  }

  .impactSparks.active span {
    animation: sparkShoot 380ms cubic-bezier(.08, .9, .16, 1) both;
  }

  .impactSparks span:nth-child(1) { --angle: -18deg; --distance: 92px; animation-delay: 0ms; }
  .impactSparks span:nth-child(2) { --angle: 28deg; --distance: 88px; animation-delay: 18ms; }
  .impactSparks span:nth-child(3) { --angle: 92deg; --distance: 76px; animation-delay: 8ms; }
  .impactSparks span:nth-child(4) { --angle: 156deg; --distance: 82px; animation-delay: 22ms; }
  .impactSparks span:nth-child(5) { --angle: 218deg; --distance: 72px; animation-delay: 12ms; }
  .impactSparks span:nth-child(6) { --angle: 318deg; --distance: 92px; animation-delay: 28ms; }

  .diceAnchor {
    position: absolute;
    display: grid;
    place-items: center;
    transition:
      width 520ms cubic-bezier(.12, 1.12, .22, 1),
      height 520ms cubic-bezier(.12, 1.12, .22, 1),
      left 520ms cubic-bezier(.12, 1.12, .22, 1),
      top 520ms cubic-bezier(.12, 1.12, .22, 1),
      transform 520ms cubic-bezier(.12, 1.12, .22, 1);
  }

  .diceAnchor.centered {
    width: 170px;
    height: 170px;
    left: 50%;
    top: 45.5%;
    transform: translate(-50%, -50%);
  }

  .diceAnchor.impact {
    width: 170px;
    height: 170px;
    left: 50%;
    top: 46.5%;
    transform: translate(-50%, -50%);
  }

  .diceAnchor.mini {
    width: 92px;
    height: 92px;
    left: 31px;
    top: 26px;
    transform: none;
  }

  .diceAnchor.mini::before {
    content: "";
    position: absolute;
    inset: -7px;
    border-radius: 24px;
    background:
      radial-gradient(circle at 50% 50%, rgba(255,255,255,0.16), transparent 62%),
      linear-gradient(135deg, rgba(255,255,255,0.22), rgba(255,255,255,0.06));
    border: 1px solid rgba(255,255,255,0.2);
    box-shadow:
      inset 0 1px 0 rgba(255,255,255,0.22),
      0 0 26px color-mix(in srgb, var(--console-accent) 42%, transparent);
  }

  .finalDieStage {
    --cube-size: 86px;
    --cube-half: 43px;
    position: relative;
    z-index: 2;
    width: 178px;
    height: 178px;
    border: 0;
    border-radius: 30px;
    background: transparent;
    perspective: 880px;
    transform-style: preserve-3d;
  }

  .finalDieStage.compact {
    --cube-size: 58px;
    --cube-half: 29px;
    width: 86px;
    height: 86px;
  }

  .energyRing {
    position: absolute;
    left: 50%;
    bottom: 37px;
    width: 142px;
    height: 38px;
    border-radius: 50%;
    transform: translateX(-50%);
    background: radial-gradient(ellipse, rgba(81, 225, 255, 0.72), transparent 67%);
    filter: blur(2px);
    opacity: 0.76;
    transition: opacity 260ms ease, transform 260ms ease;
  }

  .compact .energyRing {
    bottom: 12px;
    width: 74px;
    height: 18px;
    opacity: 0.42;
  }

  .energyOrbit {
    position: absolute;
    left: 50%;
    top: 58px;
    width: 158px;
    height: 58px;
    border-radius: 50%;
    border-top: 2px solid rgba(86, 220, 255, 0.78);
    border-left: 1px solid rgba(86, 220, 255, 0.18);
    transform: translateX(-50%) rotate(-15deg);
    filter: drop-shadow(0 0 8px rgba(61, 213, 255, 0.5));
    opacity: 0.76;
  }

  .orbitB {
    width: 138px;
    transform: translateX(-50%) rotate(20deg);
    opacity: 0.42;
  }

  .compact .energyOrbit {
    top: 25px;
    width: 72px;
    height: 28px;
    opacity: 0.26;
  }

  .compact .orbitB {
    width: 62px;
  }

  .pedestalTop {
    position: absolute;
    left: 50%;
    bottom: 43px;
    width: 124px;
    height: 30px;
    transform: translateX(-50%);
    border-radius: 50%;
    background: rgba(58, 216, 255, 0.24);
    border: 1px solid rgba(174, 241, 255, 0.42);
    box-shadow: 0 0 24px rgba(68, 215, 255, 0.42);
  }

  .pedestal {
    position: absolute;
    left: 50%;
    bottom: 22px;
    width: 146px;
    height: 44px;
    transform: translateX(-50%);
    border-radius: 50%;
    background:
      linear-gradient(180deg, rgba(138, 220, 255, 0.55), rgba(12, 51, 81, 0.9)),
      radial-gradient(ellipse at center, rgba(86, 218, 255, 0.85), transparent 62%);
    border: 1px solid rgba(172, 238, 255, 0.52);
    box-shadow:
      0 0 22px rgba(63, 207, 255, 0.42),
      inset 0 0 18px rgba(255, 255, 255, 0.12);
  }

  .compact .pedestalTop,
  .compact .pedestal {
    opacity: 0;
  }

  .cube {
    position: absolute;
    left: 50%;
    top: 38px;
    z-index: 3;
    width: var(--cube-size);
    height: var(--cube-size);
    transform-style: preserve-3d;
    transform: translateX(-50%) rotateX(-18deg) rotateY(28deg) rotateZ(0deg);
    transition: transform 380ms cubic-bezier(0.2, 0.88, 0.28, 1.18);
  }

  .compact .cube {
    top: 13px;
  }

  /* === DADO FINAL: CARAS SÓLIDAS Y CUADRADAS === */
  .face {
    position: absolute;
    inset: 0;
    display: block;
    overflow: hidden;
    border-radius: 0;
    border: 1px solid rgba(255, 255, 255, 0.98);

    /* Base sólida completa: sin redondeo ni transparencia en esquinas. */
    background: #eefbf1;
    background-clip: padding-box;

    box-shadow:
      inset 0 1.5px 0 rgba(255, 255, 255, 0.92),
      inset 0 12px 16px rgba(255, 255, 255, 0.22),
      inset 0 -8px 12px rgba(96, 155, 112, 0.20),
      inset 8px 0 10px rgba(255,255,255,0.06),
      inset -8px 0 10px rgba(83, 128, 98, 0.08),
      0 0 0 1px rgba(123, 184, 140, 0.22),
      0 0 14px rgba(64, 211, 255, 0.14);

    backface-visibility: hidden;
    transform-style: preserve-3d;
  }

  .face::before,
  .face::after {
    content: "";
    position: absolute;
    inset: 0;
    border-radius: inherit;
    pointer-events: none;
  }

  /* Brillo encima de la base; no perfora ni transparenta el borde. */
  .face::before {
    background:
      linear-gradient(
        180deg,
        rgba(255,255,255,0.82) 0%,
        rgba(255,255,255,0.34) 26%,
        rgba(255,255,255,0.10) 46%,
        rgba(255,255,255,0.00) 64%
      ),
      radial-gradient(
        circle at 28% 22%,
        rgba(255,255,255,0.80),
        rgba(255,255,255,0.00) 42%
      );
    mix-blend-mode: screen;
  }

  /* Bevel suave para que se sienta como pieza física. */
  .face::after {
    box-shadow:
      inset 0 1px 0 rgba(255,255,255,0.86),
      inset 0 -4px 0 rgba(104, 153, 118, 0.20),
      inset 12px 0 14px rgba(255,255,255,0.05),
      inset -12px 0 16px rgba(58, 96, 71, 0.09);
  }

  .front,
  .back {
    background-color: #f4fff6;
  }

  .right,
  .left {
    background-color: #e8f7ec;
  }

  .top {
    background-color: #ffffff;
  }

  .bottom {
    background-color: #dbedde;
  }

  .front { transform: translateZ(var(--cube-half)); }
  .back { transform: rotateY(180deg) translateZ(var(--cube-half)); }
  .right { transform: rotateY(90deg) translateZ(var(--cube-half)); }
  .left { transform: rotateY(-90deg) translateZ(var(--cube-half)); }
  .top { transform: rotateX(90deg) translateZ(var(--cube-half)); }
  .bottom { transform: rotateX(-90deg) translateZ(var(--cube-half)); }

  .pip {
    --pip-size: 18%;
    position: absolute;
    width: var(--pip-size);
    height: var(--pip-size);
    border-radius: 999px;
    background: radial-gradient(circle at 35% 28%, #4a6175, #132a3b 74%);
    box-shadow:
      inset 0 2px 2px rgba(255,255,255,0.18),
      inset 0 -3px 5px rgba(0,0,0,0.26);
  }

  .compact .pip {
    --pip-size: 17%;
  }

  .top-left { left: 21%; top: 21%; }
  .top-right { right: 21%; top: 21%; }
  .mid-left { left: 21%; top: 50%; transform: translateY(-50%); }
  .mid-right { right: 21%; top: 50%; transform: translateY(-50%); }
  .center { left: 50%; top: 50%; transform: translate(-50%, -50%); }
  .bottom-left { left: 21%; bottom: 21%; }
  .bottom-right { right: 21%; bottom: 21%; }

  .motionGhost {
    position: absolute;
    left: 39px;
    top: 31px;
    width: var(--cube-size);
    height: var(--cube-size);
    border-radius: 0;
    opacity: 0;
    background: rgba(255, 255, 255, 0.13);
    border: 1px solid rgba(161, 236, 255, 0.3);
    transform: rotate(-18deg);
    filter: blur(1px);
  }

  .compact .motionGhost {
    display: none;
  }

  .isRolling .cube {
    animation: finalDiceRoll 1280ms cubic-bezier(0.12, 0.78, 0.18, 1) forwards;
  }

  .isRolling .motionGhost {
    animation: ghostTrail 1280ms ease-out forwards;
  }

  .isRolling .ghostB {
    animation-delay: 120ms;
  }

  .isRolling .energyRing {
    animation: ringPulse 1280ms ease-out forwards;
  }

  .isRolling .energyOrbit {
    animation: orbitSpin 1280ms ease-out forwards;
  }

  .isImpact .cube {
    animation: landBounce 330ms cubic-bezier(0.15, 0.86, 0.28, 1.28) both;
  }

  .isImpact .energyRing {
    animation: landingGlow 330ms cubic-bezier(.1, 1.35, .16, 1) both;
  }

  .revealBackdrop {
    position: absolute;
    inset: 0;
    z-index: 0;
    opacity: 0;
    pointer-events: none;
    overflow: hidden;
    background:
      radial-gradient(circle at 23% 26%, rgba(205, 255, 239, 0.46), transparent 20%),
      radial-gradient(circle at 51% 46%, rgba(29, 255, 185, 0.44), transparent 40%),
      radial-gradient(circle at 87% 70%, rgba(55, 244, 210, 0.34), transparent 32%),
      linear-gradient(115deg, rgba(0, 174, 144, 0.12), rgba(0, 110, 96, 0.18));
    filter: saturate(1.42) brightness(1.12);
  }

  .revealBackdrop.visible {
    animation: revealBackdropIn 720ms ease-out both;
  }

  .revealBackdrop::before {
    content: "";
    position: absolute;
    inset: -20%;
    background:
      repeating-linear-gradient(
        116deg,
        transparent 0 23px,
        rgba(144, 255, 224, 0.06) 24px 25px,
        transparent 26px 52px
      ),
      radial-gradient(circle at 24% 20%, rgba(255,255,255,0.28), transparent 14%);
    transform: skewX(-10deg) translateX(-16px);
    opacity: 0.78;
  }

  .revealBackdrop::after {
    content: "";
    position: absolute;
    inset: 0;
    background:
      linear-gradient(90deg, rgba(0,88,78,0.12), transparent 36%, rgba(0,96,82,0.16)),
      radial-gradient(circle at 50% 55%, transparent 0 52%, rgba(0,92,80,0.22) 100%);
  }

  .bgSlash {
    position: absolute;
    width: 210px;
    height: 2px;
    border-radius: 999px;
    background: linear-gradient(90deg, transparent, rgba(184,255,234,0.92), transparent);
    box-shadow: 0 0 18px rgba(92, 255, 210, 0.66);
    transform: rotate(-23deg);
    opacity: 0.72;
  }

  .slashA { left: -20px; top: 42px; }
  .slashB { right: -50px; top: 74px; width: 260px; opacity: 0.46; }
  .slashC { left: 160px; bottom: 35px; width: 180px; opacity: 0.38; }

  .particle {
    position: absolute;
    width: 4px;
    height: 4px;
    border-radius: 999px;
    background: rgba(210,255,242,0.9);
    box-shadow: 0 0 12px rgba(95,255,212,0.9);
    opacity: 0.9;
  }

  .p1 { left: 30px; top: 146px; }
  .p2 { left: 82px; top: 28px; width: 3px; height: 3px; }
  .p3 { right: 116px; top: 38px; }
  .p4 { right: 62px; bottom: 46px; width: 5px; height: 5px; }
  .p5 { left: 190px; bottom: 32px; width: 3px; height: 3px; }

  .resultPanel {
    position: absolute;
    inset: 0;
    z-index: 4;
    display: grid;
    align-items: center;
    padding: 54px 22px 28px 88px;
    color: white;
    opacity: 0;
    pointer-events: none;
    overflow: hidden;
    transform: translateY(18px) scale(0.96);
  }

  .resultPanel.visible {
    animation: posterReveal 720ms cubic-bezier(.09, 1.22, .18, 1) 40ms both;
  }

  .resultPanel::before {
    content: "";
    position: absolute;
    left: 19px;
    top: 20px;
    width: 120px;
    height: 92px;
    border-radius: 999px;
    background: radial-gradient(circle, rgba(173,255,231,0.44), transparent 62%);
    filter: blur(10px);
  }

  .actionGlyph {
    position: absolute;
    width: 190px;
    height: 142px;
    right: -46px;
    bottom: -22px;
    transform: rotate(-7deg);
    opacity: 0.08;
    fill: white;
    stroke: white;
    stroke-width: 4;
    stroke-linecap: round;
    stroke-linejoin: round;
    filter: drop-shadow(0 0 20px rgba(120,255,220,0.55));
  }

  .fishingRod {
    position: absolute;
    right: 17px;
    top: 15px;
    width: 118px;
    height: 158px;
    opacity: 0;
    filter: drop-shadow(0 0 12px rgba(96,255,215,0.62));
  }

  .resultPanel.visible .fishingRod {
    animation: rodDraw 820ms cubic-bezier(.2,.9,.18,1) 180ms both;
  }

  .rodMain,
  .rodLine,
  .rodString,
  .hook,
  .iceShard,
  .iceShardLine {
    fill: none;
    stroke-linecap: round;
    stroke-linejoin: round;
  }

  .rodMain {
    stroke: rgba(210,255,241,0.78);
    stroke-width: 4;
  }

  .rodLine {
    stroke: rgba(62,255,204,0.34);
    stroke-width: 8;
    filter: blur(1px);
  }

  .rodString {
    stroke: rgba(214,255,247,0.54);
    stroke-width: 1.5;
    stroke-dasharray: 4 5;
  }

  .hook {
    stroke: rgba(238,255,250,0.72);
    stroke-width: 2.5;
  }

  .iceShard {
    fill: rgba(81, 255, 214, 0.13);
    stroke: rgba(177, 255, 234, 0.48);
    stroke-width: 2;
  }

  .iceShardLine {
    stroke: rgba(215,255,246,0.38);
    stroke-width: 1.5;
  }

  .resultContent {
    position: relative;
    z-index: 2;
    width: min(280px, 100%);
  }

  .resultTitle {
    position: relative;
    display: flex;
    align-items: baseline;
    gap: 10px;
    line-height: 0.82;
    text-transform: uppercase;
    letter-spacing: -0.09em;
    transform: skewX(-8deg);
    text-shadow:
      0 2px 0 rgba(7, 74, 62, 0.72),
      0 8px 16px rgba(0,72,62,0.32),
      0 0 24px rgba(106,255,212,0.48);
  }

  .resultTitle::after {
    content: "";
    position: absolute;
    left: 8px;
    right: 2px;
    bottom: -7px;
    height: 4px;
    border-radius: 999px;
    background: linear-gradient(90deg, rgba(177,255,234,0.92), rgba(44,255,195,0.3), transparent);
    box-shadow: 0 0 16px rgba(66,255,200,0.74);
    transform: skewX(-18deg);
  }

  .resultNumber {
    display: inline-block;
    min-width: auto;
    width: auto;
    height: auto;
    border-radius: 0;
    background: none;
    border: 0;
    box-shadow: none;
    font-size: clamp(64px, 17vw, 88px);
    font-weight: 1000;
    letter-spacing: -0.14em;
    color: #ffffff;
    -webkit-text-stroke: 1px rgba(177,255,234,0.46);
  }

  .resultWord {
    font-size: clamp(34px, 9vw, 52px);
    font-weight: 1000;
    letter-spacing: -0.08em;
    color: #f3fff8;
    -webkit-text-stroke: 0.6px rgba(177,255,234,0.46);
  }

  .resultPanel p {
    position: relative;
    z-index: 2;
    max-width: 245px;
    margin: 13px 0 0 9px;
    color: rgba(232,255,249,0.94);
    font-size: clamp(10px, 2.6vw, 12px);
    font-weight: 780;
    line-height: 1.1;
    text-shadow: 0 2px 10px rgba(0,72,62,0.42);
  }

  .idleHint {
    position: absolute;
    left: 50%;
    bottom: 22px;
    transform: translateX(-50%) translateY(8px);
    color: rgba(255,255,255,0.86);
    opacity: 0;
    font-size: 13px;
    font-weight: 900;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    transition: opacity 240ms ease, transform 240ms ease;
  }

  .idleHint.visible {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
  }

  .idleHint span {
    display: inline-flex;
    padding: 8px 12px;
    border-radius: 999px;
    background: rgba(0,0,0,0.18);
    border: 1px solid rgba(255,255,255,0.14);
  }


  @keyframes finalDiceRoll {
    0% {
      transform: translateX(-50%) translateY(0) scale(1) rotateX(-18deg) rotateY(28deg) rotateZ(0deg);
    }
    12% {
      transform: translateX(-50%) translateY(-36px) scale(1.035) rotateX(300deg) rotateY(380deg) rotateZ(34deg);
    }
    26% {
      transform: translateX(-50%) translateY(-20px) scale(0.985) rotateX(710deg) rotateY(850deg) rotateZ(-48deg);
    }
    42% {
      transform: translateX(-50%) translateY(-32px) scale(1.045) rotateX(1190deg) rotateY(1350deg) rotateZ(60deg);
    }
    60% {
      transform: translateX(-50%) translateY(-14px) scale(0.995) rotateX(1690deg) rotateY(1850deg) rotateZ(-36deg);
    }
    78% {
      transform: translateX(-50%) translateY(10px) scale(0.99) rotateX(2220deg) rotateY(2380deg) rotateZ(22deg);
    }
    100% {
      transform: translateX(-50%) translateY(0) scale(1) rotateX(2862deg) rotateY(2908deg) rotateZ(0deg);
    }
  }

  @keyframes landBounce {
    0% {
      transform: translateX(-50%) translateY(0) rotateX(-18deg) rotateY(28deg) scale(1.04);
    }
    36% {
      transform: translateX(-50%) translateY(8px) rotateX(-18deg) rotateY(28deg) scale(1.13, 0.88);
    }
    64% {
      transform: translateX(-50%) translateY(-3px) rotateX(-18deg) rotateY(28deg) scale(0.96, 1.05);
    }
    100% {
      transform: translateX(-50%) translateY(0) rotateX(-18deg) rotateY(28deg) scale(1);
    }
  }

  @keyframes ghostTrail {
    0% {
      opacity: 0;
      transform: translate(30px, 18px) rotate(-22deg) scale(0.72);
    }
    24% {
      opacity: 0.5;
      transform: translate(6px, -10px) rotate(18deg) scale(0.94);
    }
    52% {
      opacity: 0.34;
      transform: translate(-18px, 6px) rotate(-10deg) scale(1.04);
    }
    100% {
      opacity: 0;
      transform: translate(-52px, 24px) rotate(-42deg) scale(1.18);
    }
  }

  @keyframes ringPulse {
    0% { opacity: 0.35; transform: translateX(-50%) scaleX(0.82); }
    45% { opacity: 1; transform: translateX(-50%) scaleX(1.18); }
    100% { opacity: 0.74; transform: translateX(-50%) scaleX(1); }
  }

  @keyframes landingGlow {
    0% { opacity: 0.5; transform: translateX(-50%) scaleX(0.85); filter: blur(4px); }
    38% { opacity: 1; transform: translateX(-50%) scaleX(1.26); filter: blur(1px); }
    100% { opacity: 0.74; transform: translateX(-50%) scaleX(1); filter: blur(2px); }
  }

  @keyframes orbitSpin {
    0% { opacity: 0.16; transform: translateX(-50%) rotate(-140deg) scale(0.72); }
    30% { opacity: 1; transform: translateX(-50%) rotate(40deg) scale(1.1); }
    68% { opacity: 0.86; transform: translateX(-50%) rotate(220deg) scale(0.96); }
    100% { opacity: 0.66; transform: translateX(-50%) rotate(345deg) scale(1); }
  }

  @keyframes consoleSlam {
    0% { transform: scale(1); }
    26% { transform: scale(1.032) translateY(-1px); }
    48% { transform: scale(0.982) translateY(2px); }
    72% { transform: scale(1.012); }
    100% { transform: scale(1); }
  }

  @keyframes finalSettle {
    0% { transform: scale(0.992); }
    54% { transform: scale(1.012); }
    100% { transform: scale(1); }
  }

  @keyframes burstPop {
    0% { opacity: 0; transform: translate(-50%, -50%) scale(0.2) rotate(0deg); filter: blur(8px); }
    30% { opacity: 1; transform: translate(-50%, -50%) scale(1.05) rotate(18deg); filter: blur(0); }
    100% { opacity: 0; transform: translate(-50%, -50%) scale(1.75) rotate(32deg); filter: blur(2px); }
  }

  @keyframes ringShock {
    0% { opacity: 0; transform: translate(-50%, -50%) scale(0.58); }
    24% { opacity: 1; }
    100% { opacity: 0; transform: translate(-50%, -50%) scale(2.28); }
  }

  @keyframes sparkShoot {
    0% { opacity: 0; transform: rotate(var(--angle)) translateX(18px) scaleX(0.18); }
    24% { opacity: 1; }
    100% { opacity: 0; transform: rotate(var(--angle)) translateX(var(--distance)) scaleX(1); }
  }

  @keyframes posterReveal {
    0% { opacity: 0; transform: translateY(20px) scale(0.94); filter: blur(10px); }
    44% { opacity: 1; transform: translateY(-3px) scale(1.035); filter: blur(0); }
    68% { opacity: 1; transform: translateY(1px) scale(0.99); filter: blur(0); }
    100% { opacity: 1; transform: translateY(0) scale(1); filter: blur(0); }
  }

  @keyframes revealBackdropIn {
    0% { opacity: 0; transform: scale(1.05); filter: blur(8px) saturate(1.3); }
    100% { opacity: 1; transform: scale(1); filter: blur(0) saturate(1.16); }
  }

  @keyframes rodDraw {
    0% { opacity: 0; transform: translate(18px, -10px) rotate(9deg); }
    100% { opacity: 0.82; transform: translate(0, 0) rotate(0deg); }
  }

  @keyframes scanImpact {
    0% { opacity: 0; transform: translateX(-120%); }
    20% { opacity: 1; }
    100% { opacity: 0; transform: translateX(120%); }
  }

  @media (max-width: 420px) {
    .previewShell {
      padding: 18px;
    }

    .decisionConsole {
      border-radius: 24px;
      min-height: 210px;
    }

    .diceAnchor.centered,
    .diceAnchor.impact {
      width: 148px;
      height: 148px;
      top: 44.5%;
    }

    .finalDieStage {
      --cube-size: 76px;
      --cube-half: 38px;
      width: 150px;
      height: 150px;
    }

    .diceAnchor.mini {
      width: 66px;
      height: 66px;
      left: 18px;
      top: 26px;
    }

    .finalDieStage.compact {
      --cube-size: 50px;
      --cube-half: 25px;
      width: 66px;
      height: 66px;
    }

    .resultPanel {
      padding: 54px 12px 24px 68px;
    }

    .resultTitle {
      gap: 7px;
    }

    .resultPanel p {
      margin-left: 6px;
    }

    .actionGlyph {
      width: 138px;
      right: -42px;
    }

    .fishingRod {
      width: 92px;
      right: 3px;
      top: 22px;
      opacity: 0.65;
    }
  }
`;

import React from "react";

function DreamCatcherIcon() {
  const feathers = [-30, -15, 0, 15, 30];

  return (
    <svg className="dream-icon" viewBox="0 0 120 120" aria-hidden="true">
      <defs>
        <filter id="softGlow" x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="1.2" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <g className="dream-stroke" filter="url(#softGlow)">
        {/* outer ring */}
        <circle cx="60" cy="34" r="27" />
        <circle cx="60" cy="34" r="22" className="dream-thin" />

        {/* web */}
        <path d="M60 7 L80 17 L86 38 L72 56 L48 56 L34 38 L40 17 Z" />
        <path d="M60 7 L60 34 L86 38" />
        <path d="M40 17 L60 34 L72 56" />
        <path d="M80 17 L60 34 L48 56" />
        <path d="M34 38 L60 34" />
        <circle cx="60" cy="34" r="4" className="dream-dot" />

        {/* hanging strings */}
        {feathers.map((x, index) => {
          const center = 60 + x;
          const top = index === 2 ? 60 : 56;
          const bottom = index === 2 ? 98 : 90;

          return (
            <g key={x}>
              <path d={`M${center} ${top} C${center - 1} ${top + 9}, ${center + 1} ${top + 18}, ${center} ${bottom - 13}`} className="dream-thread" />
              <path
                className="feather-fill"
                d={`M${center} ${bottom - 24} C${center - 9} ${bottom - 15}, ${center - 7} ${bottom - 2}, ${center} ${bottom + 1} C${center + 7} ${bottom - 2}, ${center + 9} ${bottom - 15}, ${center} ${bottom - 24} Z`}
              />
              <path d={`M${center} ${bottom - 22} L${center} ${bottom}`} className="feather-line" />
              <path d={`M${center} ${bottom - 12} L${center - 7} ${bottom - 8}`} className="feather-line" />
              <path d={`M${center} ${bottom - 9} L${center + 7} ${bottom - 5}`} className="feather-line" />
            </g>
          );
        })}
      </g>
    </svg>
  );
}

function FrostCard({ index }: { index: number }) {
  return (
    <button className="frost-card" aria-label={`Frozen Guild hidden card ${index + 1}`}>
      <span className="card-inner">
        <span className="corner corner-tl" />
        <span className="corner corner-tr" />
        <span className="corner corner-bl" />
        <span className="corner corner-br" />
        <span className="snow-layer" />
        <DreamCatcherIcon />
      </span>
    </button>
  );
}

export default function FrozenIceGridPreview() {
  return (
    <main className="frozen-board-shell">
      <section className="ice-board" aria-label="El Hielo 3x3">
        <div className="ice-corner ice-corner-a" />
        <div className="ice-corner ice-corner-b" />
        <div className="ice-corner ice-corner-c" />
        <div className="ice-grid">
          {Array.from({ length: 9 }).map((_, index) => (
            <FrostCard key={index} index={index} />
          ))}
        </div>
      </section>

      <style>{`
        :root {
          --ice-0: #031b3a;
          --ice-1: #08385f;
          --ice-2: #0b6d9f;
          --ice-3: #77d8ff;
          --card-dark: #061833;
          --card-mid: #0a3159;
          --card-line: rgba(229, 248, 255, 0.92);
          --card-glow: rgba(111, 219, 255, 0.55);
        }

        * {
          box-sizing: border-box;
        }

        .frozen-board-shell {
          min-height: 100vh;
          width: 100%;
          display: grid;
          place-items: center;
          padding: clamp(18px, 4vw, 48px);
          background:
            radial-gradient(circle at 50% 20%, rgba(175, 239, 255, 0.18), transparent 38%),
            linear-gradient(180deg, #05284d 0%, #020c1b 100%);
          overflow: hidden;
        }

        .ice-board {
          position: relative;
          width: min(94vw, 920px);
          aspect-ratio: 1.43 / 1;
          display: grid;
          place-items: center;
          padding: clamp(26px, 4.4vw, 62px);
          border-radius: 28px;
          isolation: isolate;
          overflow: hidden;
          perspective: 860px;
          perspective-origin: 50% 22%;
          background:
            linear-gradient(115deg, transparent 0 8%, rgba(255,255,255,0.18) 8.4% 8.8%, transparent 9.4% 100%),
            linear-gradient(22deg, transparent 0 31%, rgba(255,255,255,0.13) 31.5% 32%, transparent 32.5% 100%),
            linear-gradient(160deg, transparent 0 54%, rgba(255,255,255,0.14) 54.3% 54.7%, transparent 55.1% 100%),
            radial-gradient(circle at 12% 18%, rgba(222, 250, 255, 0.32), transparent 9%),
            radial-gradient(circle at 84% 78%, rgba(174, 235, 255, 0.22), transparent 15%),
            radial-gradient(circle at 50% 52%, rgba(53, 169, 220, 0.25), transparent 46%),
            linear-gradient(135deg, #0c75a8 0%, #094b7d 42%, #08315d 100%);
          box-shadow:
            inset 0 0 80px rgba(218, 249, 255, 0.22),
            inset 0 0 140px rgba(0, 4, 18, 0.45),
            0 30px 90px rgba(0, 0, 0, 0.42);
        }

        .ice-board::before,
        .ice-board::after {
          content: "";
          position: absolute;
          inset: 0;
          pointer-events: none;
          z-index: -1;
        }

        .ice-board::before {
          opacity: 0.5;
          background:
            repeating-linear-gradient(15deg, transparent 0 38px, rgba(255,255,255,0.16) 39px, transparent 42px),
            repeating-linear-gradient(103deg, transparent 0 58px, rgba(255,255,255,0.1) 59px, transparent 62px),
            radial-gradient(circle at 30% 30%, transparent 0 55%, rgba(255,255,255,0.2) 56%, transparent 57%);
          mix-blend-mode: screen;
        }

        .ice-board::after {
          background:
            radial-gradient(circle at 4% 7%, rgba(255,255,255,0.5) 0 1px, transparent 2px),
            radial-gradient(circle at 14% 88%, rgba(255,255,255,0.36) 0 1px, transparent 2px),
            radial-gradient(circle at 88% 12%, rgba(255,255,255,0.4) 0 1px, transparent 2px),
            radial-gradient(circle at 72% 72%, rgba(255,255,255,0.32) 0 1px, transparent 2px);
          background-size: 64px 64px, 82px 82px, 74px 74px, 91px 91px;
          opacity: 0.72;
        }

        .ice-corner {
          position: absolute;
          width: clamp(38px, 7vw, 78px);
          aspect-ratio: 1;
          border-radius: 14px;
          border: 2px solid rgba(225, 250, 255, 0.65);
          background:
            linear-gradient(135deg, rgba(255,255,255,0.34), transparent 45%),
            linear-gradient(45deg, rgba(42, 185, 235, 0.36), rgba(2, 37, 78, 0.34));
          box-shadow: inset 0 0 22px rgba(255,255,255,0.28), 0 8px 18px rgba(0,0,0,0.18);
          transform: rotate(12deg);
          opacity: 0.8;
        }

        .ice-corner-a { top: -16px; left: -12px; }
        .ice-corner-b { top: 16px; right: 18px; width: clamp(18px, 3vw, 34px); border-radius: 9px; transform: rotate(25deg); }
        .ice-corner-c { bottom: -20px; left: 20px; width: clamp(30px, 5vw, 54px); transform: rotate(-18deg); }

        .ice-grid {
          width: min(80%, 690px);
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: clamp(18px, 3.1vw, 38px);
          transform-style: preserve-3d;
          transform-origin: center center;

          /* perspectiva real del plano completo, como si las cartas estuvieran acostadas sobre el hielo */
          transform:
            rotateX(42deg)
            rotateZ(-0.8deg)
            translateY(26px)
            scale(1.06);
        }

        .frost-card {
          --lift: 0px;
          --tilt-y: 0deg;
          --skew-x: 0deg;
          --shadow-y: 12px;
          --shadow-blur: 10px;

          position: relative;
          border: 0;
          padding: 0;
          aspect-ratio: 1;
          border-radius: 13px;
          background: transparent;
          cursor: pointer;
          transform-style: preserve-3d;
          transform:
            translateY(var(--lift))
            rotateY(var(--tilt-y))
            skewX(var(--skew-x))
            translateZ(0);
          transition: transform 180ms ease, filter 180ms ease;
          filter: drop-shadow(0 var(--shadow-y) var(--shadow-blur) rgba(0, 0, 0, 0.37));
          will-change: transform;
        }

        /* micro deformación por posición: las orillas se sienten más en perspectiva */
        .frost-card:nth-child(1) { --lift: -6px; --tilt-y: -5deg; --skew-x: -1.2deg; --shadow-y: 8px; }
        .frost-card:nth-child(2) { --lift: -7px; --tilt-y: 0deg; --skew-x: -0.2deg; --shadow-y: 8px; }
        .frost-card:nth-child(3) { --lift: -6px; --tilt-y: 5deg; --skew-x: 1.2deg; --shadow-y: 8px; }
        .frost-card:nth-child(4) { --lift: 0px; --tilt-y: -3.2deg; --skew-x: -0.8deg; }
        .frost-card:nth-child(5) { --lift: 0px; --tilt-y: 0deg; --skew-x: 0deg; }
        .frost-card:nth-child(6) { --lift: 0px; --tilt-y: 3.2deg; --skew-x: 0.8deg; }
        .frost-card:nth-child(7) { --lift: 7px; --tilt-y: -4.5deg; --skew-x: -1deg; --shadow-y: 18px; --shadow-blur: 14px; }
        .frost-card:nth-child(8) { --lift: 8px; --tilt-y: 0deg; --skew-x: 0.2deg; --shadow-y: 18px; --shadow-blur: 14px; }
        .frost-card:nth-child(9) { --lift: 7px; --tilt-y: 4.5deg; --skew-x: 1deg; --shadow-y: 18px; --shadow-blur: 14px; }

        .frost-card:hover {
          transform:
            translateY(calc(var(--lift) - 8px))
            rotateY(var(--tilt-y))
            skewX(var(--skew-x))
            translateZ(26px)
            scale(1.035);
          filter: drop-shadow(0 22px 18px rgba(0, 0, 0, 0.44));
        }

        .frost-card:focus-visible {
          outline: 3px solid rgba(187, 242, 255, 0.95);
          outline-offset: 5px;
        }

        .card-inner {
          position: absolute;
          inset: 0;
          display: grid;
          place-items: center;
          border-radius: inherit;
          overflow: hidden;
          transform: translateZ(8px);
          backface-visibility: hidden;
          background:
            radial-gradient(circle at 50% 26%, rgba(45, 150, 220, 0.3), transparent 42%),
            radial-gradient(circle at 18% 18%, rgba(255,255,255,0.13), transparent 13%),
            linear-gradient(155deg, #0a3a67 0%, var(--card-dark) 56%, #030a18 100%);
          border: 3px solid rgba(236, 250, 255, 0.9);
          box-shadow:
            inset 0 0 0 3px rgba(8, 47, 86, 0.92),
            inset 0 0 0 6px rgba(226, 251, 255, 0.7),
            inset 0 0 28px rgba(87, 202, 255, 0.28),
            0 0 0 1px rgba(255,255,255,0.32);
        }

        .card-inner::before {
          content: "";
          position: absolute;
          inset: 12px;
          border: 1.5px solid rgba(205, 244, 255, 0.45);
          border-radius: 9px;
        }

        .card-inner::after {
          content: "";
          position: absolute;
          inset: 0;
          background:
            linear-gradient(135deg, rgba(255,255,255,0.34), transparent 18% 82%, rgba(255,255,255,0.18)),
            radial-gradient(circle at 50% 50%, transparent 0 58%, rgba(0,0,0,0.2) 100%);
          pointer-events: none;
        }

        .snow-layer {
          position: absolute;
          inset: 0;
          background:
            radial-gradient(circle, rgba(255,255,255,0.9) 0 1px, transparent 1.6px) 18% 22% / 34px 34px,
            radial-gradient(circle, rgba(155,225,255,0.75) 0 1px, transparent 1.8px) 72% 64% / 42px 42px,
            radial-gradient(circle, rgba(255,255,255,0.55) 0 1px, transparent 1.5px) 48% 78% / 28px 28px;
          opacity: 0.58;
        }

        .corner {
          position: absolute;
          width: 28px;
          height: 28px;
          z-index: 2;
        }

        .corner::before,
        .corner::after {
          content: "";
          position: absolute;
          background: rgba(235, 250, 255, 0.95);
          box-shadow: 0 0 8px rgba(125, 225, 255, 0.6);
        }

        .corner::before { width: 24px; height: 3px; top: 0; left: 0; }
        .corner::after { width: 3px; height: 24px; top: 0; left: 0; }
        .corner-tl { top: 11px; left: 11px; }
        .corner-tr { top: 11px; right: 11px; transform: rotate(90deg); }
        .corner-bl { bottom: 11px; left: 11px; transform: rotate(-90deg); }
        .corner-br { bottom: 11px; right: 11px; transform: rotate(180deg); }

        .dream-icon {
          width: 76%;
          height: 76%;
          z-index: 1;
          overflow: visible;
        }

        .dream-stroke {
          fill: none;
          stroke: rgba(225, 249, 255, 0.94);
          stroke-width: 3.2;
          stroke-linecap: round;
          stroke-linejoin: round;
        }

        .dream-thin,
        .dream-thread {
          stroke-width: 1.7;
          opacity: 0.92;
        }

        .dream-dot {
          fill: rgba(232, 251, 255, 0.95);
          stroke: none;
        }

        .feather-fill {
          fill: rgba(20, 126, 188, 0.88);
          stroke: rgba(224, 248, 255, 0.94);
          stroke-width: 2.1;
        }

        .feather-line {
          stroke: rgba(229, 251, 255, 0.9);
          stroke-width: 1.4;
          opacity: 0.85;
        }

        @media (max-width: 720px) {
          .ice-board {
            aspect-ratio: 1 / 1.15;
            padding: 28px;
            perspective: 760px;
          }

          .ice-grid {
            width: 88%;
            gap: 16px;
            transform:
              rotateX(38deg)
              rotateZ(-0.6deg)
              translateY(18px)
              scale(1.02);
          }

          .dream-icon {
            width: 80%;
            height: 80%;
          }
        }
      `}</style>
    </main>
  );
}

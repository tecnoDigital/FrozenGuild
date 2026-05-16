import React from "react";

function FrostCard({ index }) {
  return (
    <button className="frost-card" aria-label={`Frozen Guild card ${index + 1}`}>
      <span className="card-inner" />
    </button>
  );
}

export default function FrozenIceGridPreview() {
  return (
    <main className="board-preview-shell">
      <section className="board-surface" aria-label="Frozen Guild board grid">
        <div className="ice-grid">
          {Array.from({ length: 9 }).map((_, index) => (
            <FrostCard key={index} index={index} />
          ))}
        </div>
      </section>

      <style>{`
        :root {
          --page-bg: #061426;
          --board-bg: #0b3557;
          --board-border: rgba(213, 244, 255, 0.22);
          --card-bg: #071c34;
          --card-border: rgba(231, 249, 255, 0.82);
          --card-shadow: rgba(0, 0, 0, 0.34);
        }

        * {
          box-sizing: border-box;
        }

        .board-preview-shell {
          min-height: 100vh;
          width: 100%;
          display: grid;
          place-items: center;
          padding: clamp(20px, 4vw, 48px);
          background: var(--page-bg);
          overflow: hidden;
        }

        .board-surface {
          width: min(94vw, 920px);
          aspect-ratio: 1.43 / 1;
          display: grid;
          place-items: center;
          padding: clamp(28px, 5vw, 64px);
          border-radius: 28px;
          background: var(--board-bg);
          border: 1px solid var(--board-border);
          perspective: 860px;
          perspective-origin: 50% 22%;
        }

        .ice-grid {
          width: min(80%, 690px);
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: clamp(18px, 3vw, 38px);
          transform-style: preserve-3d;
          transform-origin: center center;
          transform:
            rotateX(42deg)
            translateY(26px)
            scale(1.06);
        }

        .frost-card {
          position: relative;
          border: 0;
          padding: 0;
          aspect-ratio: 1;
          border-radius: 14px;
          background: transparent;
          cursor: pointer;
          transform-style: preserve-3d;
          transition: transform 180ms ease, filter 180ms ease;
          filter: drop-shadow(0 14px 12px var(--card-shadow));
        }

        .frost-card:hover {
          transform: translateZ(24px) scale(1.035);
          filter: drop-shadow(0 22px 18px var(--card-shadow));
        }

        .frost-card:focus-visible {
          outline: 3px solid rgba(209, 245, 255, 0.95);
          outline-offset: 5px;
        }

        .card-inner {
          position: absolute;
          inset: 0;
          display: block;
          border-radius: inherit;
          background: var(--card-bg);
          border: 2px solid var(--card-border);
          transform: translateZ(8px);
          backface-visibility: hidden;
        }

        @media (max-width: 720px) {
          .board-surface {
            aspect-ratio: 1 / 1.15;
            padding: 28px;
            perspective: 760px;
          }

          .ice-grid {
            width: 88%;
            gap: 16px;
            transform:
              rotateX(38deg)
              translateY(18px)
              scale(1.02);
          }
        }
      `}</style>
    </main>
  );
}


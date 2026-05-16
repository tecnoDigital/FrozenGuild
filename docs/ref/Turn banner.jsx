import React, { useMemo, useState } from "react";

function FrozenRoundBanner({ round = 7, isMyTurn = false }) {
  const label = useMemo(() => {
    if (isMyTurn) return "TU TURNO";
    return `RONDA ${round}`;
  }, [round, isMyTurn]);

  return (
    <div className={`roundBanner ${isMyTurn ? "roundBannerActive" : ""}`}>
      <span className="roundIcon">❄</span>
      <span className="roundChevron">〉</span>
      <span className="roundText" key={label}>{label}</span>
      <span className="roundChevron left">〈</span>
      <span className="roundIcon">❄</span>
    </div>
  );
}

export default function FrozenRoundTurnPreview() {
  const [round, setRound] = useState(7);
  const [isMyTurn, setIsMyTurn] = useState(false);

  return (
    <main className="previewShell">
      <style>{`
        .previewShell {
          min-height: 100vh;
          width: 100%;
          display: flex;
          align-items: flex-start;
          justify-content: center;
          padding: 42px 20px;
          color: white;
          overflow: hidden;
          background:
            radial-gradient(circle at 50% -10%, rgba(71, 206, 255, 0.34), transparent 28%),
            radial-gradient(circle at 50% 14%, rgba(0, 16, 32, 0.28), transparent 34%),
            linear-gradient(180deg, #05243d 0%, #041424 45%, #020812 100%);
          position: relative;
        }

        .previewShell::before {
          content: "";
          position: absolute;
          inset: 0;
          background:
            linear-gradient(135deg, transparent 0 44%, rgba(120, 226, 255, 0.12) 45% 46%, transparent 47% 100%),
            linear-gradient(45deg, transparent 0 48%, rgba(255, 255, 255, 0.08) 49% 50%, transparent 51% 100%);
          background-size: 92px 92px, 76px 76px;
          opacity: 0.34;
          mask-image: linear-gradient(180deg, black, transparent 70%);
          pointer-events: none;
        }

        .previewShell::after {
          content: "";
          position: absolute;
          left: 50%;
          top: -190px;
          width: min(920px, 120vw);
          height: 430px;
          transform: translateX(-50%);
          border-radius: 999px;
          background: radial-gradient(ellipse at center, rgba(74, 217, 255, 0.23), transparent 64%);
          filter: blur(8px);
          pointer-events: none;
        }

        .roundBanner {
          --banner-glow: rgba(59, 205, 255, 0.28);
          --banner-border: rgba(119, 218, 255, 0.5);
          position: relative;
          z-index: 2;
          min-width: 360px;
          height: 74px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 17px;
          padding: 0 34px;
          border-radius: 999px;
          background:
            linear-gradient(180deg, rgba(23, 51, 77, 0.92), rgba(5, 20, 34, 0.97)) padding-box,
            linear-gradient(180deg, rgba(141, 232, 255, 0.72), rgba(47, 114, 158, 0.3)) border-box;
          border: 2px solid transparent;
          box-shadow:
            0 16px 36px rgba(0, 0, 0, 0.5),
            0 0 0 1px rgba(173, 240, 255, 0.12),
            inset 0 1px 0 rgba(255, 255, 255, 0.18),
            inset 0 -18px 20px rgba(0, 0, 0, 0.28),
            0 0 26px var(--banner-glow);
          isolation: isolate;
          transition:
            min-width 220ms ease,
            filter 220ms ease,
            box-shadow 220ms ease,
            transform 220ms ease;
        }

        .roundBanner::before {
          content: "";
          position: absolute;
          inset: 7px;
          border-radius: inherit;
          border: 1px solid rgba(133, 230, 255, 0.16);
          background: linear-gradient(180deg, rgba(255,255,255,0.08), transparent 48%);
          pointer-events: none;
          z-index: -1;
        }

        .roundBanner::after {
          content: "";
          position: absolute;
          left: 14%;
          right: 14%;
          top: 9px;
          height: 2px;
          border-radius: 999px;
          background: linear-gradient(90deg, transparent, rgba(197, 247, 255, 0.62), transparent);
          opacity: 0.9;
          pointer-events: none;
        }

        .roundBannerActive {
          --banner-glow: rgba(93, 237, 255, 0.42);
          --banner-border: rgba(186, 249, 255, 0.78);
          min-width: 380px;
          transform: translateY(2px) scale(1.03);
          filter: brightness(1.04) saturate(1.05);
          background:
            linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(232, 245, 255, 0.96)) padding-box,
            linear-gradient(180deg, rgba(170, 235, 255, 0.9), rgba(70, 160, 220, 0.55)) border-box;
          box-shadow:
            0 16px 36px rgba(0, 0, 0, 0.42),
            0 0 0 1px rgba(214, 250, 255, 0.35),
            inset 0 1px 0 rgba(255, 255, 255, 0.92),
            inset 0 -14px 18px rgba(92, 171, 214, 0.13),
            0 0 30px var(--banner-glow);
          animation: turnPulse 1.15s ease-in-out infinite;
        }

        .roundBannerActive::before {
          border: 1px solid rgba(108, 194, 235, 0.22);
          background: linear-gradient(180deg, rgba(255,255,255,0.45), rgba(255,255,255,0.08));
        }

        .roundBannerActive::after {
          background: linear-gradient(90deg, transparent, rgba(69, 158, 217, 0.46), transparent);
        }

        .roundBannerActive .roundText {
          color: #1162a8;
          text-shadow:
            0 0 10px rgba(126, 214, 255, 0.35),
            0 1px 0 rgba(255, 255, 255, 0.9);
        }

        .roundBannerActive .roundIcon,
        .roundBannerActive .roundChevron {
          color: #2c78bb;
          text-shadow: 0 0 10px rgba(126, 214, 255, 0.28);
        }

        .roundText {
          min-width: 160px;
          text-align: center;
          font-size: clamp(22px, 3vw, 31px);
          line-height: 1;
          font-weight: 950;
          letter-spacing: 0.08em;
          color: #d8f2ff;
          text-shadow:
            0 0 10px rgba(106, 202, 255, 0.5),
            0 2px 0 rgba(0, 0, 0, 0.86);
          animation: textSwap 260ms ease both;
          white-space: nowrap;
        }

        .roundIcon {
          font-size: 34px;
          line-height: 1;
          color: #bfeeff;
          text-shadow:
            0 0 12px rgba(110, 224, 255, 0.8),
            0 2px 0 rgba(0, 0, 0, 0.6);
          opacity: 0.96;
        }

        .roundChevron {
          font-size: 26px;
          font-weight: 900;
          color: rgba(199, 239, 255, 0.78);
          text-shadow: 0 0 10px rgba(73, 195, 255, 0.45);
          transform: translateY(-1px);
        }

        .roundChevron.left {
          transform: translateY(-1px);
        }

        .controls {
          position: absolute;
          z-index: 3;
          top: 148px;
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
          justify-content: center;
        }

        .controlButton {
          border: 1px solid rgba(140, 227, 255, 0.22);
          border-radius: 14px;
          background: rgba(3, 18, 32, 0.74);
          color: #dff7ff;
          padding: 10px 14px;
          font-weight: 800;
          cursor: pointer;
          box-shadow: inset 0 0 18px rgba(93, 217, 255, 0.06);
          transition: transform 160ms ease, filter 160ms ease;
        }

        .controlButton:hover {
          transform: translateY(-1px);
          filter: brightness(1.15);
        }

        @keyframes textSwap {
          from {
            opacity: 0;
            transform: translateY(6px) scale(0.96);
            filter: blur(4px);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
            filter: blur(0);
          }
        }

        @keyframes turnPulse {
          0%, 100% {
            box-shadow:
              0 16px 36px rgba(0, 0, 0, 0.42),
              0 0 0 1px rgba(214, 250, 255, 0.35),
              inset 0 1px 0 rgba(255, 255, 255, 0.92),
              inset 0 -14px 18px rgba(92, 171, 214, 0.13),
              0 0 26px rgba(93, 237, 255, 0.36);
          }
          50% {
            box-shadow:
              0 18px 42px rgba(0, 0, 0, 0.48),
              0 0 0 1px rgba(214, 250, 255, 0.6),
              inset 0 1px 0 rgba(255, 255, 255, 1),
              inset 0 -14px 18px rgba(92, 171, 214, 0.18),
              0 0 46px rgba(93, 237, 255, 0.62);
          }
        }

        @media (max-width: 520px) {
          .roundBanner,
          .roundBannerActive {
            min-width: min(92vw, 390px);
            height: 64px;
            gap: 11px;
            padding: 0 20px;
          }

          .roundText {
            min-width: 130px;
            letter-spacing: 0.055em;
          }

          .roundIcon {
            font-size: 27px;
          }

          .roundChevron {
            font-size: 22px;
          }
        }
      `}</style>

      <FrozenRoundBanner round={round} isMyTurn={isMyTurn} />

      <div className="controls">
        <button className="controlButton" onClick={() => setIsMyTurn((value) => !value)}>
          {isMyTurn ? "Mostrar ronda" : "Mostrar tu turno"}
        </button>
        <button className="controlButton" onClick={() => setRound((value) => value + 1)}>
          + Ronda
        </button>
      </div>
    </main>
  );
}

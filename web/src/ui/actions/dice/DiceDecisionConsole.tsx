import { useEffect, useRef, useState, useCallback } from "react";
import { DiceCube } from "./DiceCube.js";
import { DiceResultPanel } from "./DiceResultPanel.js";
import styles from "./DiceDecisionConsole.module.css";

export type DiceActionConfig = {
  label: string;
  description: string;
  tone: string;
};

const DICE_ACTIONS: Record<number, DiceActionConfig> = {
  1: { label: "PESCA", description: "Toma una carta del hielo", tone: "fish" },
  2: { label: "PESCA", description: "Toma una carta del hielo", tone: "fish" },
  3: { label: "PESCA", description: "Toma una carta del hielo", tone: "fish" },
  4: { label: "SPY", description: "Descubre cartas del hielo", tone: "spy" },
  5: { label: "SWAP", description: "Intercambia cartas con un rival", tone: "swap" },
  6: { label: "PADRINO", description: "El padrino te hara un favor", tone: "padrino" },
};

function normalizeDiceResult(value: unknown, fallback = 1) {
  const number = Number(value);
  return Number.isInteger(number) && number >= 1 && number <= 6 ? number : fallback;
}

function getToneClass(tone: string) {
  switch (tone) {
    case "fish": return styles.toneFish;
    case "spy": return styles.toneSpy;
    case "swap": return styles.toneSwap;
    case "padrino": return styles.tonePadrino;
    default: return styles.toneIdle;
  }
}

type DiceDecisionConsoleProps = {
  value: number | null;
  rolled: boolean;
  disabled?: boolean;
  onRoll?: (() => void) | undefined;
};

export function DiceDecisionConsole({ value, rolled, disabled = false, onRoll }: DiceDecisionConsoleProps) {
  const [animState, setAnimState] = useState<"idle" | "rolling" | "impact" | "revealed">(() =>
    rolled && value !== null ? "revealed" : "idle"
  );
  const [nonce, setNonce] = useState(0);
  const timersRef = useRef<number[]>([]);
  const prevRolledRef = useRef(rolled);
  const rollingStartedRef = useRef(false);

  const clearTimers = useCallback(() => {
    timersRef.current.forEach((id) => window.clearTimeout(id));
    timersRef.current = [];
  }, []);

  useEffect(() => clearTimers, [clearTimers]);

  useEffect(() => {
    const justRolled = !prevRolledRef.current && rolled;
    const rolledBack = prevRolledRef.current && !rolled;
    prevRolledRef.current = rolled;

    if (justRolled && value !== null) {
      clearTimers();
      const impactDelay = rollingStartedRef.current ? 1280 : 0;
      const impactId = window.setTimeout(() => setAnimState("impact"), impactDelay);
      const revealId = window.setTimeout(() => {
        rollingStartedRef.current = false;
        setAnimState("revealed");
      }, impactDelay + 360);
      timersRef.current.push(impactId, revealId);
    } else if (rolledBack) {
      clearTimers();
      rollingStartedRef.current = false;
      setAnimState("idle");
    }
  }, [rolled, value, clearTimers]);

  const handleRoll = () => {
    if (disabled || !onRoll || animState === "rolling" || animState === "impact") return;
    clearTimers();
    rollingStartedRef.current = true;
    onRoll();
    setNonce((n) => n + 1);
    setAnimState("rolling");
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleRoll();
    }
  };

  const isImpact = animState === "impact";
  const isRevealed = animState === "revealed";
  const isActionActive = isImpact || isRevealed;
  const isInteractive = !disabled && !!onRoll && animState === "idle";

  const normalizedValue = normalizeDiceResult(value, 1);
  const action = isActionActive ? DICE_ACTIONS[normalizedValue] : null;
  const tone = action?.tone ?? "idle";

  const diceAnchorClass = isRevealed
    ? styles.diceAnchorMini
    : isImpact
      ? styles.diceAnchorImpact
      : styles.diceAnchorCentered;

  return (
    <div
      className={[
        styles.decisionConsole,
        isInteractive ? styles.interactive : "",
        styles[animState] || "",
        getToneClass(tone),
      ].filter(Boolean).join(" ")}
      onClick={handleRoll}
      role="button"
      tabIndex={disabled || !onRoll ? -1 : 0}
      onKeyDown={handleKeyDown}
      aria-label={
        rolled && value !== null
          ? `Resultado del dado: ${value} - ${action?.label ?? ""}`
          : "Lanzar dado de decisión"
      }
      aria-disabled={disabled || animState !== "idle"}
    >
      <div className={styles.consoleGlow} />
      <div className={styles.consoleVignette} />
      <div className={`${styles.impactBurst} ${isImpact ? styles.active : ""}`} />
      <div className={`${styles.impactRing} ${isImpact ? styles.active : ""}`} />
      <div className={`${styles.impactSparks} ${isImpact ? styles.active : ""}`}>
        <span />
        <span />
        <span />
        <span />
        <span />
        <span />
      </div>
      <div className={styles.scanline} />
      <div className={`${styles.revealBackdrop} ${isRevealed ? styles.visible : ""}`} aria-hidden="true">
        <span className={`${styles.bgSlash} ${styles.slashA}`} />
        <span className={`${styles.bgSlash} ${styles.slashB}`} />
        <span className={`${styles.bgSlash} ${styles.slashC}`} />
        <span className={`${styles.particle} ${styles.p1}`} />
        <span className={`${styles.particle} ${styles.p2}`} />
        <span className={`${styles.particle} ${styles.p3}`} />
        <span className={`${styles.particle} ${styles.p4}`} />
        <span className={`${styles.particle} ${styles.p5}`} />
      </div>

      <div className={`${styles.diceAnchor} ${diceAnchorClass}`} key={nonce}>
        <DiceCube state={animState} result={normalizedValue} compact={isRevealed} />
      </div>

      {action ? (
        <DiceResultPanel visible={isRevealed} action={action} value={normalizedValue} />
      ) : null}

      <div className={`${styles.idleHint} ${animState === "idle" ? styles.visible : ""}`}>
        <span>Lanzar dado</span>
      </div>
    </div>
  );
}

import { useMemo } from "react";
import styles from "./DiceDecisionConsole.module.css";

const DICE_VALUES = [1, 2, 3, 4, 5, 6];

function normalizeDiceResult(value: unknown, fallback = 1) {
  const number = Number(value);
  return Number.isInteger(number) && number >= 1 && number <= 6 ? number : fallback;
}

function getFaceValues(result: number) {
  const front = normalizeDiceResult(result, 1);
  const remaining = DICE_VALUES.filter((value) => value !== front);
  const [back, right, left, top, bottom] = remaining as [number, number, number, number, number];
  return { front, back, right, left, top, bottom };
}

function Pip({ className = "" }: { className?: string | undefined }) {
  return <span className={`${styles.pip} ${className}`} />;
}

function DiceFace({ value }: { value: number }) {
  const pips: Record<number, React.ReactNode> = {
    1: <Pip className={styles.center} />,
    2: (
      <>
        <Pip className={styles.topLeft} />
        <Pip className={styles.bottomRight} />
      </>
    ),
    3: (
      <>
        <Pip className={styles.topLeft} />
        <Pip className={styles.center} />
        <Pip className={styles.bottomRight} />
      </>
    ),
    4: (
      <>
        <Pip className={styles.topLeft} />
        <Pip className={styles.topRight} />
        <Pip className={styles.bottomLeft} />
        <Pip className={styles.bottomRight} />
      </>
    ),
    5: (
      <>
        <Pip className={styles.topLeft} />
        <Pip className={styles.topRight} />
        <Pip className={styles.center} />
        <Pip className={styles.bottomLeft} />
        <Pip className={styles.bottomRight} />
      </>
    ),
    6: (
      <>
        <Pip className={styles.topLeft} />
        <Pip className={styles.topRight} />
        <Pip className={styles.midLeft} />
        <Pip className={styles.midRight} />
        <Pip className={styles.bottomLeft} />
        <Pip className={styles.bottomRight} />
      </>
    ),
  };

  return <>{pips[normalizeDiceResult(value)]}</>;
}

type DiceCubeProps = {
  state: "idle" | "rolling" | "impact" | "revealed";
  result: number;
  compact?: boolean;
};

export function DiceCube({ state, result, compact = false }: DiceCubeProps) {
  const isRolling = state === "rolling";
  const isImpact = state === "impact";
  const hasLanded = state === "impact" || state === "revealed";
  const faceValues = useMemo(() => getFaceValues(result), [result]);

  return (
    <div
      className={[
        styles.finalDieStage,
        compact ? styles.compact : "",
        isRolling ? styles.isRolling : "",
        isImpact ? styles.isImpact : "",
        hasLanded ? styles.hasLanded : "",
      ].join(" ")}
      aria-hidden="true"
    >
      <span className={`${styles.motionGhost} ${styles.ghostA}`} />
      <span className={`${styles.motionGhost} ${styles.ghostB}`} />
      <span className={`${styles.energyOrbit} ${styles.orbitA}`} />
      <span className={`${styles.energyOrbit} ${styles.orbitB}`} />
      <span className={styles.energyRing} />

      <span className={styles.cube}>
        <span className={`${styles.face} ${styles.front}`}>
          <DiceFace value={faceValues.front} />
        </span>
        <span className={`${styles.face} ${styles.back}`}>
          <DiceFace value={faceValues.back} />
        </span>
        <span className={`${styles.face} ${styles.right}`}>
          <DiceFace value={faceValues.right} />
        </span>
        <span className={`${styles.face} ${styles.left}`}>
          <DiceFace value={faceValues.left} />
        </span>
        <span className={`${styles.face} ${styles.top}`}>
          <DiceFace value={faceValues.top} />
        </span>
        <span className={`${styles.face} ${styles.bottom}`}>
          <DiceFace value={faceValues.bottom} />
        </span>
      </span>

      <span className={styles.pedestalTop} />
      <span className={styles.pedestal} />
    </div>
  );
}

import { FishGlyph, SpyGlyph, SwapGlyph, PadrinoGlyph, FishingRod } from "./DiceActionSvgs.js";
import styles from "./DiceDecisionConsole.module.css";

export type DiceActionConfig = {
  label: string;
  description: string;
  tone: string;
};

type DiceResultPanelProps = {
  visible: boolean;
  action: DiceActionConfig;
  value: number;
};

function ActionGlyph({ tone, className }: { tone: string; className?: string | undefined }) {
  if (tone === "fish") return <FishGlyph className={className} />;
  if (tone === "spy") return <SpyGlyph className={className} />;
  if (tone === "swap") return <SwapGlyph className={className} />;
  if (tone === "padrino") return <PadrinoGlyph className={className} />;
  return null;
}

export function DiceResultPanel({ visible, action, value }: DiceResultPanelProps) {
  return (
    <div className={`${styles.resultPanel} ${visible ? styles.visible : ""}`}>
      <ActionGlyph tone={action.tone} className={styles.actionGlyph} />
      {action.tone === "fish" ? <FishingRod className={styles.fishingRod} /> : null}

      <div className={styles.resultContent}>
        <div className={styles.resultTitle} aria-label={`${value} ${action.label}`}>
          <span className={styles.resultNumber}>{value}</span>
          <span className={styles.resultWord}>{action.label}</span>
        </div>
        <p>{action.description}</p>
      </div>
    </div>
  );
}

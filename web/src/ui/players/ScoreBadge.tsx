import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import styles from "./Players.module.css";

type ScoreBadgeProps = {
  score: number;
};

export function ScoreBadge({ score }: ScoreBadgeProps) {
  const prevScoreRef = useRef(score);
  const [trend, setTrend] = useState<"up" | "down" | "flat">("flat");

  useEffect(() => {
    const prev = prevScoreRef.current;
    if (score > prev) {
      setTrend("up");
    } else if (score < prev) {
      setTrend("down");
    } else {
      setTrend("flat");
    }
    prevScoreRef.current = score;
  }, [score]);

  return (
    <motion.span
      className={styles.scoreBadge}
      initial={false}
      animate={{ scale: trend === "flat" ? 1 : 1.03, y: trend === "up" ? -1 : trend === "down" ? 1 : 0 }}
      transition={{ duration: 0.18, ease: "easeOut" }}
      aria-label={`Puntaje ${score} puntos`}
    >
      <img src="/assets/ui/icons/fish.png" alt="" className={styles.scoreIcon} />
      <span className={styles.scoreValue}>{score}</span>
      <span className={styles.scoreUnit}>pts</span>
    </motion.span>
  );
}

import { motion } from "framer-motion";
import { assets } from "../assets.js";
import styles from "./LeftStatusRail.module.css";

export type ScoreTablePlayer = {
  id: string;
  name: string;
  avatarSrc: string;
  colorValue: string;
  score: number;
  isActiveTurn: boolean;
};

type LeftStatusRailProps = {
  players: ScoreTablePlayer[];
};

export function LeftStatusRail({ players }: LeftStatusRailProps) {
  return (
    <div className={styles.rail}>
      <div className={styles.header}>
        <img className={styles.trophy} src={assets.ui.icons.trophy} alt="" aria-hidden="true" />
        <span>PUNTUACIÓN</span>
      </div>

      <div className={styles.list}>
        {players.length === 0 ? (
          <p className={styles.empty}>Sin jugadores</p>
        ) : (
          players.map((player) => (
            <motion.div
              key={player.id || `unknown-${player.name}`}
              layout
              transition={{ type: "spring", stiffness: 350, damping: 30 }}
              className={`${styles.row} ${player.isActiveTurn ? styles.rowActive : ""}`}
              data-testid={`score-row-${player.id || "unknown"}`}
              data-active={player.isActiveTurn ? "true" : "false"}
            >
              <img
                className={styles.avatar}
                src={player.avatarSrc || assets.characters.opponents.bot}
                alt={`Avatar de ${player.name || "jugador"}`}
                width={38}
                height={38}
              />

              <div className={styles.info}>
                <span className={styles.name} title={player.name || "??"}>
                  {player.name || "??"}
                </span>
                <span className={styles.meta}>
                  <span
                    className={styles.colorChip}
                    style={{ backgroundColor: player.colorValue || "#667a89" }}
                    title={`Color ${player.colorValue || "??"}`}
                  />
                  <span className={styles.id} title={player.id || "??"}>
                    {player.id || "??"}
                  </span>
                </span>
              </div>

              <span className={styles.score}>
                <img className={styles.fishIcon} src={assets.ui.icons.fish} alt="" aria-hidden="true" />
                <span>{typeof player.score === "number" ? player.score : "??"}</span>
              </span>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}

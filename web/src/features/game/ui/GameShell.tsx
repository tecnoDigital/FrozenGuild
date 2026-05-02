import { BoardCardSlot } from "./BoardCardSlot";
import { RoundBadge } from "./RoundBadge";
import styles from "./GameShell.module.css";
import type { GameShellProps } from "./types";

export function GameShell({ boardSlots, roundBadge }: Pick<GameShellProps, "boardSlots" | "roundBadge">) {
  return (
    <main className={styles.shell}>
      <RoundBadge {...roundBadge} />
      <section className={styles.grid}>
        {boardSlots.map((slot) => (
          <BoardCardSlot key={slot.slotId} {...slot} />
        ))}
      </section>
    </main>
  );
}

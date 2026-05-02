import { ActionButton } from "./ActionButton";
import styles from "./ActionBar.module.css";
import type { ActionBarProps } from "./types";

export function ActionBar({ actions, frameSrc }: ActionBarProps) {
  return (
    <section className={styles.bar} aria-label="action-bar">
      {frameSrc ? <img className={styles.frame} src={frameSrc} alt="" aria-hidden="true" /> : null}
      <div className={styles.actions}>
        {actions.map((action) => (
          <ActionButton key={action.id} {...action} />
        ))}
      </div>
    </section>
  );
}

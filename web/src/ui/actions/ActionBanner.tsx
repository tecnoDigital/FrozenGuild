import styles from "./Actions.module.css";

type ActionBannerProps = {
  title: string;
  detail: string;
  severity?: "neutral" | "your-turn" | "blocked" | "danger" | "success";
  mode?: "waiting" | "roll" | "fish" | "spy" | "swap" | "padrino" | "orca" | "seal" | "done";
};

export function ActionBanner({ title, detail, severity = "neutral", mode = "waiting" }: ActionBannerProps) {
  const severityClass =
    severity === "your-turn"
      ? styles.bannerYourTurn
      : severity === "blocked"
        ? styles.bannerBlocked
        : severity === "danger"
          ? styles.bannerDanger
          : severity === "success"
            ? styles.bannerSuccess
            : styles.bannerNeutral;

  const modeIcon =
    mode === "fish"
      ? "/src/assets/fish.png"
      : mode === "orca"
        ? "/src/assets/orca.png"
        : null;

  return (
    <div className={`${styles.banner} ${severityClass}`}>
      <strong className={styles.bannerTitle}>
        {modeIcon ? <img className={styles.bannerModeIcon} src={modeIcon} alt="" aria-hidden /> : null}
        <span>{title}</span>
      </strong>
      <p style={{ margin: "6px 0 0" }}>{detail}</p>
    </div>
  );
}

import styles from "./Actions.module.css";

type ActionBannerProps = {
  title: string;
  detail: string;
};

export function ActionBanner({ title, detail }: ActionBannerProps) {
  return (
    <div className={styles.banner}>
      <strong>{title}</strong>
      <p style={{ margin: "6px 0 0" }}>{detail}</p>
    </div>
  );
}

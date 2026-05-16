import styles from "./LobbyGlass.module.css";

export type SeatData = {
  isLocal: boolean;
  isBot: boolean;
  isWaiting: boolean;
  name: string;
  emoji: string;
  avatarSrc?: string | undefined;
  color?: string | undefined;
  status: string;
  badge: string;
};

type SeatPreviewProps = {
  seats: SeatData[];
};

export function SeatPreview({ seats }: SeatPreviewProps) {
  return (
    <div className={styles.seats}>
      {seats.map((seat, index) => {
        const classes = [
          styles.seat,
          seat.isLocal ? styles.seatLocal : "",
          seat.isBot ? styles.seatBot : "",
          seat.isWaiting ? styles.seatEmpty : "",
        ]
          .filter(Boolean)
          .join(" ");

        return (
          <article key={`seat-${index}`} className={classes}>
            <div>
              <div
                className={styles.miniAvatar}
                aria-hidden="true"
                style={{ ["--lobby-color" as string]: seat.color ?? undefined }}
              >
                {seat.avatarSrc ? <img src={seat.avatarSrc} alt="" draggable={false} /> : seat.emoji}
              </div>
              <div className={styles.seatName}>{seat.name}</div>
              <div className={styles.seatStatus}>{seat.status}</div>
            </div>
            <div className={styles.seatBadge}>{seat.badge}</div>
          </article>
        );
      })}
    </div>
  );
}

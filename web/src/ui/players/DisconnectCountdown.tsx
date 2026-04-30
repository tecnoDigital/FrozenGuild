type DisconnectCountdownProps = {
  seconds: number;
};

export function DisconnectCountdown({ seconds }: DisconnectCountdownProps) {
  return <span>{seconds}s</span>;
}

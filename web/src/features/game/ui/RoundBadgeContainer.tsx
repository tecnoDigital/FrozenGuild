import { useFrozenGuildStore } from "../../../store/frozenGuildStore";
import { selectRoundBadgeLabel } from "../../../store/selectors";
import { RoundBadge } from "./RoundBadge";

export function RoundBadgeContainer() {
  const roundLabel = useFrozenGuildStore(selectRoundBadgeLabel);

  return <RoundBadge roundLabel={roundLabel} subtitle="Frozen Guild" />;
}

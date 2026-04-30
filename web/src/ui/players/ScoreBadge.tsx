import { Badge } from "../shared/Badge.js";

type ScoreBadgeProps = {
  score: number;
};

export function ScoreBadge({ score }: ScoreBadgeProps) {
  return <Badge>{score} pts</Badge>;
}

import { Badge } from "../shared/Badge.js";

type ConnectionIssueBadgeProps = {
  status: "reconnecting" | "absent";
};

export function ConnectionIssueBadge({ status }: ConnectionIssueBadgeProps) {
  return <Badge>{status === "reconnecting" ? "Reconectando" : "Ausente"}</Badge>;
}

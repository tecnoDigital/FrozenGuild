import type { PropsWithChildren } from "react";

export function Badge({ children }: PropsWithChildren) {
  return (
    <span style={{ display: "inline-flex", borderRadius: 999, padding: "4px 10px", background: "rgba(121,187,255,0.12)" }}>
      {children}
    </span>
  );
}

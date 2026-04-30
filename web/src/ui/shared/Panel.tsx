import type { PropsWithChildren } from "react";

type PanelProps = PropsWithChildren<{ title?: string }>;

export function Panel({ title, children }: PanelProps) {
  return (
    <section style={{ border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", padding: 16, background: "var(--surface)" }}>
      {title ? <h3 style={{ margin: "0 0 8px" }}>{title}</h3> : null}
      {children}
    </section>
  );
}

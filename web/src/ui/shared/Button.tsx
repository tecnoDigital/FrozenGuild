import type { ButtonHTMLAttributes, PropsWithChildren } from "react";

type ButtonProps = PropsWithChildren<ButtonHTMLAttributes<HTMLButtonElement>>;

export function Button({ children, ...props }: ButtonProps) {
  return (
    <button
      {...props}
      style={{
        border: 0,
        borderRadius: "var(--radius-md)",
        background: "linear-gradient(135deg, var(--accent), var(--accent-2))",
        color: "#07111f",
        padding: "10px 14px",
        fontWeight: 700,
        cursor: "pointer"
      }}
    >
      {children}
    </button>
  );
}

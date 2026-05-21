import type { ButtonHTMLAttributes, ReactNode } from "react";

interface PillButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  active: boolean;
  children: ReactNode;
}

export function PillButton({ active, children, className = "", ...props }: PillButtonProps) {
  return (
    <button
      type="button"
      className={`cursor-pointer rounded-full px-3 py-1 text-xs font-medium transition-all${className ? ` ${className}` : ""}`}
      style={{
        backgroundColor: active ? "var(--md-primary-020)" : "rgba(255,255,255,0.05)",
        color: active ? "var(--md-primary)" : "var(--md-text-muted)",
      }}
      {...props}
    >
      {children}
    </button>
  );
}

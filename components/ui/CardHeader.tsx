import type { ReactNode } from "react";

interface CardHeaderProps {
  icon?: ReactNode;
  title: string;
  action?: ReactNode;
  className?: string;
}

export function CardHeader({ icon, title, action, className = "" }: CardHeaderProps) {
  return (
    <div className={`flex items-center justify-between mb-4${className ? ` ${className}` : ""}`}>
      <div className="flex items-center gap-3 min-w-0">
        {icon && (
          <span className="text-lg shrink-0" style={{ color: "var(--md-primary)" }}>
            {icon}
          </span>
        )}
        <h2
          className="font-heading text-lg font-semibold truncate"
          style={{ color: "var(--md-text-primary)" }}
          suppressHydrationWarning
        >
          {title}
        </h2>
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

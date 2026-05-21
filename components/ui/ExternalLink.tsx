import type { AnchorHTMLAttributes, ReactNode } from "react";

interface ExternalLinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string;
  children: ReactNode;
}

export function ExternalLink({ href, children, className = "", ...props }: ExternalLinkProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`text-xs shrink-0 transition-colors${className ? ` ${className}` : ""}`}
      style={{ color: "var(--md-text-muted)" }}
      onMouseEnter={(e) => (e.currentTarget.style.color = "var(--md-primary)")}
      onMouseLeave={(e) => (e.currentTarget.style.color = "var(--md-text-muted)")}
      {...props}
    >
      {children}
    </a>
  );
}

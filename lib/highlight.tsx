import type { ReactNode } from "react";

export function highlight(text: string): ReactNode {
  const parts = text.split(/(!!.+?!!)/g);
  return parts.map((part, i) => {
    if (part.startsWith("!!") && part.endsWith("!!")) {
      return <span key={i} style={{ color: "var(--md-primary)" }}>{part.slice(2, -2)}</span>;
    }
    return part;
  });
}

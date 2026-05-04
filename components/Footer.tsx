"use client";

import { siteConfig } from "@/config";
import { buildTime } from "@/lib/buildTime";

export function Footer() {
  const cfg = siteConfig.footer;
  const year = new Date().getFullYear();
  const displayText = (cfg.customHtml || cfg.text).replace(/\[year\]/g, String(year));

  const built = new Date(buildTime);
  const dateStr = `${built.getFullYear()}-${String(built.getMonth() + 1).padStart(2, "0")}-${String(built.getDate()).padStart(2, "0")}`;

  return (
    <footer className="pb-8 pt-2 text-center space-y-1">
      <p className="text-xs leading-relaxed" style={{ color: "var(--md-text-muted)" }}
        dangerouslySetInnerHTML={cfg.customHtml ? { __html: displayText } : undefined}>
        {cfg.customHtml ? undefined : displayText}
      </p>
      <p className="text-[10px]" style={{ color: "var(--md-text-muted)" }}>
        Built {dateStr}
      </p>
    </footer>
  );
}

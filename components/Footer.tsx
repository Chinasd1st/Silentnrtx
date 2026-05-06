"use client";

import { useEffect, useState } from "react";
import { siteConfig } from "@/config";
import { buildTime, commitSha } from "@/lib/buildTime";
import { useVersion } from "@/lib/version";

export function Footer() {
  const cfg = siteConfig.footer;
  const year = new Date().getFullYear();
  const displayText = (cfg.customHtml || cfg.text).replace(/\[year\]/g, String(year));
  const ver = useVersion();
  const [timeStr, setTimeStr] = useState("");

  useEffect(() => {
    const built = new Date(buildTime);
    setTimeStr(built.toLocaleString(undefined, {
      year: "numeric", month: "2-digit", day: "2-digit",
      hour: "2-digit", minute: "2-digit", timeZoneName: "short",
    }));
  }, []);

  const sha = commitSha ? `(${commitSha})` : "";
  const meta = [timeStr || "...", sha, ver || ""].filter(Boolean).join("  ·  ");

  return (
    <footer className="pb-8 pt-2 text-center space-y-2">
      <p className="text-xs leading-relaxed" style={{ color: "var(--md-text-muted)" }}
        dangerouslySetInnerHTML={cfg.customHtml ? { __html: displayText } : undefined}>
        {cfg.customHtml ? undefined : displayText}
      </p>
      <p className="text-[10px]" style={{ color: "var(--md-text-muted)" }}>
        {meta}
      </p>
    </footer>
  );
}

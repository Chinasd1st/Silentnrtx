"use client";

import DOMPurify from "isomorphic-dompurify";
import { useEffect, useMemo, useState } from "react";
import { ReleaseModal } from "@/components/features/release/ReleaseModal";
import { siteConfig } from "@/config";
import { buildTime, commitSha } from "@/lib/buildTime";
import { useVersion } from "@/lib/hooks/useVersion";
import { useTranslation } from "@/lib/i18n";

export function Footer() {
  const { i18n } = useTranslation();
  const cfg = siteConfig.footer;
  const [year, setYear] = useState(new Date().getFullYear());
  const rawText = (cfg.customHtml || cfg.text).replace(/\[year\]/g, String(year));
  const displayText = useMemo(() => DOMPurify.sanitize(rawText), [rawText]);

  useEffect(() => {
    setYear(new Date().getFullYear());
  }, []);
  const ver = useVersion();
  const [timeStr, setTimeStr] = useState("");

  useEffect(() => {
    const built = new Date(buildTime);
    setTimeStr(
      built.toLocaleString(i18n.language, {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        timeZoneName: "short",
      })
    );
  }, [i18n.language]);

  const sha = commitSha ? `(${commitSha})` : "";

  return (
    <footer className="pb-8 pt-2 text-center space-y-2">
      {cfg.customHtml ? (
        <p
          className="text-xs leading-relaxed"
          style={{ color: "var(--md-text-muted)" }}
          dangerouslySetInnerHTML={{ __html: displayText }}
        />
      ) : (
        <p className="text-xs leading-relaxed" style={{ color: "var(--md-text-muted)" }}>
          {displayText}
        </p>
      )}
      <p className="text-[10px]" style={{ color: "var(--md-text-muted)" }}>
        {[timeStr || "...", sha].filter(Boolean).join("  ·  ")}
        {ver && (
          <>
            {"  ·  "}
            <ReleaseModal version={ver} />
          </>
        )}
      </p>
    </footer>
  );
}

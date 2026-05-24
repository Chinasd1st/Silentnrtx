"use client";

import { useEffect, useState } from "react";
import { getCacheTime } from "@/lib/cache";
import { useTranslation } from "@/lib/i18n";
import { getEffectiveTimezone } from "@/lib/timezone";

export function CachedAt({ cacheKey }: { cacheKey: string }) {
  const { t, i18n } = useTranslation();
  const [tz, setTz] = useState(getEffectiveTimezone);
  const [cacheTime, setCacheTime] = useState<number | null>(null);

  useEffect(() => {
    const onSettings = () => setTz(getEffectiveTimezone());
    window.addEventListener("settings-changed", onSettings);
    return () => window.removeEventListener("settings-changed", onSettings);
  }, []);

  useEffect(() => {
    const ts = getCacheTime(cacheKey);
    if (ts) setCacheTime(ts);
  }, [cacheKey]);

  if (!cacheTime) return null;

  return (
    <p className="text-[9px] text-right mt-3" style={{ color: "var(--md-text-muted)" }}>
      {t("common.cached_at")}{" "}
      {new Date(cacheTime).toLocaleString(i18n.language, {
        timeZone: tz,
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })}
    </p>
  );
}

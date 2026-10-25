"use client";

import { useEffect, useMemo, useState } from "react";
import { FiGlobe } from "react-icons/fi";
import { Card } from "@/components/ui/Card";
import { CardHeader } from "@/components/ui/CardHeader";
import { useTranslation } from "@/lib/i18n";
import { getEffectiveTimezone } from "@/lib/timezone";

const CITIES = [
  { key: "worldclock.tokyo", tz: "Asia/Tokyo" },
  { key: "worldclock.london", tz: "Europe/London" },
  { key: "worldclock.newyork", tz: "America/New_York" },
] as const;

function formatTime(date: Date, tz: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: tz,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);
}

/** ISO-like yyyy-mm-dd in the given zone, so string compare yields a day delta. */
function dateKey(date: Date, tz: string): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: tz,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

export function WorldClockCard() {
  const { t } = useTranslation();
  const [now, setNow] = useState(() => new Date());
  const [localTz, setLocalTz] = useState(getEffectiveTimezone);

  useEffect(() => {
    // Only re-render when the minute actually changes.
    const id = setInterval(() => {
      setNow((prev) => {
        const next = new Date();
        const sameMinute =
          Math.floor(next.getTime() / 60_000) === Math.floor(prev.getTime() / 60_000);
        return sameMinute ? prev : next;
      });
    }, 5000);

    const onSettings = () => setLocalTz(getEffectiveTimezone());
    window.addEventListener("settings-changed", onSettings);
    return () => {
      clearInterval(id);
      window.removeEventListener("settings-changed", onSettings);
    };
  }, []);

  const rows = useMemo(() => {
    const baseDay = dateKey(now, localTz);
    return [{ key: "worldclock.local", tz: localTz }, ...CITIES].map((city) => {
      const day = dateKey(now, city.tz);
      return {
        ...city,
        time: formatTime(now, city.tz),
        offset: day === baseDay ? 0 : day > baseDay ? 1 : -1,
      };
    });
  }, [now, localTz]);

  return (
    <Card>
      <CardHeader icon={<FiGlobe />} title={t("worldclock.title")} />
      <div className="space-y-1">
        {rows.map((row) => (
          <div
            key={row.key}
            className="flex items-center justify-between gap-2 rounded-panel px-3 py-2"
            style={{ backgroundColor: "var(--md-primary-008)" }}
          >
            <span className="text-xs truncate" style={{ color: "var(--md-text-secondary)" }}>
              {t(row.key)}
            </span>
            <div className="flex shrink-0 items-baseline gap-2">
              {row.offset !== 0 && (
                <span className="text-[10px]" style={{ color: "var(--md-text-muted)" }}>
                  {t(row.offset > 0 ? "worldclock.day_tomorrow" : "worldclock.day_yesterday")}
                </span>
              )}
              <span
                className="font-heading text-base font-bold stat-num"
                style={{ color: "var(--md-text-primary)" }}
              >
                {row.time}
              </span>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

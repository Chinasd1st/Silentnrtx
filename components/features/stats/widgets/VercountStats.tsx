"use client";

import { useVercount } from "@vercount/react";
import { siteConfig } from "@/config";
import { useTranslation } from "@/lib/i18n";

const STAT_KEYS = ["stats.pv", "stats.uv", "stats.page_pv"] as const;

function VercountStatsInner() {
  const { t } = useTranslation();
  const { sitePv, siteUv, pagePv } = useVercount();
  const values = [sitePv, siteUv, pagePv];

  return (
    <div className="md-card md-card--static">
      <div className="flex items-center justify-between mb-4">
        <h2
          className="font-heading text-lg font-semibold truncate"
          style={{ color: "var(--md-text-primary)" }}
        >
          {t("stats.title")}
        </h2>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {STAT_KEYS.map((key, i) => (
          <div
            key={key}
            className="rounded-panel p-3 text-center"
            style={{ backgroundColor: "var(--md-primary-008)" }}
          >
            <p
              className="font-heading text-xl font-bold stat-num"
              style={{ color: "var(--md-primary)" }}
              aria-live="polite"
              aria-atomic="true"
            >
              {values[i]}
            </p>
            <p className="mt-1 text-xs" style={{ color: "var(--md-text-muted)" }}>
              {t(key)}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

export function VercountStats() {
  if (!siteConfig.vercount.enabled) return null;
  return <VercountStatsInner />;
}

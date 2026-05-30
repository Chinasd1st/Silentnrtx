"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { SiWakatime } from "react-icons/si";
import { CachedAt } from "@/components/ui/CachedAt";
import { Card } from "@/components/ui/Card";
import { CardHeader } from "@/components/ui/CardHeader";
import { ErrorCard } from "@/components/ui/ErrorCard";
import { ExternalLink } from "@/components/ui/ExternalLink";
import { CardSkeleton } from "@/components/ui/Skeleton";
import { siteConfig } from "@/config";
import { api, fetchWithRetry } from "@/lib/api";
import { fetchWithTimeout } from "@/lib/api/fetchWithTimeout";
import { fetchJsonp } from "@/lib/api/jsonp";
import { getCache, getCacheTime, setCache } from "@/lib/cache";
import { useFocusTrap } from "@/lib/hooks/useFocusTrap";
import { useTranslation } from "@/lib/i18n";
import {
  CACHE_KEY,
  CACHE_TTL,
  computeAiSum,
  type DayEntry,
  extractWakaData,
  type WakaResponse,
} from "./wakatime-shared";

const SHOW_DAYS_DEFAULT = 7;

export function WakatimeCard() {
  const { t, i18n } = useTranslation();
  const [entries, setEntries] = useState<DayEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const cfg = siteConfig.wakatime;

  const _cacheTime = getCacheTime(CACHE_KEY);

  const fetchStats = useCallback(async () => {
    if (!cfg.enabled || !cfg.embedId) {
      setLoading(false);
      return;
    }
    const cached = getCache<DayEntry[]>(CACHE_KEY, CACHE_TTL);
    if (cached) {
      setEntries(cached);
      setLoading(false);
      return;
    }
    try {
      const url = `https://wakatime.com/share/@${cfg.username}/${cfg.embedId}.json`;
      const raw = await fetchWithRetry(() => api.get<WakaResponse>(url))
        .then(({ data }) => data)
        .catch(() =>
          fetchWithTimeout(url)
            .then((r) => r.json())
            .catch(() => fetchJsonp<WakaResponse>(url))
        );
      const data = extractWakaData(raw);
      if (Array.isArray(data) && data.length > 0) {
        setEntries(data);
        setCache(CACHE_KEY, data);
      } else throw new Error("invalid");
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
    const onClear = () => fetchStats();
    window.addEventListener("cache-cleared", onClear);
    return () => window.removeEventListener("cache-cleared", onClear);
  }, [fetchStats]);

  const aiSum = useMemo(() => computeAiSum(entries), [entries]);

  const fmtNum = (n: number) => n.toLocaleString(i18n.language);

  if (!cfg.enabled || !cfg.embedId) return null;
  if (loading) return <CardSkeleton />;
  if (error) return <ErrorCard title={t("wakatime.title")} onRetry={fetchStats} />;

  const visible = entries.slice(-SHOW_DAYS_DEFAULT);
  const totalSec = entries.reduce((s, e) => s + (e.grand_total?.total_seconds || 0), 0);
  const totalH = Math.floor(totalSec / 3600);
  const totalM = Math.floor((totalSec % 3600) / 60);
  const maxDay = Math.max(...entries.map((e) => e.grand_total?.total_seconds || 0), 1);

  return (
    <>
      <Card>
        <CardHeader
          icon={<SiWakatime />}
          title={t("wakatime.title")}
          action={
            <div className="flex items-center gap-3">
              <span className="text-xs" style={{ color: "var(--md-text-muted)" }}>
                {totalH}h {totalM}m
              </span>
              <ExternalLink href={`https://wakatime.com/@${cfg.username}`}>
                @{cfg.username} &rarr;
              </ExternalLink>
            </div>
          }
        />

        <div
          className="rounded-[16px] p-3 space-y-1"
          style={{ backgroundColor: "var(--md-primary-008)" }}
          aria-live="polite"
        >
          {visible.map((day) => {
            const g = day.grand_total;
            if (!g) return null;
            const pct = (g.total_seconds / maxDay) * 100;
            return (
              <div key={day.range?.date ?? "entry"} className="flex items-center gap-2 text-xs">
                <span className="w-20 shrink-0 truncate" style={{ color: "var(--md-text-muted)" }}>
                  {day.range?.date || ""}
                </span>
                <div
                  className="flex-1 h-2 rounded-full"
                  style={{ backgroundColor: "rgba(255,255,255,0.06)" }}
                >
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${Math.max(pct, 1)}%`,
                      backgroundColor: "var(--md-primary)",
                    }}
                  />
                </div>
                <span
                  className="w-14 text-right shrink-0"
                  style={{ color: "var(--md-text-secondary)" }}
                >
                  {g.text?.replace("hrs", "h").replace("hr", "h").replace("mins", "m") || ""}
                </span>
              </div>
            );
          })}
          {entries.length > SHOW_DAYS_DEFAULT && (
            <button
              type="button"
              onClick={() => setModalOpen(true)}
              className="w-full text-center text-[10px] py-1 mt-0.5 rounded-[16px] transition-all duration-200 hover:bg-white/6 cursor-pointer"
              style={{ color: "var(--md-text-muted)" }}
            >
              {t("wakatime.show_all")} &gt;
            </button>
          )}
        </div>
        <CachedAt cacheKey={CACHE_KEY} />
      </Card>
      <WakaModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        entries={entries}
        aiSum={aiSum}
        t={t}
        fmtNum={fmtNum}
      />
    </>
  );
}

const MODAL_TITLE_ID = "waka-modal-title";

function WakaModal({
  open,
  onClose,
  entries,
  aiSum,
  t,
  fmtNum,
}: {
  open: boolean;
  onClose: () => void;
  entries: DayEntry[];
  aiSum: {
    humanAdd: number;
    humanDel: number;
    add: number;
    del: number;
    cost: number;
    agents: Record<string, number>;
  };
  t: (key: string) => string;
  fmtNum: (n: number) => string;
}) {
  const viewerRef = useFocusTrap(open);

  const maxDay = Math.max(...entries.map((e) => e.grand_total?.total_seconds || 0), 1);

  const humanTotal = aiSum.humanAdd + aiSum.humanDel;
  const aiTotal = aiSum.add + aiSum.del;
  const grand = humanTotal + aiTotal;
  const humanPct = grand > 0 ? (humanTotal / grand) * 100 : 0;

  if (!open) return null;

  return createPortal(
    <div
      ref={viewerRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4 cursor-pointer"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      onKeyDown={(e) => {
        if (e.key === "Escape") onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby={MODAL_TITLE_ID}
      tabIndex={-1}
    >
      <div
        className="relative rounded-md3 w-full max-w-lg max-h-[80vh] overflow-hidden"
        style={{
          backgroundColor: "var(--md-card-bg)",
          border: "1px solid var(--md-card-border)",
        }}
      >
        <div
          className="flex items-center justify-between px-5 py-4 border-b"
          style={{ borderColor: "rgba(255,255,255,0.06)" }}
        >
          <h2
            id={MODAL_TITLE_ID}
            className="font-heading text-base font-semibold"
            style={{ color: "var(--md-text-primary)" }}
          >
            {t("wakatime.title")} — {entries.length} {t("wakatime.days")}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label={t("wakatime.close")}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-black/50 text-white/80 hover:bg-black/70 hover:text-white transition-all cursor-pointer"
          >
            &times;
          </button>
        </div>

        <div className="overflow-y-auto max-h-[calc(80vh-57px)] p-5 space-y-1">
          {entries.map((day) => {
            const g = day.grand_total;
            if (!g) return null;
            const pct = (g.total_seconds / maxDay) * 100;
            return (
              <div
                key={day.range?.date ?? "entry"}
                className="flex items-center gap-2 text-xs rounded-[16px] p-4 transition-all duration-200 hover:bg-white/6"
              >
                <span className="w-20 shrink-0 truncate" style={{ color: "var(--md-text-muted)" }}>
                  {day.range?.date || ""}
                </span>
                <div
                  className="flex-1 h-2 rounded-full"
                  style={{ backgroundColor: "rgba(255,255,255,0.06)" }}
                >
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${Math.max(pct, 1)}%`, backgroundColor: "var(--md-primary)" }}
                  />
                </div>
                <span
                  className="w-14 text-right shrink-0"
                  style={{ color: "var(--md-text-secondary)" }}
                >
                  {g.text?.replace("hrs", "h").replace("hr", "h").replace("mins", "m") || ""}
                </span>
              </div>
            );
          })}
        </div>

        <div className="border-t px-5 py-4" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
          <p
            className="text-xs font-medium mb-3 text-center"
            style={{ color: "var(--md-text-muted)" }}
          >
            {t("wakatime.changes_pie")}
          </p>
          <div className="flex items-center justify-center gap-6">
            <svg
              width={96}
              height={96}
              viewBox="0 0 100 100"
              className="shrink-0"
              aria-label="Human vs AI code changes pie chart"
            >
              <PieSlice
                cx={50}
                cy={50}
                r={45}
                pct={grand > 0 ? humanPct : 100}
                offset={0}
                color="var(--md-accent-green)"
              />
              <PieSlice
                cx={50}
                cy={50}
                r={45}
                pct={grand > 0 ? 100 - humanPct : 0}
                offset={grand > 0 ? humanPct : 0}
                color="var(--md-accent-blue)"
              />
            </svg>
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2">
                <span
                  className="inline-block w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: "var(--md-accent-green)" }}
                />
                <span style={{ color: "var(--md-text-muted)" }}>{t("wakatime.human")}</span>
                <span style={{ color: "var(--md-text-secondary)" }}>
                  {fmtNum(humanTotal)} ({grand > 0 ? humanPct.toFixed(1) : "\u2014"}%)
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className="inline-block w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: "var(--md-accent-blue)" }}
                />
                <span style={{ color: "var(--md-text-muted)" }}>{t("wakatime.ai_short")}</span>
                <span style={{ color: "var(--md-text-secondary)" }}>
                  {fmtNum(aiTotal)} ({grand > 0 ? ((aiTotal / grand) * 100).toFixed(1) : "\u2014"}%)
                </span>
              </div>
              {aiSum.cost > 0 && Object.keys(aiSum.agents).length > 0 && (
                <div
                  className="pt-2 mt-2 border-t text-[10px]"
                  style={{ borderColor: "var(--md-card-border)" }}
                >
                  {Object.entries(aiSum.agents).map(([name, cost]) => (
                    <div key={name} className="flex justify-between gap-4">
                      <span style={{ color: "var(--md-text-muted)" }}>{name}</span>
                      <span style={{ color: "var(--md-accent-green)" }}>${cost.toFixed(2)}</span>
                    </div>
                  ))}
                  <div
                    className="flex justify-between gap-4 font-medium mt-0.5"
                    style={{ color: "var(--md-text-primary)" }}
                  >
                    <span>{t("wakatime.total")}</span>
                    <span>${aiSum.cost.toFixed(2)}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}

function PieSlice({
  cx,
  cy,
  r,
  pct,
  offset,
  color,
}: {
  cx: number;
  cy: number;
  r: number;
  pct: number;
  offset: number;
  color: string;
}) {
  if (pct <= 0) return null;
  const rad = (angle: number) => ((angle - 90) * Math.PI) / 180;
  const a1 = rad(offset * 3.6);
  const a2 = rad((offset + pct) * 3.6);
  const x1 = cx + r * Math.cos(a1);
  const y1 = cy + r * Math.sin(a1);
  const x2 = cx + r * Math.cos(a2);
  const y2 = cy + r * Math.sin(a2);
  const large = pct > 50 ? 1 : 0;
  const d = `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} Z`;
  return <path d={d} fill={color} />;
}
